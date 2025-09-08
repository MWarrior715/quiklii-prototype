import React from 'react';
import { Minus, Plus, Trash2, ArrowLeft, ShoppingBag } from 'lucide-react';
import { useCart } from '../contexts/CartContext';
import { useAuth } from '../contexts/AuthContext';

interface CartPageProps {
  onNavigate: (page: string, data?: any) => void;
}

const CartPage: React.FC<CartPageProps> = ({ onNavigate }) => {
  const { items, updateQuantity, removeItem, getTotalPrice, currentRestaurant } = useCart();
  const { user } = useAuth();
  const total = getTotalPrice();
  const deliveryFee = currentRestaurant?.deliveryFee || 0;
  const finalTotal = total + deliveryFee;

  if (items.length === 0) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <ShoppingBag className="w-20 h-20 text-gray-400 mx-auto mb-4" />
          <h2 className="text-2xl font-bold text-gray-800 mb-2">Tu carrito está vacío</h2>
          <p className="text-gray-600 mb-6">Agrega algunos productos deliciosos para comenzar</p>
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

  const handleCheckout = () => {
    if (!user) {
      onNavigate('login');
      return;
    }
    onNavigate('checkout');
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="flex items-center mb-8">
          <button
            onClick={() => onNavigate('restaurants')}
            className="mr-4 p-2 text-gray-600 hover:text-gray-800 transition-colors"
          >
            <ArrowLeft className="w-6 h-6" />
          </button>
          <h1 className="text-3xl font-bold text-gray-800">Tu Carrito</h1>
        </div>

        <div className="grid lg:grid-cols-3 gap-8">
          {/* Cart Items */}
          <div className="lg:col-span-2">
            {currentRestaurant && (
              <div className="bg-white rounded-lg shadow-md p-6 mb-6">
                <h3 className="font-semibold text-gray-800 mb-2">Ordenando de:</h3>
                <div className="flex items-center space-x-3">
                  <img
                    src={currentRestaurant.image}
                    alt={currentRestaurant.name}
                    className="w-12 h-12 rounded-lg object-cover"
                  />
                  <div>
                    <p className="font-semibold text-gray-800">{currentRestaurant.name}</p>
                    <p className="text-sm text-gray-600">{currentRestaurant.cuisine}</p>
                  </div>
                </div>
              </div>
            )}

            <div className="bg-white rounded-lg shadow-md">
              <div className="p-6">
                <h2 className="text-xl font-semibold text-gray-800 mb-4">Artículos de la orden</h2>
                
                <div className="space-y-4">
                  {items.map((item) => (
                    <div key={item.menuItem.id} className="flex items-center space-x-4 p-4 bg-gray-50 rounded-lg">
                      <img
                        src={item.menuItem.image}
                        alt={item.menuItem.name}
                        className="w-16 h-16 rounded-lg object-cover"
                      />
                      
                      <div className="flex-1">
                        <h4 className="font-semibold text-gray-800">{item.menuItem.name}</h4>
                        <p className="text-sm text-gray-600 mb-2">{item.menuItem.description}</p>
                        <p className="font-semibold text-orange-500">${item.menuItem.price}</p>
                      </div>
                      
                      <div className="flex items-center space-x-3">
                        <button
                          onClick={() => updateQuantity(item.menuItem.id, item.quantity - 1)}
                          className="p-1 rounded-full bg-gray-200 hover:bg-gray-300 transition-colors"
                        >
                          <Minus className="w-4 h-4" />
                        </button>
                        
                        <span className="font-semibold min-w-[2rem] text-center">{item.quantity}</span>
                        
                        <button
                          onClick={() => updateQuantity(item.menuItem.id, item.quantity + 1)}
                          className="p-1 rounded-full bg-gray-200 hover:bg-gray-300 transition-colors"
                        >
                          <Plus className="w-4 h-4" />
                        </button>
                        
                        <button
                          onClick={() => removeItem(item.menuItem.id)}
                          className="p-2 text-red-500 hover:text-red-600 transition-colors"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>

          {/* Order Summary */}
          <div className="lg:col-span-1">
            <div className="bg-white rounded-lg shadow-md p-6 sticky top-4">
              <h3 className="text-xl font-semibold text-gray-800 mb-4">Resumen de la orden</h3>
              
              <div className="space-y-3 mb-4">
                <div className="flex justify-between text-gray-600">
                  <span>Subtotal</span>
                  <span>${total.toFixed(2)}</span>
                </div>
                <div className="flex justify-between text-gray-600">
                  <span>Costo de envío</span>
                  <span>${deliveryFee.toFixed(2)}</span>
                </div>
                <div className="border-t pt-3">
                  <div className="flex justify-between text-lg font-semibold text-gray-800">
                    <span>Total</span>
                    <span>${finalTotal.toFixed(2)}</span>
                  </div>
                </div>
              </div>

              {currentRestaurant && finalTotal < currentRestaurant.minOrder && (
                <div className="bg-orange-50 border border-orange-200 rounded-lg p-3 mb-4">
                  <p className="text-sm text-orange-800">
                    Pedido mínimo: ${currentRestaurant.minOrder}. 
                    Agrega ${(currentRestaurant.minOrder - total).toFixed(2)} más para finalizar la compra.
                  </p>
                </div>
              )}
              
              <button
                onClick={handleCheckout}
                disabled={currentRestaurant ? finalTotal < currentRestaurant.minOrder : false}
                className="w-full bg-orange-500 text-white py-3 px-4 rounded-lg font-semibold hover:bg-orange-600 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {user ? 'Proceder al pago' : 'Inicia sesión para pagar'}
              </button>
              
              <button
                onClick={() => onNavigate('restaurants')}
                className="w-full mt-3 bg-gray-100 text-gray-700 py-3 px-4 rounded-lg font-semibold hover:bg-gray-200 transition-colors"
              >
                Continuar comprando
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CartPage;