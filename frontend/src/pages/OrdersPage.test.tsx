import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { vi, describe, it, expect, beforeEach } from 'vitest';
import OrdersPage from './OrdersPage';
import { orderApi } from '../services/orderApi';
import { Order } from '../types';

// Mock de orderApi
vi.mock('../services/orderApi', () => ({
  orderApi: {
    getUserOrders: vi.fn(),
  },
}));

// Mock de navegación
const mockOnNavigate = vi.fn();

const mockOrderApi = vi.mocked(orderApi);

describe('OrdersPage', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockOnNavigate.mockClear();
  });

  it('debería mostrar loading inicialmente', () => {
    mockOrderApi.getUserOrders.mockImplementation(() => new Promise(() => {})); // Never resolves

    render(<OrdersPage onNavigate={mockOnNavigate} />);

    expect(screen.getByText('Cargando pedidos...')).toBeInTheDocument();
  });

  it('debería mostrar mensaje cuando no hay pedidos', async () => {
    mockOrderApi.getUserOrders.mockResolvedValue([]);

    render(<OrdersPage onNavigate={mockOnNavigate} />);

    await waitFor(() => {
      expect(screen.getByText('Aún no hay pedidos')).toBeInTheDocument();
    });

    expect(screen.getByText('Empieza a pedir de tus restaurantes favoritos')).toBeInTheDocument();
    expect(screen.getByText('Ver restaurantes')).toBeInTheDocument();
  });

  it('debería mostrar error cuando falla la carga', async () => {
    mockOrderApi.getUserOrders.mockRejectedValue(new Error('API Error'));

    render(<OrdersPage onNavigate={mockOnNavigate} />);

    await waitFor(() => {
      expect(screen.getByText('Error')).toBeInTheDocument();
    });

    expect(screen.getByText('Error al cargar los pedidos')).toBeInTheDocument();
    expect(screen.getByText('Reintentar')).toBeInTheDocument();
  });

  it('debería renderizar lista de pedidos correctamente', async () => {
    const mockOrders: Order[] = [
      {
        id: 'order-1',
        userId: 'user-1',
        restaurant: {
          id: 'rest-1',
          name: 'Pizza Palace',
          image: 'pizza.jpg',
          cuisine: ['Italiana'],
          rating: 4.5,
          reviewCount: 100,
          deliveryTime: '20-30 min',
          deliveryFee: 5000,
          minOrder: 20000,
          isOpen: true,
          openingHours: {},
          description: 'Pizzas deliciosas',
          address: { street: 'Calle 123', city: 'Bogotá', neighborhood: 'Centro' },
          serviceTypes: ['delivery'],
          priceRange: 2,
          isPromoted: false
        },
        items: [
          {
            menuItem: {
              id: 'item-1',
              restaurantId: 'rest-1',
              name: 'Pizza Margherita',
              description: 'Pizza clásica',
              price: 25000,
              image: 'pizza.jpg',
              category: 'Pizzas',
              isAvailable: true
            },
            quantity: 2,
            restaurant: {
              id: 'rest-1',
              name: 'Pizza Palace',
              image: 'pizza.jpg',
              cuisine: ['Italiana'],
              rating: 4.5,
              reviewCount: 100,
              deliveryTime: '20-30 min',
              deliveryFee: 5000,
              minOrder: 20000,
              isOpen: true,
              openingHours: {},
              description: 'Pizzas deliciosas',
              address: { street: 'Calle 123', city: 'Bogotá', neighborhood: 'Centro' },
              serviceTypes: ['delivery'],
              priceRange: 2,
              isPromoted: false
            },
            selectedModifiers: [],
            specialInstructions: 'Sin piña'
          }
        ],
        status: 'delivered',
        total: 50000,
        deliveryFee: 5000,
        paymentMethod: 'cash',
        paymentStatus: 'paid',
        deliveryAddress: { street: 'Carrera 15', city: 'Bogotá', neighborhood: 'Chapinero' },
        createdAt: new Date('2024-01-15T12:00:00'),
        estimatedDeliveryTime: new Date('2024-01-15T12:30:00'),
        trackingCode: 'TRACK001'
      }
    ];

    mockOrderApi.getUserOrders.mockResolvedValue(mockOrders);

    render(<OrdersPage onNavigate={mockOnNavigate} />);

    await waitFor(() => {
      expect(screen.getByText('Mis Pedidos')).toBeInTheDocument();
    });

    expect(screen.getByText('Pizza Palace')).toBeInTheDocument();
    expect(screen.getByText('Entregado')).toBeInTheDocument();
    expect(screen.getByText('$ 50.000')).toBeInTheDocument();
    expect(screen.getByText('2x Pizza Margherita')).toBeInTheDocument();
  });

  it('debería manejar navegación al hacer clic en botones', async () => {
    const user = userEvent.setup();

    mockOrderApi.getUserOrders.mockResolvedValue([]);

    render(<OrdersPage onNavigate={mockOnNavigate} />);

    await waitFor(() => {
      expect(screen.getByText('Aún no hay pedidos')).toBeInTheDocument();
    });

    const backButton = screen.getByRole('button', { name: /arrowleft/i });
    await user.click(backButton);

    expect(mockOnNavigate).toHaveBeenCalledWith('home');

    const restaurantsButton = screen.getByText('Ver restaurantes');
    await user.click(restaurantsButton);

    expect(mockOnNavigate).toHaveBeenCalledWith('restaurants');
  });

  it('debería mostrar diferentes estados de pedido correctamente', async () => {
    const mockOrders: Order[] = [
      {
        id: 'order-1',
        userId: 'user-1',
        restaurant: {
          id: 'rest-1',
          name: 'Test Restaurant',
          image: 'test.jpg',
          cuisine: ['Test'],
          rating: 4.0,
          reviewCount: 50,
          deliveryTime: '15-25 min',
          deliveryFee: 3000,
          minOrder: 15000,
          isOpen: true,
          openingHours: {},
          description: 'Test',
          address: { street: 'Test St', city: 'Bogotá', neighborhood: 'Test' },
          serviceTypes: ['delivery'],
          priceRange: 2,
          isPromoted: false
        },
        items: [],
        status: 'pending',
        total: 30000,
        deliveryFee: 3000,
        paymentMethod: 'cash',
        paymentStatus: 'pending',
        deliveryAddress: { street: 'Test Address', city: 'Bogotá', neighborhood: 'Test' },
        createdAt: new Date(),
        estimatedDeliveryTime: new Date(),
        trackingCode: 'TEST001'
      },
      {
        id: 'order-2',
        userId: 'user-1',
        restaurant: {
          id: 'rest-2',
          name: 'Another Restaurant',
          image: 'another.jpg',
          cuisine: ['Another'],
          rating: 4.2,
          reviewCount: 75,
          deliveryTime: '20-35 min',
          deliveryFee: 4000,
          minOrder: 18000,
          isOpen: true,
          openingHours: {},
          description: 'Another',
          address: { street: 'Another St', city: 'Bogotá', neighborhood: 'Another' },
          serviceTypes: ['delivery'],
          priceRange: 3,
          isPromoted: false
        },
        items: [],
        status: 'on_way',
        total: 45000,
        deliveryFee: 4000,
        paymentMethod: 'cash',
        paymentStatus: 'paid',
        deliveryAddress: { street: 'Another Address', city: 'Bogotá', neighborhood: 'Another' },
        createdAt: new Date(),
        estimatedDeliveryTime: new Date(),
        riderLocation: { lat: 4.65, lng: -74.05 },
        trackingCode: 'TEST002'
      }
    ];

    mockOrderApi.getUserOrders.mockResolvedValue(mockOrders);

    render(<OrdersPage onNavigate={mockOnNavigate} />);

    await waitFor(() => {
      expect(screen.getByText('Pendiente')).toBeInTheDocument();
      expect(screen.getByText('En camino')).toBeInTheDocument();
    });

    // Verificar que se muestran los botones apropiados para cada estado
    expect(screen.getByText('Rastrear Pedido')).toBeInTheDocument();
    expect(screen.getByText('Cancelar Pedido')).toBeInTheDocument();
  });
});