import React from 'react';
import { ShoppingCart, Clock, Leaf, Flame } from 'lucide-react';
import { MenuItem } from '../services/menuApi';

interface MenuCardProps {
  item: MenuItem;
  onAddToCart?: (item: MenuItem) => void;
}

const MenuCard: React.FC<MenuCardProps> = ({ item, onAddToCart }) => {
  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('es-CO', {
      style: 'currency',
      currency: 'COP',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(price / 100); // si el API devuelve centavos
  };

  return (
    <div className="bg-white rounded-lg shadow-md overflow-hidden hover:shadow-lg transition-shadow duration-300">
      {/* Imagen del plato */}
      {item.image && (
        <div className="relative h-48 overflow-hidden">
          <img
            src={item.image}
            alt={`Plato: ${item.name}`}
            className="w-full h-full object-cover"
          />
          {item.discount && item.discount > 0 && (
            <div className="absolute top-2 right-2 bg-red-500 text-white px-2 py-1 rounded-full text-sm font-bold">
              -{item.discount}%
            </div>
          )}
        </div>
      )}

      {/* Contenido */}
      <div className="p-4">
        <div className="flex justify-between items-start mb-2">
          <h3 className="text-lg font-semibold text-gray-800">{item.name}</h3>
          <div className="flex space-x-1">
            {item.isVegetarian && (
              <span title="Vegetariano">
                <Leaf className="w-5 h-5 text-green-500" />
              </span>
            )}
            {item.isSpicy && (
              <span title="Picante">
                <Flame className="w-5 h-5 text-red-500" />
              </span>
            )}
          </div>
        </div>

        {/* Descripción */}
        {item.description && (
          <p className="text-gray-600 text-sm mb-3 line-clamp-2">
            {item.description}
          </p>
        )}

        {/* Tiempo de preparación */}
        {item.preparationTime && (
          <div className="flex items-center text-gray-500 text-sm mb-3">
            <Clock className="w-4 h-4 mr-1" />
            <span>{item.preparationTime} min</span>
          </div>
        )}

        {/* Precio y botón de agregar al carrito */}
        <div className="flex justify-between items-center mt-4">
          <div className="space-y-1">
            {item.discount && item.discount > 0 && item.discountedPrice ? (
              <div className="text-lg">
                <span className="line-through text-gray-400 text-sm">
                  {formatPrice(item.price)}
                </span>
                <span className="text-red-500 font-bold ml-2 text-xl">
                  {formatPrice(item.discountedPrice)}
                </span>
              </div>
            ) : (
              <div className="text-xl font-bold text-primary-600">
                {formatPrice(item.price)}
              </div>      
            )}
          </div>

          {onAddToCart && item.available && (
            <button
              onClick={() => onAddToCart(item)}
              className="flex items-center space-x-1 bg-primary-600 hover:bg-primary-700 text-white px-3 py-2 rounded-lg transition-colors duration-200"
            >
              <ShoppingCart className="w-5 h-5" />
              <span>Agregar</span>
            </button>
          )}
          
          {!item.available && (
            <span className="text-red-500 text-sm font-medium">
              No disponible
            </span>
          )}
        </div>

      </div>
    </div>
  );
};

export default MenuCard;