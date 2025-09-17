import React, { useState, useEffect } from 'react';
import { Clock, CheckCircle, Truck, MapPin, ArrowLeft } from 'lucide-react';
import { Order, OrderStatus } from '../types';
import { orderApi } from '../services/orderApi';

import { NavigationProps } from '../types/props';

type OrdersPageProps = NavigationProps;

const formatDate = (dateString: string) => {
  const date = new Date(dateString);
  return new Intl.DateTimeFormat('es-CO', {
    hour: 'numeric',
    minute: 'numeric',
    hour12: true,
    day: 'numeric',
    month: 'short'
  }).format(date);
};

const formatStatus = (status: OrderStatus) => {
  const statusMap: Record<OrderStatus, string> = {
    'pending': 'Pendiente',
    'confirmed': 'Confirmado',
    'preparing': 'Preparando',
    'ready': 'Listo',
    'picked_up': 'Recogido',
    'on_way': 'En camino',
    'delivered': 'Entregado',
    'cancelled': 'Cancelado'
  };
  return statusMap[status] || status;
};

const getStatusColor = (status: OrderStatus) => {
  const colorMap: Record<OrderStatus, string> = {
    'pending': 'border-yellow-400 text-yellow-700 bg-yellow-50',
    'confirmed': 'border-blue-400 text-blue-700 bg-blue-50',
    'preparing': 'border-purple-400 text-purple-700 bg-purple-50',
    'ready': 'border-indigo-400 text-indigo-700 bg-indigo-50',
    'picked_up': 'border-cyan-400 text-cyan-700 bg-cyan-50',
    'on_way': 'border-teal-400 text-teal-700 bg-teal-50',
    'delivered': 'border-green-400 text-green-700 bg-green-50',
    'cancelled': 'border-red-400 text-red-700 bg-red-50'
  };
  return colorMap[status] || 'border-gray-400 text-gray-700 bg-gray-50';
};

const getStatusIcon = (status: OrderStatus) => {
  switch (status) {
    case 'delivered':
      return <CheckCircle className="w-6 h-6 text-green-500" />;
    case 'on_way':
      return <Truck className="w-6 h-6 text-teal-500" />;
    default:
      return <Clock className="w-6 h-6 text-orange-500" />;
  }
};

const formatPrice = (price: number) => {
  return new Intl.NumberFormat('es-CO', {
    style: 'currency',
    currency: 'COP',
    minimumFractionDigits: 0
  }).format(price);
};

const OrdersPage: React.FC<OrdersPageProps> = ({ onNavigate }) => {
  const [orders, setOrders] = useState<Order[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchOrders = async () => {
      try {
        const data = await orderApi.getUserOrders();
        setOrders(data);
      } catch (err) {
        setError('Error al cargar los pedidos');
        console.error('Error fetching orders:', err);
      } finally {
        setIsLoading(false);
      }
    };

    fetchOrders();
  }, []);

    if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-orange-500 mx-auto mb-4"></div>
          <p className="text-gray-600">Cargando pedidos...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="text-6xl mb-4">⚠️</div>
          <h2 className="text-2xl font-bold text-gray-800 mb-2">Error</h2>
          <p className="text-gray-600 mb-6">{error}</p>
          <button
            onClick={() => window.location.reload()}
            className="bg-orange-500 text-white px-6 py-3 rounded-lg hover:bg-orange-600 transition-colors"
          >
            Reintentar
          </button>
        </div>
      </div>
    );
  }

  if (orders.length === 0) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="text-6xl mb-4">📦</div>
          <h2 className="text-2xl font-bold text-gray-800 mb-2">Aún no hay pedidos</h2>
          <p className="text-gray-600 mb-6">Empieza a pedir de tus restaurantes favoritos</p>
          <button
            onClick={() => onNavigate('restaurants')}
            className="bg-orange-500 text-white px-6 py-3 rounded-lg hover:bg-orange-600 transition-colors"
          >
            Ver restaurantes
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center mb-4">
            <button
              onClick={() => onNavigate('home')}
              className="mr-4 p-2 text-gray-600 hover:text-gray-800 transition-colors"
            >
              <ArrowLeft className="w-6 h-6" />
            </button>
            <h1 className="text-3xl font-bold text-gray-800">Mis Pedidos</h1>
          </div>
          <p className="text-gray-600">Sigue tus pedidos actuales y pasados</p>
        </div>

        {/* Orders List */}
        <div className="space-y-4">
          {orders.map((order) => (
            <div key={order.id} className="bg-white rounded-lg shadow-md overflow-hidden hover:shadow-lg transition-shadow">
              <div className="p-6">
                <div className="flex flex-col md:flex-row md:items-center md:justify-between mb-4">
                  <div className="flex items-center space-x-3 mb-3 md:mb-0">
                    {getStatusIcon(order.status)}
                    <div>
                      <h3 className="font-semibold text-gray-800">Pedido #{order.id.slice(0, 8)}</h3>
                      <p className="text-sm text-gray-600">{order.restaurant.name}</p>
                    </div>
                  </div>
                  
                  <div className="text-right">
                    <div className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium border ${getStatusColor(order.status)}`}>
                      {formatStatus(order.status)}
                    </div>
                  </div>
                </div>

                <div className="grid md:grid-cols-3 gap-4 mb-4">
                  <div>
                    <p className="text-sm text-gray-500 mb-1">Artículos</p>
                    <p className="text-sm font-medium text-gray-800">
                      {order.items.map(item => `${item.quantity}x ${item.menuItem.name}`).join(', ')}
                    </p>
                  </div>
                  
                  <div>
                    <p className="text-sm text-gray-500 mb-1">Total</p>
                    <p className="text-sm font-bold text-gray-800">{formatPrice(order.total)}</p>
                  </div>
                  
                  <div>
                    <p className="text-sm text-gray-500 mb-1">Fecha</p>
                    <p className="text-sm font-medium text-gray-800">
                      {formatDate(order.createdAt.toString())}
                    </p>
                  </div>
                </div>

                {order.status !== 'delivered' && order.status !== 'cancelled' && (
                  <div className="pt-4 border-t border-gray-200">
                    <div className="flex flex-wrap items-center gap-4">
                      {order.riderLocation && (
                        <button className="flex items-center space-x-2 text-orange-500 hover:text-orange-600 transition-colors">
                          <MapPin className="w-4 h-4" />
                          <span className="text-sm font-medium">Rastrear Pedido</span>
                        </button>
                      )}
                      
                      {(order.status === 'preparing' || order.status === 'ready') && (
                        <button className="text-sm text-gray-500 hover:text-gray-700 transition-colors">
                          Contactar al Restaurante
                        </button>
                      )}

                      {order.status === 'pending' && (
                        <button className="text-sm text-red-500 hover:text-red-600 transition-colors">
                          Cancelar Pedido
                        </button>
                      )}
                    </div>
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>

        {/* Order Again Section */}
        <div className="mt-12 text-center">
          <h2 className="text-2xl font-bold text-gray-800 mb-4">¿Hambriento por más?</h2>
          <button
            onClick={() => onNavigate('restaurants')}
            className="bg-orange-500 text-white px-8 py-3 rounded-lg font-semibold hover:bg-orange-600 transition-colors"
          >
            Pedir de Nuevo
          </button>
        </div>
      </div>
    </div>
  );
};

export default OrdersPage;