import { axiosInstance } from './api';
import { Order, OrderStatus, OrderCreate } from '../types';

export const orderApi = {
  // Crear un nuevo pedido
  createOrder: async (orderData: OrderCreate): Promise<Order> => {
    const response = await axiosInstance.post<Order>('/orders', orderData);
    return response.data;
  },

  // Obtener todos los pedidos del usuario actual
  getUserOrders: async (): Promise<Order[]> => {
    const response = await axiosInstance.get<Order[]>('/orders');
    return response.data;
  },

  // Obtener un pedido específico por ID
  getOrderById: async (orderId: string): Promise<Order> => {
    const response = await axiosInstance.get<Order>(`/orders/${orderId}`);
    return response.data;
  },

  // Actualizar el estado de un pedido
  updateOrderStatus: async (orderId: string, status: OrderStatus): Promise<Order> => {
    const response = await axiosInstance.put<Order>(`/orders/${orderId}/status`, { status });
    return response.data;
  },

  // Obtener pedidos de un restaurante
  getRestaurantOrders: async (restaurantId: string): Promise<Order[]> => {
    const response = await axiosInstance.get<Order[]>(`/orders/restaurant/${restaurantId}`);
    return response.data;
  },

  // Obtener historial de pedidos de un usuario
  getUserOrderHistory: async (userId: string): Promise<Order[]> => {
    const response = await axiosInstance.get<Order[]>(`/orders/user/${userId}`);
    return response.data;
  }
};