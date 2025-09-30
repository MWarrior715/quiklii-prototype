import React from 'react';
import { Clock, Star, Truck, MapPin, Zap } from 'lucide-react';
import { Restaurant, ServiceType } from '../../types';
import { validateImageUrl } from '../../services/api';

interface RestaurantCardProps {
  restaurant: Restaurant;
  onClick: () => void;
}

const RestaurantCard: React.FC<RestaurantCardProps> = ({ restaurant, onClick }) => {
  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('es-CO', {
      style: 'currency',
      currency: 'COP',
      minimumFractionDigits: 0
    }).format(price);
  };

  const getPriceRangeDisplay = (range: number) => {
    return '$'.repeat(range);
  };

  return (
    <div 
      className="bg-white rounded-xl shadow-md hover:shadow-lg transition-all duration-300 cursor-pointer group overflow-hidden"
      onClick={onClick}
    >
      <div className="relative">
        <img
          src={validateImageUrl(restaurant.image, restaurant.cuisine[0] || 'Restaurante')}
          alt={restaurant.name}
          className="w-full h-48 object-cover group-hover:scale-105 transition-transform duration-300"
        />
        
        {/* Overlay for closed restaurants */}
        {!restaurant.isOpen && (
          <div className="absolute inset-0 bg-black bg-opacity-50 flex items-center justify-center">
            <span className="bg-red-500 text-white px-3 py-1 rounded-lg font-semibold">
              Cerrado
            </span>
          </div>
        )}
        
        {/* Promoted badge */}
        {restaurant.isPromoted && (
          <div className="absolute top-3 left-3 bg-orange-500 text-white px-2 py-1 rounded-lg text-xs font-semibold flex items-center space-x-1">
            <Zap className="w-3 h-3" />
            <span>Promoción</span>
          </div>
        )}
        
        {/* Rating badge */}
        <div className="absolute top-3 right-3 bg-white bg-opacity-90 backdrop-blur-sm px-2 py-1 rounded-lg">
          <div className="flex items-center space-x-1">
            <Star className="w-4 h-4 text-yellow-400 fill-current" />
            <span className="text-sm font-semibold text-gray-800">{restaurant.rating}</span>
            <span className="text-xs text-gray-600">({restaurant.reviewCount})</span>
          </div>
        </div>
      </div>
      
      <div className="p-4">
        <div className="flex justify-between items-start mb-2">
          <h3 className="font-bold text-lg text-gray-800 group-hover:text-orange-500 transition-colors line-clamp-1">
            {restaurant.name}
          </h3>
          <span className="text-sm font-semibold text-gray-600">
            {getPriceRangeDisplay(restaurant.priceRange)}
          </span>
        </div>
        
        <div className="flex flex-wrap gap-1 mb-3">
          {restaurant.cuisine.slice(0, 2).map((cuisine: string, index: number) => (
            <span key={index} className="text-xs bg-gray-100 text-gray-600 px-2 py-1 rounded-full">
              {cuisine}
            </span>
          ))}
          {restaurant.cuisine.length > 2 && (
            <span className="text-xs text-gray-500">+{restaurant.cuisine.length - 2}</span>
          )}
        </div>
        
        <div className="flex items-center justify-between text-sm text-gray-500 mb-2">
          <div className="flex items-center space-x-1">
            <Clock className="w-4 h-4" />
            <span>{restaurant.deliveryTime}</span>
          </div>
          <div className="flex items-center space-x-1">
            <Truck className="w-4 h-4" />
            <span>{formatPrice(restaurant.deliveryFee)}</span>
          </div>
        </div>
        
        <div className="flex items-center justify-between text-xs text-gray-500">
          <div className="flex items-center space-x-1">
            <MapPin className="w-3 h-3" />
            <span>{restaurant.address.neighborhood}</span>
          </div>
          <span>Min. {formatPrice(restaurant.minOrder)}</span>
        </div>
        
        {/* Service types */}
        <div className="flex space-x-1 mt-2">
          {restaurant.serviceTypes.map((type: ServiceType) => (
            <span
              key={type}
              className="text-xs bg-orange-100 text-orange-600 px-2 py-1 rounded-full"
            >
              {type === 'delivery' ? 'Delivery' : type === 'dining' ? 'Restaurante' : 'Nocturno'}
            </span>
          ))}
        </div>

        {/* Promotions */}
        {restaurant.promotions && restaurant.promotions.length > 0 && (
          <div className="mt-2 p-2 bg-orange-50 rounded-lg">
            <p className="text-xs text-orange-800 font-semibold">
              {restaurant.promotions[0].title}
            </p>
          </div>
        )}
      </div>
    </div>
  );
};

export default RestaurantCard;