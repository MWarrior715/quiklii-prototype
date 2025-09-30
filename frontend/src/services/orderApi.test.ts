/* eslint-disable @typescript-eslint/no-explicit-any */
import { vi, describe, it, expect, beforeEach } from 'vitest';
import { orderApi } from './orderApi';
import { Order, OrderCreate, Restaurant, ServiceType } from '../types';

// Mock de axios
vi.mock('./api', () => ({
  axiosInstance: {
    post: vi.fn(),
    get: vi.fn(),
    put: vi.fn(),
  },
}));

import { axiosInstance } from './api';

const mockAxiosInstance = axiosInstance as { post: any; get: any; put: any };
const mockRestaurant = {
  id: 'rest-1',
  name: 'Test Restaurant',
  image: 'test.jpg',
  cuisine: ['italian'],
  rating: 4.5,
  reviewCount: 100,
  deliveryTime: '30-45 min',
  deliveryFee: 5000,
  minOrder: 20000,
  isOpen: true,
  openingHours: {},
  description: 'Test description',
  address: {} as any,
  serviceTypes: ['delivery' as ServiceType],
  priceRange: 2,
  isPromoted: false
} as Restaurant;

describe('orderApi', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('createOrder', () => {
    it('debería crear un pedido correctamente', async () => {
      const mockOrderData: OrderCreate = {
        restaurantId: 'rest-1',
        items: [
          {
            menuItemId: 'item-1',
            quantity: 2,
            specialInstructions: 'Sin cebolla'
          }
        ],
        deliveryAddress: 'Carrera 15 #93-47',
        paymentMethod: 'cash'
      };

      const mockResponse: Partial<Order> = {
        id: 'order-123',
        userId: 'user-1',
        status: 'pending',
        total: 50000,
        deliveryFee: 5000,
        paymentMethod: 'cash',
        paymentStatus: 'pending',
        deliveryAddress: {
          street: 'Carrera 15 #93-47',
          city: 'Bogotá',
          neighborhood: 'Centro'
        },
        createdAt: new Date(),
        estimatedDeliveryTime: new Date(),
        trackingCode: 'TRACK123'
      };

      mockAxiosInstance.post.mockResolvedValue({
        data: mockResponse
      });

      const result = await orderApi.createOrder(mockOrderData);

      expect(mockAxiosInstance.post).toHaveBeenCalledWith('/orders', mockOrderData);
      expect(result.id).toBe('order-123');
    });

    it('debería manejar errores al crear pedido', async () => {
       const mockOrderData: OrderCreate = {
         restaurantId: 'rest-1',
         items: [],
         deliveryAddress: 'Carrera 15 #93-47',
         paymentMethod: 'cash'
       };

       const error = new Error('Error al crear pedido');
       mockAxiosInstance.post.mockRejectedValue(error);

       await expect(orderApi.createOrder(mockOrderData)).rejects.toThrow('Error al crear pedido');
     });
  });

  describe('getUserOrders', () => {
     it('debería obtener pedidos del usuario', async () => {
       const mockOrders: Partial<Order>[] = [
         {
           id: 'order-1',
           userId: 'user-1',
           restaurant: mockRestaurant,
           items: [],
           status: 'delivered',
           total: 45000,
           deliveryFee: 5000,
           paymentStatus: 'paid',
           deliveryAddress: {
             street: 'Carrera 15 #93-47',
             city: 'Bogotá',
             neighborhood: 'Centro'
           },
           paymentMethod: 'cash',
           createdAt: new Date(),
           estimatedDeliveryTime: new Date(),
           trackingCode: 'TRACK123'
         }
       ];

       mockAxiosInstance.get.mockResolvedValue({
         data: mockOrders
       });

       const result = await orderApi.getUserOrders();

       expect(mockAxiosInstance.get).toHaveBeenCalledWith('/orders');
       expect(result).toEqual(mockOrders);
     });

    it('debería manejar errores al obtener pedidos', async () => {
      const error = new Error('Error al obtener pedidos');
      mockAxiosInstance.get.mockRejectedValue(error);

      await expect(orderApi.getUserOrders()).rejects.toThrow('Error al obtener pedidos');
    });
  });

  describe('getOrderById', () => {
    it('debería obtener un pedido específico', async () => {
      const mockOrder: Partial<Order> = {
        id: 'order-123',
        userId: 'user-1',
        restaurant: {} as any,
        items: [],
        status: 'preparing',
        total: 30000,
        deliveryFee: 5000,
        paymentStatus: 'pending',
        deliveryAddress: {
          street: 'Carrera 15 #93-47',
          city: 'Bogotá',
          neighborhood: 'Centro'
        },
        paymentMethod: 'mercadopago',
        createdAt: new Date(),
        estimatedDeliveryTime: new Date(),
        trackingCode: 'TRACK456'
      };

      mockAxiosInstance.get.mockResolvedValue({
        data: mockOrder
      });

      const result = await orderApi.getOrderById('order-123');

      expect(mockAxiosInstance.get).toHaveBeenCalledWith('/orders/order-123');
      expect(result).toEqual(mockOrder);
    });
  });

  describe('updateOrderStatus', () => {
    it('debería actualizar el estado del pedido', async () => {
      const mockOrder: Partial<Order> = {
        id: 'order-123',
        userId: 'user-1',
        restaurant: {} as any,
        items: [],
        status: 'on_way',
        total: 30000,
        deliveryFee: 5000,
        paymentStatus: 'paid',
        deliveryAddress: {
          street: 'Carrera 15 #93-47',
          city: 'Bogotá',
          neighborhood: 'Centro'
        },
        paymentMethod: 'cash',
        createdAt: new Date(),
        estimatedDeliveryTime: new Date(),
        trackingCode: 'TRACK789'
      };

      mockAxiosInstance.put.mockResolvedValue({
        data: mockOrder
      });

      const result = await orderApi.updateOrderStatus('order-123', 'on_way');

      expect(mockAxiosInstance.put).toHaveBeenCalledWith('/orders/order-123/status', { status: 'on_way' });
      expect(result).toEqual(mockOrder);
    });
  });

  describe('getRestaurantOrders', () => {
    it('debería obtener pedidos de un restaurante', async () => {
      const mockOrders: Partial<Order>[] = [
        {
          id: 'order-1',
          userId: 'user-1',
          restaurant: {} as any,
          items: [],
          status: 'confirmed',
          total: 25000,
          deliveryFee: 5000,
          paymentStatus: 'pending',
          deliveryAddress: {
            street: 'Carrera 15 #93-47',
            city: 'Bogotá',
            neighborhood: 'Centro'
          },
          paymentMethod: 'cash',
          createdAt: new Date(),
          estimatedDeliveryTime: new Date(),
          trackingCode: 'TRACK101'
        }
      ];

      mockAxiosInstance.get.mockResolvedValue({
        data: mockOrders
      });

      const result = await orderApi.getRestaurantOrders('rest-1');

      expect(mockAxiosInstance.get).toHaveBeenCalledWith('/orders/restaurant/rest-1');
      expect(result).toEqual(mockOrders);
    });
  });

  describe('getUserOrderHistory', () => {
    it('debería obtener historial de pedidos de usuario', async () => {
      const mockOrders: Partial<Order>[] = [
        {
          id: 'order-1',
          userId: 'user-1',
          restaurant: {} as any,
          items: [],
          status: 'delivered',
          total: 45000,
          deliveryFee: 5000,
          paymentStatus: 'paid',
          deliveryAddress: {
            street: 'Carrera 15 #93-47',
            city: 'Bogotá',
            neighborhood: 'Centro'
          },
          paymentMethod: 'cash',
          createdAt: new Date(),
          estimatedDeliveryTime: new Date(),
          trackingCode: 'TRACK202'
        },
        {
          id: 'order-2',
          userId: 'user-1',
          restaurant: {} as any,
          items: [],
          status: 'cancelled',
          total: 35000,
          deliveryFee: 3000,
          paymentStatus: 'refunded',
          deliveryAddress: {
            street: 'Calle 123 #45-67',
            city: 'Bogotá',
            neighborhood: 'Centro'
          },
          paymentMethod: 'mercadopago',
          createdAt: new Date(),
          estimatedDeliveryTime: new Date(),
          trackingCode: 'TRACK303'
        }
      ];

      mockAxiosInstance.get.mockResolvedValue({
        data: mockOrders
      });

      const result = await orderApi.getUserOrderHistory('user-1');

      expect(mockAxiosInstance.get).toHaveBeenCalledWith('/orders/user/user-1');
      expect(result).toEqual(mockOrders);
      expect(result).toHaveLength(2);
    });
  });
});