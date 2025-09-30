import { Payment, Order } from '../models/index.js';
import wompiService from './wompiService.js';
import { Op } from 'sequelize';

/**
 * Servicio para manejar reintentos automáticos de pagos fallidos
 */
class PaymentRetryService {
  constructor() {
    this.maxRetries = 3;
    this.retryDelays = [
      5 * 60 * 1000,      // 5 minutos
      30 * 60 * 1000,     // 30 minutos
      2 * 60 * 60 * 1000  // 2 horas
    ];
  }

  /**
   * Procesar todos los pagos fallidos que requieren reintento
   */
  async processFailedPayments() {
    try {
      console.log('🔄 Procesando pagos fallidos para reintento...');

      const failedPayments = await Payment.findAll({
        where: {
          status: 'failed',
          retryCount: { [Op.lt]: this.maxRetries },
          [Op.or]: [
            { lastRetryAt: null },
            { lastRetryAt: { [Op.lt]: new Date(Date.now() - this.getNextRetryDelay(0)) } }
          ]
        },
        include: [
          {
            model: Order,
            as: 'order',
            required: true
          }
        ]
      });

      console.log(`📋 Encontrados ${failedPayments.length} pagos para reintentar`);

      const results = {
        successful: 0,
        failed: 0,
        skipped: 0
      };

      for (const payment of failedPayments) {
        try {
          const success = await this.retryPayment(payment);

          if (success) {
            results.successful++;
          } else {
            results.failed++;
          }
        } catch (error) {
            console.error(`Error al reintentar pago ${payment.id}:`, error);
            results.failed++;
          }
        }

      console.log('✅ Procesamiento de reintentos completado:', results);
      return results;

    } catch (error) {
      console.error('Error procesando pagos fallidos:', error);
      throw error;
    }
  }

  /**
   * Reintentar un pago específico
   */
  async retryPayment(payment) {
    try {
      console.log(`🔄 Reintentando pago ${payment.id} (intento ${payment.retryCount + 1}/${this.maxRetries})`);

      // Verificar que no haya excedido el límite de reintentos
      if (payment.retryCount >= this.maxRetries) {
        console.log(`⏭️ Pago ${payment.id} ha excedido el límite de reintentos`);
        return false;
      }

      // Determinar el proveedor alternativo
      const newProvider = this.getAlternativeProvider(payment.provider);

      // Crear nuevo intento de pago
      const newPayment = await this.createRetryPayment(payment, newProvider);

      // Actualizar contador del pago original
      payment.retryCount += 1;
      payment.lastRetryAt = new Date();
      await payment.save();

      console.log(`✅ Pago ${payment.id} reintentado exitosamente con nuevo pago ${newPayment.id}`);
      return true;

    } catch (error) {
      console.error(`❌ Error al reintentar pago ${payment.id}:`, error);

      // Actualizar contador de errores
      payment.retryCount += 1;
      payment.lastRetryAt = new Date();
      payment.errorMessage = error.message;
      await payment.save();

      return false;
    }
  }

  /**
   * Crear un nuevo pago para reintento
   */
  async createRetryPayment(originalPayment, newProvider) {
    // Crear nuevo pago basado en el original
    const retryPayment = await Payment.create({
      orderId: originalPayment.orderId,
      userId: originalPayment.userId,
      amount: originalPayment.amount,
      currency: originalPayment.currency,
      paymentMethod: originalPayment.paymentMethod,
      provider: newProvider,
      status: 'pending',
      retryCount: 0,
      metadata: {
        ...originalPayment.metadata,
        isRetry: true,
        originalPaymentId: originalPayment.id,
        retryReason: 'automatic_retry'
      }
    });

    // Procesar el nuevo pago
    const paymentController = (await import('../controllers/paymentController.js')).default;
    const order = await Order.findByPk(originalPayment.orderId);

    const result = await paymentController.processPayment(retryPayment, order);

    // Actualizar el nuevo pago con el resultado
    retryPayment.transactionId = result.transactionId;
    retryPayment.providerReference = result.reference;
    retryPayment.providerResponse = result.providerResponse;
    retryPayment.status = result.status;
    await retryPayment.save();

    return retryPayment;
  }

