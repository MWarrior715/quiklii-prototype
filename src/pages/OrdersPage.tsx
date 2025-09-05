import React from 'react';
import { Clock, CheckCircle, Truck, MapPin } from 'lucide-react';

interface OrdersPageProps {
  onNavigate: (page: string) => void;
}

const OrdersPage: React.FC<OrdersPageProps> = ({ onNavigate }) => {
  // Mock orders data
  const orders = [
    {
      id: '12345',
      restaurant: 'Bella Italia',
      items: ['Margherita Pizza', 'Spaghetti Carbonara'],
      total: 27.98,
      status: 'delivered',
      date: '2024-01-15T18:30:00Z',
      estimatedTime: 'Delivered at 6:45 PM'
    },
    {
      id: '12346',
      restaurant: 'Sakura Sushi',
      items: ['Salmon Sashimi', 'California Roll'],
      total: 25.98,
      status: 'on-way',
      date: '2024-01-15T19:15:00Z',
      estimatedTime: 'Arriving in 10-15 minutes'
    },
    {
      id: '12347',
      restaurant: 'Spice Palace',
      items: ['Butter Chicken', 'Vegetable Biryani'],
      total: 28.98,
      status: 'preparing',
      date: '2024-01-15T19:30:00Z',
      estimatedTime: 'Ready in 20-25 minutes'
    }
  ];

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'delivered':
        return <CheckCircle className="w-5 h-5 text-green-500" />;
      case 'on-way':
        return <Truck className="w-5 h-5 text-blue-500" />;
      case 'preparing':
        return <Clock className="w-5 h-5 text-orange-500" />;
      default:
        return <Clock className="w-5 h-5 text-gray-500" />;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'delivered':
        return 'text-green-600 bg-green-50 border-green-200';
      case 'on-way':
        return 'text-blue-600 bg-blue-50 border-blue-200';
      case 'preparing':
        return 'text-orange-600 bg-orange-50 border-orange-200';
      default:
        return 'text-gray-600 bg-gray-50 border-gray-200';
    }
  };

  const formatStatus = (status: string) => {
    switch (status) {
      case 'on-way':
        return 'On the way';
      case 'preparing':
        return 'Preparing';
      case 'delivered':
        return 'Delivered';
      default:
        return status;
    }
  };

  if (orders.length === 0) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="text-6xl mb-4">📦</div>
          <h2 className="text-2xl font-bold text-gray-800 mb-2">No orders yet</h2>
          <p className="text-gray-600 mb-6">Start ordering from your favorite restaurants</p>
          <button
            onClick={() => onNavigate('restaurants')}
            className="bg-orange-500 text-white px-6 py-3 rounded-lg hover:bg-orange-600 transition-colors"
          >
            Browse Restaurants
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
          <h1 className="text-3xl font-bold text-gray-800 mb-2">My Orders</h1>
          <p className="text-gray-600">Track your current and past orders</p>
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
                      <h3 className="font-semibold text-gray-800">Order #{order.id}</h3>
                      <p className="text-sm text-gray-600">{order.restaurant}</p>
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
                    <p className="text-sm text-gray-500 mb-1">Items</p>
                    <p className="text-sm font-medium text-gray-800">
                      {order.items.join(', ')}
                    </p>
                  </div>
                  
                  <div>
                    <p className="text-sm text-gray-500 mb-1">Total</p>
                    <p className="text-sm font-bold text-gray-800">${order.total.toFixed(2)}</p>
                  </div>
                  
                  <div>
                    <p className="text-sm text-gray-500 mb-1">Status</p>
                    <p className="text-sm font-medium text-gray-800">{order.estimatedTime}</p>
                  </div>
                </div>

                {order.status !== 'delivered' && (
                  <div className="pt-4 border-t border-gray-200">
                    <div className="flex items-center space-x-4">
                      <button className="flex items-center space-x-2 text-orange-500 hover:text-orange-600 transition-colors">
                        <MapPin className="w-4 h-4" />
                        <span className="text-sm font-medium">Track Order</span>
                      </button>
                      
                      {order.status === 'preparing' && (
                        <button className="text-sm text-gray-500 hover:text-gray-700 transition-colors">
                          Contact Restaurant
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
          <h2 className="text-2xl font-bold text-gray-800 mb-4">Hungry for more?</h2>
          <button
            onClick={() => onNavigate('restaurants')}
            className="bg-orange-500 text-white px-8 py-3 rounded-lg font-semibold hover:bg-orange-600 transition-colors"
          >
            Order Again
          </button>
        </div>
      </div>
    </div>
  );
};

export default OrdersPage;