import { Payment, Order } from '../models/index.js';
import wompiService from '../services/wompiService.js';
import paymentRetryService from '../services/paymentRetryService.js';

/**
 * Controlador para manejar webhooks de proveedores de pago
 * Especialmente diseñado para Wompi y Stripe
 */
const webhookController = {
  /**
   * Manejar webhook de Wompi
   */
  async handleWompi(req, res) {
    const startTime = Date.now();

    try {
      console.log('🔔 Webhook de Wompi recibido');

      const signature = req.headers['x-wompi-signature'];
      const payload = req.body;

      // Validar datos requeridos
      if (!signature) {
        console.error('❌ Webhook sin firma');
        return res.status(400).json({
          success: false,
          error: 'Missing signature header'
        });
      }

      if (!payload.transaction || !payload.event) {
        console.error('❌ Webhook con datos incompletos');
        return res.status(400).json({
          success: false,
          error: 'Invalid payload structure'
        });
      }

      // Verificar firma del webhook
      if (!wompiService.verifyWebhookSignature(signature, payload)) {
        console.error('❌ Firma del webhook inválida');
        return res.status(401).json({
          success: false,
          error: 'Invalid signature'
        });
      }

      const { transaction, event } = payload;
      console.log(`📋 Procesando evento ${event} para transacción ${transaction.id}`);

      // Procesar el webhook
      const result = await this.processWompiWebhook(transaction, event);

      const processingTime = Date.now() - startTime;
      console.log(`✅ Webhook procesado exitosamente en ${processingTime}ms`);

      res.json({
        success: true,
        message: 'Webhook processed successfully',
        processingTime: `${processingTime}ms`,
        transactionId: transaction.id,
        event: event
      });

    } catch (error) {
      const processingTime = Date.now() - startTime;
      console.error(`❌ Error procesando webhook de Wompi (${processingTime}ms):`, error);

      res.status(500).json({
        success: false,
        error: 'Internal server error',
        processingTime: `${processingTime}ms`
      });
    }
  },

  /**
   * Procesar datos del webhook de Wompi
   */
  async processWompiWebhook(transaction, event) {
    try {
      // Buscar pago por transaction_id
      const payment = await Payment.findOne({
        where: { transactionId: transaction.id },
        include: [
          {
            model: Order,
            as: 'order',
            required: true
          }
        ]
      });

      if (!payment) {
        console.log(`⚠️ Pago no encontrado para transacción ${transaction.id}`);
        return { success: false, reason: 'Payment not found' };
      }

      // Mapear estado de Wompi a nuestro estado
      const wompiStatus = transaction.status;
      const newStatus = this.mapWompiStatusToInternal(wompiStatus);

      console.log(`🔄 Actualizando pago ${payment.id} de ${payment.status} a ${newStatus}`);

      // Preparar datos de actualización
      const updateData = {
        status: newStatus,
        providerResponse: {
          ...payment.providerResponse,
          lastWebhook: {
            event,
            transaction: transaction,
            receivedAt: new Date(),
            processingResult: 'success'
          }
        },
        processedAt: new Date()
      };

      // Si el pago fue exitoso, actualizar orden
      if (newStatus === 'completed') {
        updateData.webhookAttempts = {
          ...payment.webhookAttempts,
          [Date.now()]: {
            event,
            status: 'success',
            message: 'Payment completed successfully'
          }
        };

        // Actualizar estado de la orden
        await Order.update(
          { paymentStatus: 'completed' },
          { where: { id: payment.orderId } }
        );

        console.log(`🎉 Orden ${payment.orderId} marcada como pagada`);
      }

      // Si el pago falló, programar reintento
      if (newStatus === 'failed' && payment.retryCount < 3) {
        updateData.webhookAttempts = {
          ...payment.webhookAttempts,
          [Date.now()]: {
            event,
            status: 'failed',
            message: 'Payment failed, scheduling retry'
          }
        };

        // Programar reintento automático
        await paymentRetryService.scheduleRetry(payment.id);
      }

      // Actualizar pago
      await Payment.update(updateData, { where: { id: payment.id } });

      return {
        success: true,
        paymentId: payment.id,
        oldStatus: payment.status,
        newStatus: newStatus,
        event: event
      };

    } catch (error) {
      console.error('Error procesando webhook de Wompi:', error);
      throw error;
    }
  },

  /**
   * Manejar webhook de Stripe
   */
  async handleStripe(req, res) {
    const startTime = Date.now();

    try {
      console.log('🔔 Webhook de Stripe recibido');

      const signature = req.headers['stripe-signature'];
      const payload = req.body;

      if (!signature) {
        return res.status(400).json({
          success: false,
          error: 'Missing stripe-signature header'
        });
      }

      // TODO: Implementar verificación de firma de Stripe
      // const stripe = require('stripe')(process.env.STRIPE_WEBHOOK_SECRET);
      // const event = stripe.webhooks.constructEvent(req.body, signature, endpointSecret);

      const processingTime = Date.now() - startTime;
      console.log(`⚠️ Webhook de Stripe no implementado (${processingTime}ms)`);

      res.status(501).json({
        success: false,
        error: 'Stripe webhook not implemented yet',
        processingTime: `${processingTime}ms`
      });

    } catch (error) {
      const processingTime = Date.now() - startTime;
      console.error(`❌ Error procesando webhook de Stripe (${processingTime}ms):`, error);

      res.status(500).json({
        success: false,
        error: 'Internal server error',
        processingTime: `${processingTime}ms`
      });
    }
  },

  /**
   * Mapear estados de Wompi a estados internos
   */
  mapWompiStatusToInternal(wompiStatus) {
    const statusMap = {
      'PENDING': 'pending',
      'APPROVED': 'completed',
      'DECLINED': 'failed',
      'VOIDED': 'cancelled',
      'ERROR': 'failed',
      'PROCESSING': 'processing'
    };

    return statusMap[wompiStatus] || 'pending';
  },

  /**
   * Verificar estado de transacción en Wompi
   */
  async verifyWompiTransaction(transactionId) {
    try {
      console.log(`🔍 Verificando transacción ${transactionId} en Wompi`);

      const transactionData = await wompiService.verifyTransaction(transactionId);

      return {
        transactionId: transactionData.transactionId,
        status: transactionData.status,
        amount: transactionData.amount,
        currency: transactionData.currency,
        providerResponse: transactionData.providerResponse
      };

    } catch (error) {
      console.error(`Error verificando transacción ${transactionId}:`, error);
      throw error;
    }
  },

  /**
   * Reprocesar webhook manualmente (para debugging)
   */
  async replayWebhook(req, res) {
    try {
      const { transactionId } = req.params;

      if (req.user.role !== 'admin') {
        return res.status(403).json({
          success: false,
          error: 'No autorizado'
        });
      }

      console.log(`🔄 Reprocesando webhook para transacción ${transactionId}`);

      // Obtener datos actualizados de Wompi
      const transactionData = await this.verifyWompiTransaction(transactionId);

      // Buscar pago
      const payment = await Payment.findOne({
        where: { transactionId },
        include: [{ model: Order, as: 'order' }]
      });

      if (!payment) {
        return res.status(404).json({
          success: false,
          error: 'Pago no encontrado'
        });
      }

      // Procesar actualización
      const result = await this.processWompiWebhook(transactionData.providerResponse, 'manual_replay');

      res.json({
        success: true,
        message: 'Webhook reprocesado exitosamente',
        data: result
      });

    } catch (error) {
      console.error('Error reprocesando webhook:', error);
      res.status(500).json({
        success: false,
        error: error.message
      });
    }
  },

  /**
   * Obtener historial de webhooks
   */
  async getWebhookHistory(req, res) {
    try {
      if (req.user.role !== 'admin') {
        return res.status(403).json({
          success: false,
          error: 'No autorizado'
        });
      }

      const { page = 1, limit = 20 } = req.query;
      const offset = (page - 1) * limit;

      const payments = await Payment.findAll({
        where: {
          providerResponse: {
            lastWebhook: { [Op.ne]: null }
          }
        },
        attributes: [
          'id',
          'transactionId',
          'status',
          'provider',
          'createdAt',
          'processedAt'
        ],
        include: [
          {
            model: Order,
            as: 'order',
            attributes: ['id', 'total']
          }
        ],
        order: [['processedAt', 'DESC']],
        limit: parseInt(limit),
        offset: parseInt(offset)
      });

      const total = await Payment.count({
        where: {
          providerResponse: {
            lastWebhook: { [Op.ne]: null }
          }
        }
      });

      res.json({
        success: true,
        data: {
          webhooks: payments.map(p => ({
            paymentId: p.id,
            transactionId: p.transactionId,
            status: p.status,
            provider: p.provider,
            orderId: p.order.id,
            orderTotal: p.order.total,
            lastWebhook: p.providerResponse.lastWebhook,
            createdAt: p.createdAt,
            processedAt: p.processedAt
          })),
          pagination: {
            page: parseInt(page),
            limit: parseInt(limit),
            total,
            pages: Math.ceil(total / limit)
          }
        }
      });

    } catch (error) {
      console.error('Error obteniendo historial de webhooks:', error);
      res.status(500).json({
        success: false,
        error: error.message
      });
    }
  }
};

export default webhookController;