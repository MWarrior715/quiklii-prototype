import { Order, OrderItem, Restaurant, MenuItem, User } from '../models/index.js';
import { sequelize } from '../config/database.js';

class OrderService {
  /**
   * Crear un nuevo pedido
   */
  async createOrder(orderData, userId) {
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

      // Crear el pedido
      const order = await Order.create({
        userId,
        restaurantId,
        total,
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

      await transaction.commit();

      // Cargar el pedido completo con sus relaciones
      return await this.getOrderById(order.id);
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
      order: [['createdAt', 'DESC']]
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
  async updateOrderStatus(orderId, status, userId, userRole) {
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

    order.status = status;
    await order.save();

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
}

export default new OrderService();