import { ValidationError } from 'sequelize';
import orderService from '../services/orderService.js';

const orderController = {
  // Crear un nuevo pedido
  async createOrder(req, res) {
    try {
      const order = await orderService.createOrder(req.body, req.user.id);
      res.status(201).json(order);
    } catch (error) {
      if (error instanceof ValidationError) {
        res.status(400).json({ error: error.message });
      } else {
        console.error('Error al crear pedido:', error);
        res.status(500).json({ error: error.message });
      }
    }
  },

  // Obtener todos los pedidos del usuario
  async getUserOrders(req, res) {
    try {
      const orders = await orderService.getUserOrders(req.user.id);
      res.json(orders);
    } catch (error) {
      console.error('Error al obtener pedidos:', error);
      res.status(500).json({ error: error.message });
    }
  },

  // Obtener un pedido específico
  async getOrderById(req, res) {
    try {
      const order = await orderService.getOrderById(req.params.id);
      
      // Verificar que el usuario tiene acceso al pedido
      if (order.userId !== req.user.id && req.user.role !== 'admin') {
        return res.status(403).json({ error: 'No autorizado' });
      }

      res.json(order);
    } catch (error) {
      if (error.message === 'Pedido no encontrado') {
        res.status(404).json({ error: error.message });
      } else {
        console.error('Error al obtener pedido:', error);
        res.status(500).json({ error: error.message });
      }
    }
  },

  // Actualizar el estado de un pedido
  async updateOrderStatus(req, res) {
    try {
      const order = await orderService.updateOrderStatus(
        req.params.id,
        req.body.status,
        req.user.id,
        req.user.role
      );
      res.json(order);
    } catch (error) {
      if (error.message === 'Pedido no encontrado') {
        res.status(404).json({ error: error.message });
      } else if (error.message === 'No autorizado' || error.message === 'Estado inválido') {
        res.status(400).json({ error: error.message });
      } else {
        console.error('Error al actualizar estado:', error);
        res.status(500).json({ error: error.message });
      }
    }
  },

  // Obtener pedidos de un restaurante
  async getRestaurantOrders(req, res) {
    try {
      const orders = await orderService.getRestaurantOrders(req.params.restaurantId);
      res.json(orders);
    } catch (error) {
      console.error('Error al obtener pedidos del restaurante:', error);
      res.status(500).json({ error: error.message });
    }
  },

  // Obtener historial de pedidos de un usuario
  async getUserOrderHistory(req, res) {
    try {
      // Verificar permisos
      if (req.user.role !== 'admin' && req.user.id !== req.params.userId) {
        return res.status(403).json({ error: 'No autorizado' });
      }

      const orders = await orderService.getUserOrders(req.params.userId);
      res.json(orders);
    } catch (error) {
      console.error('Error al obtener historial de pedidos:', error);
      res.status(500).json({ error: error.message });
    }
  }
};

export default orderController;