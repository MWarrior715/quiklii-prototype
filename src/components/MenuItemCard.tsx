import React from 'react';
import { Plus, Leaf, Flame } from 'lucide-react';
import { MenuItem, Restaurant } from '../types';
import { useCart } from '../contexts/CartContext';

interface MenuItemCardProps {
  menuItem: MenuItem;
  restaurant: Restaurant;
}

const MenuItemCard: React.FC<MenuItemCardProps> = ({ menuItem, restaurant }) => {
  const { addItem } = useCart();

  const handleAddToCart = () => {
    addItem(menuItem, restaurant);
  };

  return (
    <div className="bg-white rounded-lg shadow-md hover:shadow-lg transition-all duration-300 overflow-hidden group">
      <div className="relative">
        <img
          src={menuItem.image}
          alt={menuItem.name}
          className="w-full h-32 object-cover group-hover:scale-105 transition-transform duration-300"
        />
        <div className="absolute top-2 left-2 flex space-x-1">
          {menuItem.isVegetarian && (
            <div className="bg-green-500 text-white p-1 rounded-full">
              <Leaf className="w-3 h-3" />
            </div>
          )}
          {menuItem.isSpicy && (
            <div className="bg-red-500 text-white p-1 rounded-full">
              <Flame className="w-3 h-3" />
            </div>
          )}
        </div>
      </div>
      
      <div className="p-4">
        <div className="flex justify-between items-start mb-2">
          <h4 className="font-semibold text-gray-800 text-sm">{menuItem.name}</h4>
          <span className="font-bold text-orange-500">${menuItem.price}</span>
        </div>
        
        <p className="text-gray-600 text-xs mb-3 line-clamp-2">{menuItem.description}</p>
        
        <button
          onClick={handleAddToCart}
          className="w-full bg-orange-500 text-white py-2 px-3 rounded-lg hover:bg-orange-600 transition-colors flex items-center justify-center space-x-1 text-sm"
        >
          <Plus className="w-4 h-4" />
          <span>Add to Cart</span>
        </button>
      </div>
    </div>
  );
};

export default MenuItemCard;