import React from 'react';
import { MenuItem } from '../../services/menuApi';
import MenuCard from '../cards/MenuCard';

interface MenuListProps {
  items: MenuItem[];
  onAddToCart?: (item: MenuItem) => void;
  loading?: boolean;
  error?: Error | null;
}

const MenuList: React.FC<MenuListProps> = ({ items, onAddToCart, loading, error }) => {
  if (loading) {
    return (
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 animate-pulse">
        {[1, 2, 3, 4, 5, 6].map((n) => (
          <div key={n} className="bg-gray-200 h-48 rounded-lg"></div>
        ))}
      </div>
    );
  }

  if (error) {
    return (
      <div className="text-center py-8">
        <p className="text-red-500">Error al cargar el menú: {error.message}</p>
      </div>
    );
  }

  if (!items.length) {
    return (
      <div className="text-center py-8">
        <p className="text-gray-500">No hay items disponibles en el menú</p>
      </div>
    );
  }

  // Agrupar items por categoría
  const itemsByCategory = items.reduce((acc, item) => {
    const category = item.category || 'Sin categoría';
    if (!acc[category]) {
      acc[category] = [];
    }
    acc[category].push(item);
    return acc;
  }, {} as Record<string, MenuItem[]>);

  return (
    <div className="space-y-8">
      {Object.entries(itemsByCategory).map(([category, categoryItems]) => (
        <div key={category} className="space-y-4">
          <h2 className="text-2xl font-bold text-gray-800">{category}</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {categoryItems.map((item) => (
              <MenuCard
                key={item.id}
                item={item}
                onAddToCart={onAddToCart}
              />
            ))}
          </div>
        </div>
      ))}
    </div>
  );
};

export default MenuList;