  /**
   * Programar un reintento para más tarde
   */
  async scheduleRetry(paymentId, delayMinutes = null) {
    try {
      const payment = await Payment.findByPk(paymentId);

      if (!payment) {
        throw new Error('Pago no encontrado');
      }

      // Calcular delay basado en el número de reintentos
      const retryNumber = payment.retryCount;
      const delay = delayMinutes
        ? delayMinutes * 60 * 1000
        : this.retryDelays[Math.min(retryNumber, this.retryDelays.length - 1)];

      // Programar reintento
      setTimeout(async () => {
        try {
          await this.retryPayment(payment);
        } catch (error) {
          console.error(`Error en reintento programado para pago ${paymentId}:`, error);
        }
      }, delay);

      console.log(`⏰ Reintento programado para pago ${paymentId} en ${Math.round(delay / 60000)} minutos`);

    } catch (error) {
      console.error('Error programando reintento:', error);
      throw error;
    }
  }

  /**
   * Obtener proveedor alternativo para reintentos
   */
  getAlternativeProvider(currentProvider) {
    const providers = ['wompi', 'stripe', 'internal'];
    const currentIndex = providers.indexOf(currentProvider);

    if (currentIndex === -1) {
      return 'wompi'; // Default fallback
    }

    // Rotar al siguiente proveedor
    const nextIndex = (currentIndex + 1) % providers.length;
    return providers[nextIndex];
  }

  /**
   * Obtener delay para el próximo reintento
   */
  getNextRetryDelay(retryCount) {
    return this.retryDelays[Math.min(retryCount, this.retryDelays.length - 1)];
  }

  /**
   * Obtener estadísticas de reintentos
   */
  async getRetryStats() {
    try {
      const stats = await Payment.findAll({
        where: {
          retryCount: { [Op.gt]: 0 }
        },
        attributes: [
          'status',
          'provider',
          'retryCount',
          [sequelize.fn('COUNT', sequelize.col('id')), 'count']
        ],
        group: ['status', 'provider', 'retryCount'],
        raw: true
      });

      const totalRetries = await Payment.count({
        where: { retryCount: { [Op.gt]: 0 } }
      });

      const successfulRetries = await Payment.count({
        where: {
          retryCount: { [Op.gt]: 0 },
          status: 'completed'
        }
      });

      return {
        totalRetries,
        successfulRetries,
        successRate: totalRetries > 0 ? (successfulRetries / totalRetries) * 100 : 0,
        statsByStatus: stats
      };

    } catch (error) {
      console.error('Error obteniendo estadísticas de reintentos:', error);
      throw error;
    }
  }

  /**
   * Limpiar reintentos antiguos (más de 30 días)
   */
  async cleanupOldRetries() {
    try {
      const thirtyDaysAgo = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000);

      const deletedCount = await Payment.destroy({
        where: {
          retryCount: { [Op.gt]: 0 },
          status: { [Op.in]: ['failed', 'cancelled'] },
          updatedAt: { [Op.lt]: thirtyDaysAgo }
        }
      });

      console.log(`🧹 Limpiados ${deletedCount} reintentos antiguos`);
      return deletedCount;

    } catch (error) {
      console.error('Error limpiando reintentos antiguos:', error);
      throw error;
    }
  }

  /**
   * Forzar reintento inmediato de un pago
   */
  async forceRetry(paymentId) {
    try {
      const payment = await Payment.findByPk(paymentId);

      if (!payment) {
        throw new Error('Pago no encontrado');
      }

      if (payment.status !== 'failed') {
        throw new Error('Solo se pueden reintentar pagos fallidos');
      }

      return await this.retryPayment(payment);

    } catch (error) {
      console.error('Error forzando reintento:', error);
      throw error;
    }
  }

  /**
   * Obtener pagos que requieren reintento manual
   */
  async getPaymentsNeedingManualReview() {
    try {
      return await Payment.findAll({
        where: {
          status: 'failed',
          retryCount: { [Op.gte]: this.maxRetries }
        },
        include: [
          {
            model: Order,
            as: 'order',
            include: ['user', 'restaurant']
          }
        ],
        order: [['lastRetryAt', 'DESC']]
      });

    } catch (error) {
      console.error('Error obteniendo pagos para revisión manual:', error);
      throw error;
    }
  }
}

export default new PaymentRetryService();