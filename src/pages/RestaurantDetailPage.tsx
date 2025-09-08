import React, { useMemo, useState } from 'react';
import { ArrowLeft, Star, Clock, Truck, MapPin } from 'lucide-react';
import { Restaurant } from '../types';
import { menuItems } from '../data/restaurants';
import MenuItemCard from '../components/MenuItemCard';

interface RestaurantDetailPageProps {
  restaurant: Restaurant;
  onNavigate: (page: string, data?: any) => void;
}

const RestaurantDetailPage: React.FC<RestaurantDetailPageProps> = ({ restaurant, onNavigate }) => {
  const [selectedCategory, setSelectedCategory] = useState('all');

  const restaurantMenuItems = useMemo(() => {
    return menuItems.filter(item => item.restaurantId === restaurant.id);
  }, [restaurant.id]);

  const categories = useMemo(() => {
    const uniqueCategories = [...new Set(restaurantMenuItems.map(item => item.category))];
    return ['all', ...uniqueCategories];
  }, [restaurantMenuItems]);

  const filteredMenuItems = useMemo(() => {
    if (selectedCategory === 'all') {
      return restaurantMenuItems;
    }
    return restaurantMenuItems.filter(item => item.category === selectedCategory);
  }, [restaurantMenuItems, selectedCategory]);

  if (!restaurant.isOpen) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="text-6xl mb-4">😴</div>
          <h2 className="text-2xl font-bold text-gray-800 mb-2">Restaurante Cerrado</h2>
          <p className="text-gray-600 mb-6">Este restaurante está cerrado actualmente</p>
          <button
            onClick={() => onNavigate('restaurants')}
            className="bg-orange-500 text-white px-6 py-3 rounded-lg hover:bg-orange-600 transition-colors"
          >
            Explorar otros restaurantes
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header Image */}
      <div className="relative h-64 md:h-80">
        <img
          src={restaurant.image}
          alt={restaurant.name}
          className="w-full h-full object-cover"
        />
        <div className="absolute inset-0 bg-black bg-opacity-40"></div>
        
        {/* Back Button */}
        <button
          onClick={() => onNavigate('restaurants')}
          className="absolute top-4 left-4 bg-white bg-opacity-90 backdrop-blur-sm p-2 rounded-full hover:bg-opacity-100 transition-colors"
        >
          <ArrowLeft className="w-6 h-6 text-gray-800" />
        </button>

        {/* Restaurant Info Overlay */}
        <div className="absolute bottom-0 left-0 right-0 p-6 text-white">
          <h1 className="text-3xl font-bold mb-2">{restaurant.name}</h1>
          <p className="text-lg mb-3 text-gray-200">{restaurant.description}</p>
          
          <div className="flex flex-wrap items-center gap-4 text-sm">
            <div className="flex items-center space-x-1 bg-white bg-opacity-20 backdrop-blur-sm px-3 py-1 rounded-full">
              <Star className="w-4 h-4 text-yellow-400 fill-current" />
              <span>{restaurant.rating}</span>
            </div>
            <div className="flex items-center space-x-1 bg-white bg-opacity-20 backdrop-blur-sm px-3 py-1 rounded-full">
              <Clock className="w-4 h-4" />
              <span>{restaurant.deliveryTime}</span>
            </div>
            <div className="flex items-center space-x-1 bg-white bg-opacity-20 backdrop-blur-sm px-3 py-1 rounded-full">
              <Truck className="w-4 h-4" />
              <span>${restaurant.deliveryFee} envío</span>
            </div>
          </div>
        </div>
      </div>

      {/* Restaurant Details */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Info Cards */}
        <div className="grid md:grid-cols-3 gap-4 mb-8">
          <div className="bg-white rounded-lg p-4 shadow-md">
            <div className="flex items-center space-x-3">
              <div className="bg-orange-100 p-2 rounded-lg">
                <MapPin className="w-5 h-5 text-orange-500" />
              </div>
              <div>
                <p className="font-semibold text-gray-800">Cocina</p>
                <p className="text-gray-600">{restaurant.cuisine}</p>
              </div>
            </div>
          </div>
          
          <div className="bg-white rounded-lg p-4 shadow-md">
            <div className="flex items-center space-x-3">
              <div className="bg-green-100 p-2 rounded-lg">
                <Clock className="w-5 h-5 text-green-500" />
              </div>
              <div>
                <p className="font-semibold text-gray-800">Tiempo de Entrega</p>
                <p className="text-gray-600">{restaurant.deliveryTime}</p>
              </div>
            </div>
          </div>
          
          <div className="bg-white rounded-lg p-4 shadow-md">
            <div className="flex items-center space-x-3">
              <div className="bg-blue-100 p-2 rounded-lg">
                <Truck className="w-5 h-5 text-blue-500" />
              </div>
              <div>
                <p className="font-semibold text-gray-800">Pedido Mínimo</p>
                <p className="text-gray-600">${restaurant.minOrder}</p>
              </div>
            </div>
          </div>
        </div>

        {/* Menu Section */}
        <div className="bg-white rounded-lg shadow-md overflow-hidden">
          <div className="p-6 border-b border-gray-200">
            <h2 className="text-2xl font-bold text-gray-800 mb-4">Menú</h2>
            
            {/* Category Filter */}
            <div className="flex flex-wrap gap-2">
              {categories.map(category => (
                <button
                  key={category}
                  onClick={() => setSelectedCategory(category)}
                  className={`px-4 py-2 rounded-full text-sm font-medium transition-colors ${
                    selectedCategory === category
                      ? 'bg-orange-500 text-white'
                      : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                  }`}
                >
                  {category === 'all' ? 'Todos los artículos' : category}
                </button>
              ))}
            </div>
          </div>

          <div className="p-6">
            {filteredMenuItems.length > 0 ? (
              <div className="grid sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
                {filteredMenuItems.map(item => (
                  <MenuItemCard
                    key={item.id}
                    menuItem={item}
                    restaurant={restaurant}
                  />
                ))}
              </div>
            ) : (
              <div className="text-center py-12">
                <div className="text-gray-400 text-6xl mb-4">🍽️</div>
                <h3 className="text-xl font-semibold text-gray-600 mb-2">No hay artículos en esta categoría</h3>
                <p className="text-gray-500">Intenta seleccionar una categoría diferente</p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default RestaurantDetailPage;