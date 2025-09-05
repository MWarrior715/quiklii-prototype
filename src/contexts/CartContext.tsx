import React, { createContext, useContext, useState, useEffect } from 'react';
import { CartItem, MenuItem, Restaurant } from '../types';

interface CartContextType {
  items: CartItem[];
  addItem: (menuItem: MenuItem, restaurant: Restaurant) => void;
  removeItem: (itemId: string) => void;
  updateQuantity: (itemId: string, quantity: number) => void;
  clearCart: () => void;
  getTotalPrice: () => number;
  getTotalItems: () => number;
  currentRestaurant: Restaurant | null;
}

const CartContext = createContext<CartContextType | undefined>(undefined);

export const useCart = () => {
  const context = useContext(CartContext);
  if (context === undefined) {
    throw new Error('useCart must be used within a CartProvider');
  }
  return context;
};

export const CartProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [items, setItems] = useState<CartItem[]>([]);
  const [currentRestaurant, setCurrentRestaurant] = useState<Restaurant | null>(null);

  useEffect(() => {
    const savedCart = localStorage.getItem('quiklii_cart');
    const savedRestaurant = localStorage.getItem('quiklii_current_restaurant');
    
    if (savedCart) {
      setItems(JSON.parse(savedCart));
    }
    if (savedRestaurant) {
      setCurrentRestaurant(JSON.parse(savedRestaurant));
    }
  }, []);

  useEffect(() => {
    localStorage.setItem('quiklii_cart', JSON.stringify(items));
  }, [items]);

  useEffect(() => {
    if (currentRestaurant) {
      localStorage.setItem('quiklii_current_restaurant', JSON.stringify(currentRestaurant));
    }
  }, [currentRestaurant]);

  const addItem = (menuItem: MenuItem, restaurant: Restaurant) => {
    // If adding from different restaurant, clear cart
    if (currentRestaurant && currentRestaurant.id !== restaurant.id) {
      setItems([]);
      setCurrentRestaurant(restaurant);
    } else if (!currentRestaurant) {
      setCurrentRestaurant(restaurant);
    }

    setItems(prevItems => {
      const existingItem = prevItems.find(item => item.menuItem.id === menuItem.id);
      
      if (existingItem) {
        return prevItems.map(item =>
          item.menuItem.id === menuItem.id
            ? { ...item, quantity: item.quantity + 1 }
            : item
        );
      } else {
        return [...prevItems, { menuItem, quantity: 1, restaurant }];
      }
    });
  };

  const removeItem = (itemId: string) => {
    setItems(prevItems => {
      const newItems = prevItems.filter(item => item.menuItem.id !== itemId);
      if (newItems.length === 0) {
        setCurrentRestaurant(null);
        localStorage.removeItem('quiklii_current_restaurant');
      }
      return newItems;
    });
  };

  const updateQuantity = (itemId: string, quantity: number) => {
    if (quantity <= 0) {
      removeItem(itemId);
      return;
    }

    setItems(prevItems =>
      prevItems.map(item =>
        item.menuItem.id === itemId
          ? { ...item, quantity }
          : item
      )
    );
  };

  const clearCart = () => {
    setItems([]);
    setCurrentRestaurant(null);
    localStorage.removeItem('quiklii_cart');
    localStorage.removeItem('quiklii_current_restaurant');
  };

  const getTotalPrice = () => {
    return items.reduce((total, item) => total + (item.menuItem.price * item.quantity), 0);
  };

  const getTotalItems = () => {
    return items.reduce((total, item) => total + item.quantity, 0);
  };

  return (
    <CartContext.Provider value={{
      items,
      addItem,
      removeItem,
      updateQuantity,
      clearCart,
      getTotalPrice,
      getTotalItems,
      currentRestaurant
    }}>
      {children}
    </CartContext.Provider>
  );
};