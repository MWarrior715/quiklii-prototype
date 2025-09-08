import React, { useState } from 'react';
import { ArrowLeft, CreditCard, MapPin, Clock, Smartphone, Wallet } from 'lucide-react';
import { useCart } from '../contexts/CartContext';
import { useAuth } from '../contexts/AuthContext';
import { PaymentMethod } from '../types';

interface CheckoutPageProps {
  onNavigate: (page: string, data?: any) => void;
}

const CheckoutPage: React.FC<CheckoutPageProps> = ({ onNavigate }) => {
  const { items, getTotalPrice, currentRestaurant, clearCart } = useCart();
  const { user } = useAuth();
  const [paymentMethod, setPaymentMethod] = useState<PaymentMethod>('mercadopago');
  const [isProcessing, setIsProcessing] = useState(false);
  const [orderPlaced, setOrderPlaced] = useState(false);
  const [deliveryAddress, setDeliveryAddress] = useState(user?.address?.street || '');
  const [deliveryInstructions, setDeliveryInstructions] = useState(user?.address?.instructions || '');

  const total = getTotalPrice();
  const deliveryFee = currentRestaurant?.deliveryFee || 0;
  const finalTotal = total + deliveryFee;

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('es-CO', {
      style: 'currency',
      currency: 'COP',
      minimumFractionDigits: 0
    }).format(price);
  };

  const paymentMethods: { value: PaymentMethod, label: string, description: string, icon: React.ReactNode }[] = [
    {
      value: 'mercadopago',
      label: 'MercadoPago',
      description: 'Pago seguro con tarjeta o PSE',
      icon: <CreditCard className="w-5 h-5" />
    },
    {
      value: 'payu',
      label: 'PayU',
      description: 'Tarjetas de crédito y débito',
      icon: <CreditCard className="w-5 h-5" />
    },
    {
      value: 'pse',
      label: 'PSE',
      description: 'Débito desde tu cuenta bancaria',
      icon: <CreditCard className="w-5 h-5" />
    },
    {
      value: 'nequi',
      label: 'Nequi',
      description: 'Pago con tu billetera digital',
      icon: <Smartphone className="w-5 h-5" />
    },
    {
      value: 'daviplata',
      label: 'DaviPlata',
      description: 'Pago con tu billetera digital',
      icon: <Wallet className="w-5 h-5" />
    },
    {
      value: 'cash',
      label: 'Efectivo',
      description: 'Paga al recibir tu pedido',
      icon: <Wallet className="w-5 h-5" />
    }
  ];

  const handlePlaceOrder = async () => {
    setIsProcessing(true);
    
    // Simulate order processing
    await new Promise(resolve => setTimeout(resolve, 2000));
    
    // Clear cart and show success
    clearCart();
    setOrderPlaced(true);
    setIsProcessing(false);
  };

  if (orderPlaced) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="bg-white rounded-2xl shadow-lg p-8 max-w-md w-full mx-4 text-center">
          <div className="text-6xl mb-4">🎉</div>
          <h2 className="text-2xl font-bold text-gray-800 mb-2">¡Pedido Confirmado!</h2>
          <p className="text-gray-600 mb-6">
            Tu pedido ha sido confirmado y está siendo preparado. Recibirás actualizaciones por WhatsApp y notificaciones push.
          </p>
          <div className="space-y-3">
            <button
              onClick={() => onNavigate('orders')}
              className="w-full bg-orange-500 text-white py-3 rounded-lg font-semibold hover:bg-orange-600 transition-colors"
            >
              Rastrear Pedido
            </button>
            <button
              onClick={() => onNavigate('home')}
              className="w-full bg-gray-100 text-gray-700 py-3 rounded-lg font-semibold hover:bg-gray-200 transition-colors"
            >
              Volver al Inicio
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="flex items-center mb-8">
          <button
            onClick={() => onNavigate('cart')}
            className="mr-4 p-2 text-gray-600 hover:text-gray-800 transition-colors"
          >
            <ArrowLeft className="w-6 h-6" />
          </button>
          <h1 className="text-3xl font-bold text-gray-800">Finalizar Compra</h1>
        </div>

        <div className="grid lg:grid-cols-3 gap-8">
          {/* Checkout Form */}
          <div className="lg:col-span-2 space-y-6">
            {/* Delivery Address */}
            <div className="bg-white rounded-lg shadow-md p-6">
              <div className="flex items-center space-x-3 mb-4">
                <MapPin className="w-5 h-5 text-orange-500" />
                <h3 className="text-lg font-semibold text-gray-800">Dirección de Entrega</h3>
              </div>
              
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Dirección Completa
                  </label>
                  <input
                    type="text"
                    value={deliveryAddress}
                    onChange={(e) => setDeliveryAddress(e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent"
                    placeholder="Ingresa tu dirección de entrega"
                  />
                </div>
                
                <div className="grid md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Teléfono
                    </label>
                    <input
                      type="tel"
                      defaultValue={user?.phone || ''}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Instrucciones de Entrega
                    </label>
                    <input
                      type="text"
                      value={deliveryInstructions}
                      onChange={(e) => setDeliveryInstructions(e.target.value)}
                      placeholder="Ej: Timbre, apartamento 301"
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent"
                    />
                  </div>
                </div>
              </div>
            </div>

            {/* Delivery Time */}
            <div className="bg-white rounded-lg shadow-md p-6">
              <div className="flex items-center space-x-3 mb-4">
                <Clock className="w-5 h-5 text-orange-500" />
                <h3 className="text-lg font-semibold text-gray-800">Tiempo de Entrega</h3>
              </div>
              
              <div className="grid md:grid-cols-2 gap-4">
                <button className="p-4 border-2 border-orange-500 bg-orange-50 text-orange-800 rounded-lg font-semibold">
                  Lo antes posible ({currentRestaurant?.deliveryTime})
                </button>
                <button className="p-4 border-2 border-gray-300 text-gray-700 rounded-lg font-semibold hover:border-gray-400 transition-colors">
                  Programar para después
                </button>
              </div>
            </div>

            {/* Payment Method */}
            <div className="bg-white rounded-lg shadow-md p-6">
              <div className="flex items-center space-x-3 mb-4">
                <CreditCard className="w-5 h-5 text-orange-500" />
                <h3 className="text-lg font-semibold text-gray-800">Método de Pago</h3>
              </div>
              
              <div className="space-y-3">
                {paymentMethods.map(method => (
                  <label 
                    key={method.value}
                    className={`flex items-center space-x-3 p-4 border-2 rounded-lg cursor-pointer transition-colors ${
                      paymentMethod === method.value
                        ? 'border-orange-500 bg-orange-50'
                        : 'border-gray-300 hover:border-gray-400'
                    }`}
                  >
                    <input
                      type="radio"
                      name="payment"
                      value={method.value}
                      checked={paymentMethod === method.value}
                      onChange={(e) => setPaymentMethod(e.target.value as PaymentMethod)}
                      className="text-orange-500"
                    />
                    <div className="flex items-center space-x-3 flex-1">
                      <div className={`p-2 rounded-lg ${
                        paymentMethod === method.value ? 'bg-orange-100 text-orange-600' : 'bg-gray-100 text-gray-600'
                      }`}>
                        {method.icon}
                      </div>
                      <div>
                        <p className={`font-semibold ${
                          paymentMethod === method.value ? 'text-orange-800' : 'text-gray-800'
                        }`}>
                          {method.label}
                        </p>
                        <p className={`text-sm ${
                          paymentMethod === method.value ? 'text-orange-600' : 'text-gray-600'
                        }`}>
                          {method.description}
                        </p>
                      </div>
                    </div>
                  </label>
                ))}
              </div>

              {paymentMethod !== 'cash' && (
                <div className="mt-4 p-4 bg-blue-50 border border-blue-200 rounded-lg">
                  <p className="text-sm text-blue-800">
                    <strong>Nota:</strong> La integración de pagos requiere configuración con {paymentMethod}. 
                    Para efectos de demostración, seleccionar esta opción simulará un pago exitoso.
                  </p>
                </div>
              )}
            </div>
          </div>

          {/* Order Summary */}
          <div className="lg:col-span-1">
            <div className="bg-white rounded-lg shadow-md p-6 sticky top-4">
              <h3 className="text-xl font-semibold text-gray-800 mb-4">Resumen del Pedido</h3>
              
              {/* Restaurant Info */}
              {currentRestaurant && (
                <div className="flex items-center space-x-3 mb-4 p-3 bg-gray-50 rounded-lg">
                  <img
                    src={currentRestaurant.image}
                    alt={currentRestaurant.name}
                    className="w-10 h-10 rounded object-cover"
                  />
                  <div>
                    <p className="font-semibold text-sm">{currentRestaurant.name}</p>
                    <p className="text-xs text-gray-600">{currentRestaurant.deliveryTime}</p>
                  </div>
                </div>
              )}
              
              {/* Items */}
              <div className="space-y-2 mb-4 max-h-40 overflow-y-auto">
                {items.map((item, index) => (
                  <div key={index} className="text-sm">
                    <div className="flex justify-between">
                      <span className="text-gray-600">
                        {item.quantity}x {item.menuItem.name}
                      </span>
                      <span className="font-semibold">
                        {formatPrice(item.menuItem.price * item.quantity)}
                      </span>
                    </div>
                    {item.selectedModifiers.length > 0 && (
                      <div className="ml-4 text-xs text-gray-500">
                        {item.selectedModifiers.map(mod => (
                          <div key={mod.optionId}>
                            + {mod.name} {mod.price > 0 && `(${formatPrice(mod.price)})`}
                          </div>
                        ))}
                      </div>
                    )}
                    {item.specialInstructions && (
                      <div className="ml-4 text-xs text-gray-500 italic">
                        "{item.specialInstructions}"
                      </div>
                    )}
                  </div>
                ))}
              </div>
              
              {/* Totals */}
              <div className="space-y-2 pt-4 border-t">
                <div className="flex justify-between text-gray-600">
                  <span>Subtotal</span>
                  <span>{formatPrice(total)}</span>
                </div>
                <div className="flex justify-between text-gray-600">
                  <span>Domicilio</span>
                  <span>{formatPrice(deliveryFee)}</span>
                </div>
                <div className="flex justify-between text-lg font-bold text-gray-800 pt-2 border-t">
                  <span>Total</span>
                  <span>{formatPrice(finalTotal)}</span>
                </div>
              </div>
              
              {currentRestaurant && finalTotal < currentRestaurant.minOrder && (
                <div className="bg-orange-50 border border-orange-200 rounded-lg p-3 mb-4">
                  <p className="text-sm text-orange-800">
                    Pedido mínimo: {formatPrice(currentRestaurant.minOrder)}. 
                    Agrega {formatPrice(currentRestaurant.minOrder - total)} más para continuar.
                  </p>
                </div>
              )}
              
              <button
                onClick={handlePlaceOrder}
                disabled={currentRestaurant ? finalTotal < currentRestaurant.minOrder : false}
                className="w-full bg-orange-500 text-white py-3 px-4 rounded-lg font-semibold hover:bg-orange-600 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isProcessing ? 'Procesando...' : `Confirmar Pedido - ${formatPrice(finalTotal)}`}
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CheckoutPage;