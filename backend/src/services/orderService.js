import { Order, OrderItem, Restaurant, MenuItem, User, Payment } from '../models/index.js';
import { sequelize } from '../config/database.js';
import { initializeOrderSockets } from '../sockets/orderUpdates.js';

class OrderService {
  /**
   * Crear un nuevo pedido
   */
  async createOrder(orderData, userId, io = null) {
    const transaction = await sequelize.transaction();

    try {
      const { restaurantId, items, deliveryAddress, deliveryInstructions, paymentMethod } = orderData;

      // Verificar que el restaurante existe
      const restaurant = await Restaurant.findByPk(restaurantId);
      if (!restaurant) {
        throw new Error('Restaurante no encontrado');
      }

      // Calcular el total y validar items
      let total = 0;
      const orderItems = [];

      for (const item of items) {
        const menuItem = await MenuItem.findByPk(item.menuItemId);
        if (!menuItem) {
          throw new Error(`Item de menú ${item.menuItemId} no encontrado`);
        }

        const itemTotal = menuItem.price * item.quantity;
        total += itemTotal;

        orderItems.push({
          menuItemId: menuItem.id,
          quantity: item.quantity,
          unitPrice: menuItem.price,
          totalPrice: itemTotal,
          specialInstructions: item.specialInstructions,
          selectedModifiers: item.selectedModifiers || []
        });
      }

      const orderTotal = total + restaurant.deliveryFee;

      // Crear el pedido
      const order = await Order.create({
        userId,
        restaurantId,
        total: orderTotal,
        deliveryFee: restaurant.deliveryFee,
        deliveryAddress,
        deliveryInstructions,
        paymentMethod,
        estimatedDeliveryTime: new Date(Date.now() + restaurant.estimatedDeliveryTime * 60000)
      }, { transaction });

      // Crear los items del pedido
      await Promise.all(
        orderItems.map(item => OrderItem.create({ ...item, orderId: order.id }, { transaction }))
      );

      // Crear el pago inicial
      await Payment.create({
        orderId: order.id,
        userId,
        amount: orderTotal,
        paymentMethod,
        provider: this.getPaymentProvider(paymentMethod),
        status: 'pending'
      }, { transaction });

      await transaction.commit();

      // Cargar el pedido completo con sus relaciones
      const completeOrder = await this.getOrderById(order.id);

      // Notificar al restaurante si hay socket disponible
      if (io) {
        const { notifyNewOrder } = initializeOrderSockets(io);
        notifyNewOrder(restaurantId, completeOrder);
      }

      return completeOrder;
    } catch (error) {
      await transaction.rollback();
      throw error;
    }
  }

  /**
   * Obtener un pedido específico con todos sus detalles
   */
  async getOrderById(orderId) {
    const order = await Order.findByPk(orderId, {
      include: [
        { 
          model: OrderItem,
          as: 'items',
          include: [{ model: MenuItem, as: 'menuItem' }]
        },
        { model: Restaurant, as: 'restaurant' },
        { 
          model: User,
          as: 'user',
          attributes: ['id', 'name', 'email', 'phone']
        }
      ]
    });

    if (!order) {
      throw new Error('Pedido no encontrado');
    }

    return order;
  }

  /**
   * Obtener todos los pedidos de un usuario
   */
  async getUserOrders(userId) {
    return await Order.findAll({
      where: { userId },
      include: [
        {
          model: OrderItem,
          as: 'items',
          include: [{ model: MenuItem, as: 'menuItem' }]
        },
        { model: Restaurant, as: 'restaurant' }
      ],
      order: [['created_at', 'DESC']]
    });
  }

  /**
   * Obtener pedidos de un restaurante
   */
  async getRestaurantOrders(restaurantId) {
    return await Order.findAll({
      where: { restaurantId },
      include: [
        {
          model: OrderItem,
          as: 'items',
          include: [{ model: MenuItem, as: 'menuItem' }]
        },
        {
          model: User,
          as: 'user',
          attributes: ['id', 'name', 'email', 'phone']
        }
      ],
      order: [['createdAt', 'DESC']]
    });
  }

  /**
   * Actualizar el estado de un pedido
   */
  async updateOrderStatus(orderId, status, userId, userRole, io = null) {
    const order = await Order.findByPk(orderId);

    if (!order) {
      throw new Error('Pedido no encontrado');
    }

    // Validar que el estado es válido
    const validStatuses = ['pending', 'confirmed', 'preparing', 'on_the_way', 'delivered', 'cancelled'];
    if (!validStatuses.includes(status)) {
      throw new Error('Estado inválido');
    }

    // Validar permisos según el rol
    if (userRole === 'user' && userId !== order.userId) {
      throw new Error('No autorizado');
    }

    const oldStatus = order.status;
    order.status = status;
    await order.save();

    // Notificar al usuario si hay socket disponible
    if (io && oldStatus !== status) {
      const { notifyOrderStatusChange } = initializeOrderSockets(io);
      const updatedOrder = await this.getOrderById(orderId);
      notifyOrderStatusChange(order.userId, updatedOrder);
    }

    return order;
  }

  /**
   * Calcular métricas de pedidos para un restaurante
   */
  async getRestaurantOrderMetrics(restaurantId) {
    const [totalOrders, totalRevenue, averageOrderValue] = await Promise.all([
      Order.count({ where: { restaurantId } }),
      Order.sum('total', { where: { restaurantId } }),
      Order.findOne({
        where: { restaurantId },
        attributes: [[sequelize.fn('AVG', sequelize.col('total')), 'average']],
        raw: true
      })
    ]);

    return {
      totalOrders,
      totalRevenue: totalRevenue || 0,
      averageOrderValue: averageOrderValue?.average || 0
    };
  }

