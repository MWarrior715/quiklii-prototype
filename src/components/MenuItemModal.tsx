import React, { useState } from 'react';
import { X, Plus, Minus, Leaf, Flame } from 'lucide-react';
import { MenuItem, Restaurant, SelectedModifier } from '../types';

interface MenuItemModalProps {
  menuItem: MenuItem;
  restaurant: Restaurant;
  onClose: () => void;
  onAddToCart: (selectedModifiers: SelectedModifier[], specialInstructions: string, quantity: number) => void;
}

const MenuItemModal: React.FC<MenuItemModalProps> = ({ 
  menuItem, 
  restaurant, 
  onClose, 
  onAddToCart 
}) => {
  const [selectedModifiers, setSelectedModifiers] = useState<SelectedModifier[]>([]);
  const [specialInstructions, setSpecialInstructions] = useState('');
  const [quantity, setQuantity] = useState(1);

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('es-CO', {
      style: 'currency',
      currency: 'COP',
      minimumFractionDigits: 0
    }).format(price);
  };

  const handleModifierChange = (modifierId: string, optionId: string, optionName: string, optionPrice: number, isMultiple: boolean) => {
    if (isMultiple) {
      // Multiple selection modifier
      const existingIndex = selectedModifiers.findIndex(m => m.modifierId === modifierId && m.optionId === optionId);
      if (existingIndex >= 0) {
        // Remove if already selected
        setSelectedModifiers(prev => prev.filter((_, index) => index !== existingIndex));
      } else {
        // Add new selection
        setSelectedModifiers(prev => [...prev, {
          modifierId,
          optionId,
          name: optionName,
          price: optionPrice
        }]);
      }
    } else {
      // Single selection modifier
      setSelectedModifiers(prev => [
        ...prev.filter(m => m.modifierId !== modifierId),
        { modifierId, optionId, name: optionName, price: optionPrice }
      ]);
    }
  };

  const isModifierSelected = (modifierId: string, optionId: string) => {
    return selectedModifiers.some(m => m.modifierId === modifierId && m.optionId === optionId);
  };

  const getModifierPrice = () => {
    return selectedModifiers.reduce((total, modifier) => total + modifier.price, 0);
  };

  const getTotalPrice = () => {
    return (menuItem.price + getModifierPrice()) * quantity;
  };

  const canAddToCart = () => {
    if (!menuItem.modifiers) return true;
    
    // Check if all required modifiers are selected
    return menuItem.modifiers.every(modifier => {
      if (!modifier.required) return true;
      return selectedModifiers.some(selected => selected.modifierId === modifier.id);
    });
  };

  const handleAddToCart = () => {
    if (canAddToCart()) {
      onAddToCart(selectedModifiers, specialInstructions, quantity);
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-lg max-w-md w-full max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="relative">
          <img
            src={menuItem.image}
            alt={menuItem.name}
            className="w-full h-48 object-cover"
          />
          <button
            onClick={onClose}
            className="absolute top-4 right-4 bg-white bg-opacity-90 backdrop-blur-sm p-2 rounded-full hover:bg-opacity-100 transition-colors"
          >
            <X className="w-5 h-5 text-gray-800" />
          </button>
          
          <div className="absolute top-4 left-4 flex space-x-2">
            {menuItem.isVegetarian && (
              <div className="bg-green-500 text-white p-2 rounded-full">
                <Leaf className="w-4 h-4" />
              </div>
            )}
            {menuItem.isSpicy && (
              <div className="bg-red-500 text-white p-2 rounded-full">
                <Flame className="w-4 h-4" />
              </div>
            )}
          </div>
        </div>

        <div className="p-6">
          {/* Item Info */}
          <div className="mb-6">
            <h2 className="text-xl font-bold text-gray-800 mb-2">{menuItem.name}</h2>
            <p className="text-gray-600 mb-3">{menuItem.description}</p>
            <p className="text-lg font-bold text-orange-500">{formatPrice(menuItem.price)}</p>
          </div>

          {/* Modifiers */}
          {menuItem.modifiers && menuItem.modifiers.map(modifier => (
            <div key={modifier.id} className="mb-6">
              <h3 className="font-semibold text-gray-800 mb-3">
                {modifier.name}
                {modifier.required && <span className="text-red-500 ml-1">*</span>}
                <span className="text-sm text-gray-500 ml-2">
                  ({modifier.type === 'single' ? 'Selecciona uno' : 'Selecciona varios'})
                </span>
              </h3>
              
              <div className="space-y-2">
                {modifier.options.map(option => (
                  <label
                    key={option.id}
                    className="flex items-center justify-between p-3 border border-gray-200 rounded-lg hover:bg-gray-50 cursor-pointer"
                  >
                    <div className="flex items-center">
                      <input
                        type={modifier.type === 'single' ? 'radio' : 'checkbox'}
                        name={modifier.type === 'single' ? modifier.id : undefined}
                        checked={isModifierSelected(modifier.id, option.id)}
                        onChange={() => handleModifierChange(
                          modifier.id, 
                          option.id, 
                          option.name, 
                          option.price,
                          modifier.type === 'multiple'
                        )}
                        className="text-orange-500 focus:ring-orange-500"
                      />
                      <span className="ml-3 text-gray-800">{option.name}</span>
                    </div>
                    {option.price > 0 && (
                      <span className="text-orange-500 font-semibold">
                        +{formatPrice(option.price)}
                      </span>
                    )}
                  </label>
                ))}
              </div>
            </div>
          ))}

          {/* Special Instructions */}
          <div className="mb-6">
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Instrucciones especiales (opcional)
            </label>
            <textarea
              value={specialInstructions}
              onChange={(e) => setSpecialInstructions(e.target.value)}
              placeholder="Ej: Sin cebolla, término medio, etc."
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent"
              rows={3}
            />
          </div>

          {/* Quantity and Add to Cart */}
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <button
                onClick={() => setQuantity(Math.max(1, quantity - 1))}
                className="p-2 rounded-full bg-gray-100 hover:bg-gray-200 transition-colors"
              >
                <Minus className="w-4 h-4" />
              </button>
              <span className="font-semibold text-lg min-w-[2rem] text-center">{quantity}</span>
              <button
                onClick={() => setQuantity(quantity + 1)}
                className="p-2 rounded-full bg-gray-100 hover:bg-gray-200 transition-colors"
              >
                <Plus className="w-4 h-4" />
              </button>
            </div>

            <button
              onClick={handleAddToCart}
              disabled={!canAddToCart()}
              className="bg-orange-500 text-white px-6 py-3 rounded-lg font-semibold hover:bg-orange-600 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Agregar {formatPrice(getTotalPrice())}
            </button>
          </div>

          {!canAddToCart() && (
            <p className="text-red-500 text-sm mt-2">
              Por favor selecciona todas las opciones requeridas
            </p>
          )}
        </div>
      </div>
    </div>
  );
};

export default MenuItemModal;