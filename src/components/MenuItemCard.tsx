import React, { useState } from 'react';
import { Plus, Leaf, Flame, Clock } from 'lucide-react';
import { MenuItem, Restaurant, MenuModifier, SelectedModifier } from '../types';
import { useCart } from '../contexts/CartContext';
import MenuItemModal from './MenuItemModal';

interface MenuItemCardProps {
  menuItem: MenuItem;
  restaurant: Restaurant;
}

const MenuItemCard: React.FC<MenuItemCardProps> = ({ menuItem, restaurant }) => {
  const { addItem } = useCart();
  const [showModal, setShowModal] = useState(false);

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('es-CO', {
      style: 'currency',
      currency: 'COP',
      minimumFractionDigits: 0
    }).format(price);
  };

  const handleAddToCart = () => {
    if (menuItem.modifiers && menuItem.modifiers.length > 0) {
      setShowModal(true);
    } else {
      addItem({
        menuItem,
        quantity: 1,
        restaurant,
        selectedModifiers: [],
        specialInstructions: ''
      });
    }
  };

  const handleModalAddToCart = (selectedModifiers: SelectedModifier[], specialInstructions: string, quantity: number) => {
    addItem({
      menuItem,
      quantity,
      restaurant,
      selectedModifiers,
      specialInstructions
    });
    setShowModal(false);
  };

  return (
    <>
      <div className={`bg-white rounded-lg shadow-md hover:shadow-lg transition-all duration-300 overflow-hidden group ${
        !menuItem.isAvailable ? 'opacity-60' : ''
      }`}>
        <div className="relative">
          <img
            src={menuItem.image}
            alt={menuItem.name}
            className="w-full h-32 object-cover group-hover:scale-105 transition-transform duration-300"
          />
          
          {!menuItem.isAvailable && (
            <div className="absolute inset-0 bg-black bg-opacity-50 flex items-center justify-center">
              <span className="bg-red-500 text-white px-2 py-1 rounded text-xs font-semibold">
                No disponible
              </span>
            </div>
          )}
          
          <div className="absolute top-2 left-2 flex space-x-1">
            {menuItem.isVegetarian && (
              <div className="bg-green-500 text-white p-1 rounded-full" title="Vegetariano">
                <Leaf className="w-3 h-3" />
              </div>
            )}
            {menuItem.isSpicy && (
              <div className="bg-red-500 text-white p-1 rounded-full" title="Picante">
                <Flame className="w-3 h-3" />
              </div>
            )}
          </div>
          
          {menuItem.preparationTime && (
            <div className="absolute top-2 right-2 bg-black bg-opacity-70 text-white px-2 py-1 rounded-full text-xs flex items-center space-x-1">
              <Clock className="w-3 h-3" />
              <span>{menuItem.preparationTime}min</span>
            </div>
          )}
        </div>
        
        <div className="p-4">
          <div className="flex justify-between items-start mb-2">
            <h4 className="font-semibold text-gray-800 text-sm line-clamp-2">{menuItem.name}</h4>
            <span className="font-bold text-orange-500 text-sm ml-2">
              {formatPrice(menuItem.price)}
            </span>
          </div>
          
          <p className="text-gray-600 text-xs mb-3 line-clamp-2">{menuItem.description}</p>
          
          {menuItem.modifiers && menuItem.modifiers.length > 0 && (
            <div className="mb-3">
              <p className="text-xs text-gray-500">Personalizable</p>
            </div>
          )}
          
          <button
            onClick={handleAddToCart}
            disabled={!menuItem.isAvailable}
            className="w-full bg-orange-500 text-white py-2 px-3 rounded-lg hover:bg-orange-600 transition-colors flex items-center justify-center space-x-1 text-sm disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <Plus className="w-4 h-4" />
            <span>{menuItem.modifiers && menuItem.modifiers.length > 0 ? 'Personalizar' : 'Agregar'}</span>
          </button>
        </div>
      </div>

      {showModal && (
        <MenuItemModal
          menuItem={menuItem}
          restaurant={restaurant}
          onClose={() => setShowModal(false)}
          onAddToCart={handleModalAddToCart}
        />
      )}
    </>
  );
};

export default MenuItemCard;