  /**
   * Obtener pedidos pendientes de un restaurante
   */
  async getPendingOrders(restaurantId) {
    return await Order.findAll({
      where: {
        restaurantId,
        status: ['pending', 'confirmed', 'preparing']
      },
      include: [
        {
          model: OrderItem,
          as: 'items',
          include: [{ model: MenuItem, as: 'menuItem' }]
        },
        {
          model: User,
          as: 'user',
          attributes: ['id', 'name', 'email', 'phone']
        }
      ],
      order: [['createdAt', 'ASC']]
    });
  }

  /**
   * Determinar el proveedor de pago basado en el método
   */
  getPaymentProvider(paymentMethod) {
    const wompiMethods = ['card', 'nequi', 'daviplata'];
    const stripeMethods = ['card', 'mercadopago'];

    if (wompiMethods.includes(paymentMethod)) return 'wompi';
    if (stripeMethods.includes(paymentMethod)) return 'stripe';
    return 'internal';
  }

  /**
   * Iniciar un pago con proveedor externo (Wompi/Stripe)
   */
  async initiatePayment(orderId, userId) {
    const order = await Order.findByPk(orderId, {
      include: [{ model: Payment, as: 'payments' }]
    });

    if (!order) {
      throw new Error('Pedido no encontrado');
    }

    if (order.userId !== userId) {
      throw new Error('No autorizado');
    }

    const payment = order.payments?.[0];
    if (!payment) {
      throw new Error('Pago no encontrado');
    }

    if (payment.status !== 'pending') {
      throw new Error('El pago ya ha sido procesado');
    }

    // Simular llamada a API de Wompi o Stripe
    const paymentData = await this.mockPaymentProvider(payment);

    payment.transactionId = paymentData.transactionId;
    payment.reference = paymentData.reference;
    payment.paymentData = paymentData;
    payment.status = 'processing';
    await payment.save();

    return {
      paymentId: payment.id,
      redirectUrl: paymentData.redirectUrl,
      transactionId: payment.transactionId
    };
  }

  /**
   * Confirmar un pago desde webhook o callback
   */
  async confirmPayment(transactionId, paymentData) {
    const payment = await Payment.findOne({
      where: { transactionId },
      include: [{ model: Order, as: 'order' }]
    });

    if (!payment) {
      throw new Error('Pago no encontrado');
    }

    if (payment.status === 'completed') {
      return payment; // Ya confirmado
    }

    payment.status = paymentData.status === 'APPROVED' ? 'completed' : 'failed';
    payment.processedAt = new Date();
    payment.paymentData = { ...payment.paymentData, ...paymentData };
    await payment.save();

    // Actualizar estado del pedido si el pago fue exitoso
    if (payment.status === 'completed') {
      payment.order.paymentStatus = 'completed';
      await payment.order.save();
    }

    return payment;
  }

  /**
   * Procesar pago en efectivo (sin proveedor externo)
   */
  async processCashPayment(orderId, userId) {
    const order = await Order.findByPk(orderId, {
      include: [{ model: Payment, as: 'payments' }]
    });

    if (!order) {
      throw new Error('Pedido no encontrado');
    }

    if (order.userId !== userId) {
      throw new Error('No autorizado');
    }

    const payment = order.payments?.[0];
    if (!payment) {
      throw new Error('Pago no encontrado');
    }

    if (payment.paymentMethod !== 'cash') {
      throw new Error('Este método no es válido para pagos en efectivo');
    }

    payment.status = 'completed';
    payment.processedAt = new Date();
    await payment.save();

    order.paymentStatus = 'completed';
    await order.save();

    return payment;
  }

  /**
   * Mock de proveedores de pago (Wompi/Stripe)
   */
  async mockPaymentProvider(payment) {
    // Simular delay de red
    await new Promise(resolve => setTimeout(resolve, 1000));

    const transactionId = `txn_${payment.provider}_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    const reference = `ref_${payment.id.substring(0, 8)}`;

    if (payment.provider === 'wompi') {
      return {
        transactionId,
        reference,
        redirectUrl: `https://checkout.wompi.co/l/${transactionId}`,
        provider: 'wompi',
        status: 'PENDING',
        currency: payment.currency,
        amount: payment.amount,
        createdAt: new Date()
      };
    } else if (payment.provider === 'stripe') {
      return {
        transactionId,
        reference,
        redirectUrl: `https://checkout.stripe.com/pay/${transactionId}`,
        provider: 'stripe',
        status: 'pending',
        currency: payment.currency,
        amount: payment.amount,
        createdAt: new Date()
      };
    }

    throw new Error('Proveedor de pago no soportado');
  }

  /**
   * Obtener pagos de un usuario
   */
  async getUserPayments(userId) {
    return await Payment.findAll({
      where: { userId },
      include: [
        {
          model: Order,
          as: 'order',
          include: [{ model: Restaurant, as: 'restaurant' }]
        }
      ],
      order: [['createdAt', 'DESC']]
    });
  }

  /**
   * Obtener detalle de un pago
   */
  async getPaymentById(paymentId, userId) {
    const payment = await Payment.findByPk(paymentId, {
      include: [
        {
          model: Order,
          as: 'order',
          include: [
            { model: OrderItem, as: 'items', include: [{ model: MenuItem, as: 'menuItem' }] },
            { model: Restaurant, as: 'restaurant' }
          ]
        }
      ]
    });

    if (!payment) {
      throw new Error('Pago no encontrado');
    }

    if (payment.userId !== userId) {
      throw new Error('No autorizado');
    }

    return payment;
  }
}

export default new OrderService();