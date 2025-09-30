/**
 * Servicio de integración con Wompi para pagos en Colombia
 * Compatible con la API de Wompi v1
 */
class WompiService {
  constructor() {
    this.baseURL = process.env.WOMPI_SANDBOX_URL || 'https://sandbox.wompi.co/v1';
    this.publicKey = process.env.WOMPI_PUBLIC_KEY;
    this.privateKey = process.env.WOMPI_PRIVATE_KEY;
    this.webhookSecret = process.env.WOMPI_WEBHOOK_SECRET;
    this.isProduction = process.env.NODE_ENV === 'production';
  }

  /**
   * Crear una nueva transacción de pago
   */
  async createPayment(paymentData) {
    const {
      amount,
      currency = 'COP',
      reference,
      customerEmail,
      customerData,
      redirectUrl,
      paymentMethod = 'CARD'
    } = paymentData;

    try {
      // Validar datos requeridos
      this.validatePaymentData(paymentData);

      // Crear payload para Wompi
      const payload = {
        amount_in_cents: Math.round(amount * 100), // Wompi usa centavos
        currency: currency.toUpperCase(),
        customer_email: customerEmail,
        reference,
        payment_method: {
          type: paymentMethod,
          installments: 1
        },
        redirect_url: redirectUrl,
        customer_data: {
          phone_number: customerData.phone,
          full_name: customerData.fullName,
          legal_id: customerData.legalId,
          legal_id_type: customerData.legalIdType || 'CC'
        }
      };

      // Realizar petición a Wompi
      const response = await fetch(`${this.baseURL}/transactions`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${this.privateKey}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(payload)
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(`Wompi error: ${data.error?.message || 'Unknown error'}`);
      }

      // Mapear respuesta de Wompi a nuestro formato
      return {
        transactionId: data.data.id,
        reference: data.data.reference,
        redirectUrl: data.data.payment_method?.extra?.redirect_url,
        status: this.mapWompiStatus(data.data.status),
        providerResponse: data.data,
        createdAt: new Date(data.data.created_at),
        currency: data.data.currency,
        amount: data.data.amount_in_cents / 100
      };
    } catch (error) {
      console.error('Wompi payment creation failed:', error);
      throw new Error(`Payment creation failed: ${error.message}`);
    }
  }

  /**
   * Verificar el estado de una transacción
   */
  async verifyTransaction(transactionId) {
    try {
      const response = await fetch(`${this.baseURL}/transactions/${transactionId}`, {
        headers: {
          'Authorization': `Bearer ${this.privateKey}`
        }
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(`Wompi verification error: ${data.error?.message || 'Unknown error'}`);
      }

      return {
        transactionId: data.data.id,
        reference: data.data.reference,
        status: this.mapWompiStatus(data.data.status),
        amount: data.data.amount_in_cents / 100,
        currency: data.data.currency,
        paymentMethod: data.data.payment_method,
        customerEmail: data.data.customer_email,
        createdAt: new Date(data.data.created_at),
        finalizedAt: data.data.finalized_at ? new Date(data.data.finalized_at) : null,
        providerResponse: data.data
      };
    } catch (error) {
      console.error('Wompi transaction verification failed:', error);
      throw error;
    }
  }

  /**
   * Verificar la firma del webhook de Wompi
   */
  verifyWebhookSignature(signature, payload) {
    try {
      const crypto = require('crypto');

      // Wompi usa SHA-256 HMAC
      const expectedSignature = crypto
        .createHmac('sha256', this.webhookSecret)
        .update(JSON.stringify(payload))
        .digest('hex');

      // Comparar firmas de manera segura (timing attack resistant)
      return crypto.timingSafeEqual(
        Buffer.from(signature, 'hex'),
        Buffer.from(expectedSignature, 'hex')
      );
    } catch (error) {
      console.error('Webhook signature verification failed:', error);
      return false;
    }
  }

  /**
   * Procesar datos del webhook de Wompi
   */
  processWebhookData(payload) {
    const { transaction, event } = payload;

    return {
      transactionId: transaction.id,
      reference: transaction.reference,
      status: this.mapWompiStatus(transaction.status),
      amount: transaction.amount_in_cents / 100,
      currency: transaction.currency,
      paymentMethod: transaction.payment_method,
      customerEmail: transaction.customer_email,
      eventType: event,
      processedAt: new Date(),
      providerResponse: transaction
    };
  }

  /**
   * Mapear estados de Wompi a nuestros estados internos
   */
  mapWompiStatus(wompiStatus) {
    const statusMap = {
      'PENDING': 'pending',
      'APPROVED': 'completed',
      'DECLINED': 'failed',
      'VOIDED': 'cancelled',
      'ERROR': 'failed',
      'PROCESSING': 'processing'
    };

    return statusMap[wompiStatus] || 'pending';
  }

  /**
   * Validar datos de pago requeridos
   */
  validatePaymentData(paymentData) {
    const required = ['amount', 'reference', 'customerEmail', 'customerData', 'redirectUrl'];

    for (const field of required) {
      if (!paymentData[field]) {
        throw new Error(`Field ${field} is required`);
      }
    }

    if (paymentData.amount <= 0) {
      throw new Error('Amount must be greater than 0');
    }

    // Validar email
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(paymentData.customerEmail)) {
      throw new Error('Invalid customer email format');
    }
  }

  /**
   * Obtener métodos de pago soportados por Wompi
   */
  getSupportedPaymentMethods() {
    return [
      'CARD',      // Tarjeta de crédito/débito
      'NEQUI',     // Nequi wallet
      'BANCOLOMBIA_TRANSFER', // Transferencia Bancolombia
      'BANCOLOMBIA_COLLECT'   // Recaudo Bancolombia
    ];
  }

  /**
   * Calcular monto en centavos para Wompi
   */
  calculateCents(amount) {
    return Math.round(amount * 100);
  }

  /**
   * Formatear monto desde centavos
   */
  formatAmountFromCents(cents) {
    return cents / 100;
  }

  /**
   * Verificar si el servicio está configurado correctamente
   */
  isConfigured() {
    return !!(this.privateKey && this.publicKey && this.webhookSecret);
  }

  /**
   * Obtener URL base según el ambiente
   */
  getBaseUrl() {
    if (this.isProduction) {
      return 'https://api.wompi.co/v1';
    }
    return this.baseURL;
  }
}

export default new WompiService();