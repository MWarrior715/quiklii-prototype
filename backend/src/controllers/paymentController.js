const { ValidationError } = require('sequelize');
const { Payment, Order, User } = require('../models/index.js');
const wompiService = require('../services/wompiService.js');
const paymentRetryService = require('../services/paymentRetryService.js');

/**
 * Controlador específico para manejo de pagos
 * Separado del controlador de órdenes para mejor organización
 */
const paymentController = {
  /**
   * Crear un nuevo intento de pago
   */
  async createPayment(req, res) {
    try {
      const { orderId, paymentMethod, provider = 'wompi' } = req.body;
      const userId = req.user.id;

      // Verificar que la orden existe y pertenece al usuario
      const order = await Order.findByPk(orderId, {
        include: [{ model: Payment, as: 'payments' }]
      });

      if (!order) {
        return res.status(404).json({
          success: false,
          error: 'Orden no encontrada'
        });
      }

      if (order.userId !== userId) {
        return res.status(403).json({
          success: false,
          error: 'No autorizado para pagar esta orden'
        });
      }

      // Verificar si ya existe un pago exitoso
      const existingPayment = order.payments?.find(p => p.status === 'completed');
      if (existingPayment) {
        return res.status(400).json({
          success: false,
          error: 'La orden ya ha sido pagada'
        });
      }

      // Crear o actualizar pago
      let payment = order.payments?.[0];
      if (payment) {
        // Actualizar pago existente
        payment.paymentMethod = paymentMethod;
        payment.provider = provider;
        payment.status = 'pending';
        payment.retryCount = 0;
        await payment.save();
      } else {
        // Crear nuevo pago
        payment = await Payment.create({
          orderId,
          userId,
          amount: order.total,
          currency: 'COP',
          paymentMethod,
          provider,
          status: 'pending'
        });
      }

      // Procesar pago según el proveedor
      const paymentResult = await this.processPayment(payment, order);

      res.status(201).json({
        success: true,
        data: {
          paymentId: payment.id,
          transactionId: paymentResult.transactionId,
          redirectUrl: paymentResult.redirectUrl,
          status: paymentResult.status,
          provider: payment.provider
        }
      });

    } catch (error) {
      console.error('Error al crear pago:', error);
      res.status(500).json({
        success: false,
        error: error.message
      });
    }
  },

  /**
   * Procesar pago con el proveedor correspondiente
   */
  async processPayment(payment, order) {
    try {
      let result;

      switch (payment.provider) {
        case 'wompi':
          result = await this.processWompiPayment(payment, order);
          break;
        case 'stripe':
          result = await this.processStripePayment(payment, order);
          break;
        case 'internal':
          result = await this.processInternalPayment(payment, order);
          break;
        default:
          throw new Error(`Proveedor ${payment.provider} no soportado`);
      }

      // Actualizar pago con información del proveedor
      payment.transactionId = result.transactionId;
      payment.providerReference = result.reference;
      payment.providerResponse = result.providerResponse;
      payment.status = result.status;
      await payment.save();

      return result;
    } catch (error) {
      // Actualizar pago con error
      payment.status = 'failed';
      payment.errorMessage = error.message;
      await payment.save();
      throw error;
    }
  },

  /**
   * Procesar pago con Wompi
   */
  async processWompiPayment(payment, order) {
    const paymentData = {
      amount: payment.amount,
      currency: payment.currency,
      reference: `QUIKLII_${payment.id}_${Date.now()}`,
      customerEmail: req.user.email,
      customerData: {
        fullName: req.user.name,
        phone: req.user.phone,
        legalId: req.user.legalId,
        legalIdType: req.user.legalIdType || 'CC'
      },
      redirectUrl: `${process.env.FRONTEND_URL}/orders/${order.id}/payment-result`,
      paymentMethod: payment.paymentMethod
    };

    return await wompiService.createPayment(paymentData);
  },

  /**
   * Procesar pago con Stripe
   */
  async processStripePayment(payment, order) {
    // TODO: Implementar cuando se integre Stripe
    throw new Error('Stripe integration not implemented yet');
  },

  /**
   * Procesar pago interno (cash, etc.)
   */
  async processInternalPayment(payment, order) {
    return {
      transactionId: `internal_${payment.id}`,
      reference: `QUIKLII_INTERNAL_${payment.id}`,
      status: 'pending',
      providerResponse: { method: 'internal' }
    };
  },

  /**
   * Obtener estado de un pago
   */
  async getPaymentStatus(req, res) {
    try {
      const { paymentId } = req.params;
      const userId = req.user.id;

      const payment = await Payment.findByPk(paymentId, {
        include: [
          {
            model: Order,
            as: 'order',
            include: [{ model: User, as: 'user' }]
          }
        ]
      });

      if (!payment) {
        return res.status(404).json({
          success: false,
          error: 'Pago no encontrado'
        });
      }

      // Verificar autorización
      if (payment.userId !== userId && req.user.role !== 'admin') {
        return res.status(403).json({
          success: false,
          error: 'No autorizado'
        });
      }

      res.json({
        success: true,
        data: {
          paymentId: payment.id,
          orderId: payment.orderId,
          amount: payment.amount,
          currency: payment.currency,
          status: payment.status,
          paymentMethod: payment.paymentMethod,
          provider: payment.provider,
          transactionId: payment.transactionId,
          createdAt: payment.createdAt,
          processedAt: payment.processedAt
        }
      });

    } catch (error) {
      console.error('Error al obtener estado de pago:', error);
      res.status(500).json({
        success: false,
        error: error.message
      });
    }
  },

  /**
   * Listar pagos del usuario
   */
  async getUserPayments(req, res) {
    try {
      const userId = req.user.id;
      const { page = 1, limit = 10 } = req.query;

      const offset = (page - 1) * limit;

      const { rows: payments, count: total } = await Payment.findAndCountAll({
        where: { userId },
        include: [
          {
            model: Order,
            as: 'order',
            include: [{ model: User, as: 'restaurant' }]
          }
        ],
        order: [['createdAt', 'DESC']],
        limit: parseInt(limit),
        offset: parseInt(offset)
      });

      res.json({
        success: true,
        data: {
          payments: payments.map(p => ({
            paymentId: p.id,
            orderId: p.orderId,
            amount: p.amount,
            currency: p.currency,
            status: p.status,
            paymentMethod: p.paymentMethod,
            provider: p.provider,
            transactionId: p.transactionId,
            createdAt: p.createdAt,
            restaurantName: p.order?.restaurant?.name
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
      console.error('Error al obtener pagos del usuario:', error);
      res.status(500).json({
        success: false,
        error: error.message
      });
    }
  },

  /**
   * Webhook para procesar confirmaciones de pago
   */
  async handleWebhook(req, res) {
    try {
      const signature = req.headers['x-wompi-signature'];
      const payload = req.body;

      if (!signature) {
        return res.status(400).json({
          success: false,
          error: 'Missing signature'
        });
      }

      // Verificar firma del webhook
      if (!wompiService.verifyWebhookSignature(signature, payload)) {
        return res.status(401).json({
          success: false,
          error: 'Invalid signature'
        });
      }

      const webhookData = wompiService.processWebhookData(payload);

      // Actualizar estado del pago
      const payment = await Payment.findOne({
        where: { transactionId: webhookData.transactionId }
      });

      if (!payment) {
        return res.status(404).json({
          success: false,
          error: 'Payment not found'
        });
      }

      // Actualizar pago con información del webhook
      payment.status = webhookData.status;
      payment.providerResponse = {
        ...payment.providerResponse,
        ...webhookData.providerResponse
      };
      payment.processedAt = new Date();

      if (webhookData.status === 'completed') {
        // Actualizar orden si el pago fue exitoso
        await Order.update(
          { paymentStatus: 'completed' },
          { where: { id: payment.orderId } }
        );
      }

      await payment.save();

      // Procesar reintentos si es necesario
      if (webhookData.status === 'failed' && payment.retryCount < 3) {
        await paymentRetryService.scheduleRetry(payment.id);
      }

      res.json({
        success: true,
        message: 'Webhook processed successfully'
      });

    } catch (error) {
      console.error('Error processing webhook:', error);
      res.status(500).json({
        success: false,
        error: error.message
      });
    }
  },

  /**
   * Reintentar un pago fallido
   */
  async retryPayment(req, res) {
    try {
      const { paymentId } = req.params;
      const userId = req.user.id;

      const payment = await Payment.findByPk(paymentId);

      if (!payment) {
        return res.status(404).json({
          success: false,
          error: 'Pago no encontrado'
        });
      }

      if (payment.userId !== userId && req.user.role !== 'admin') {
        return res.status(403).json({
          success: false,
          error: 'No autorizado'
        });
      }

      if (payment.status === 'completed') {
        return res.status(400).json({
          success: false,
          error: 'El pago ya está completado'
        });
      }

      // Cargar orden relacionada
      const order = await Order.findByPk(payment.orderId);

      // Reintentar pago
      const result = await this.processPayment(payment, order);

      res.json({
        success: true,
        data: {
          paymentId: payment.id,
          transactionId: result.transactionId,
          redirectUrl: result.redirectUrl,
          status: result.status
        }
      });

    } catch (error) {
      console.error('Error al reintentar pago:', error);
      res.status(500).json({
        success: false,
        error: error.message
      });
    }
  },

  /**
   * Obtener estadísticas de pagos (solo admin)
   */
  async getPaymentStats(req, res) {
    try {
      if (req.user.role !== 'admin') {
        return res.status(403).json({
          success: false,
          error: 'No autorizado'
        });
      }

      const stats = await Payment.findAll({
        attributes: [
          'status',
          'provider',
          'paymentMethod',
          [sequelize.fn('COUNT', sequelize.col('id')), 'count'],
          [sequelize.fn('SUM', sequelize.col('amount')), 'total']
        ],
        group: ['status', 'provider', 'paymentMethod'],
        raw: true
      });

      const totalPayments = await Payment.count();
      const totalRevenue = await Payment.sum('amount', {
        where: { status: 'completed' }
      });

      res.json({
        success: true,
        data: {
          stats,
          summary: {
            totalPayments,
            totalRevenue: totalRevenue || 0
          }
        }
      });

    } catch (error) {
      console.error('Error al obtener estadísticas de pagos:', error);
      res.status(500).json({
        success: false,
        error: error.message
      });
    }
  }
};

module.exports = paymentController;