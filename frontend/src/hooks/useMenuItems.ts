import { useState, useEffect, useCallback } from 'react';
import api from '../services/api';
import type { MenuItem } from '../services/menuApi';

interface UseMenuItemsResult {
  menuItems: MenuItem[];
  loading: boolean;
  error: Error | null;
  refetch: () => Promise<void>;
}

export const useMenuItems = (restaurantId?: string): UseMenuItemsResult => {
  const [menuItems, setMenuItems] = useState<MenuItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  const fetchMenuItems = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      
      const response = restaurantId
        ? await api.menu.getRestaurantMenu(restaurantId)
        : await api.menu.getAll();

      // Handle different response structures
      if (restaurantId) {
        // getRestaurantMenu returns { success: true, data: MenuItem[] }
        const apiResponse = response as { success: boolean; data: MenuItem[] };
        setMenuItems(apiResponse.data || []);
      } else {
        // getAll returns { items: MenuItem[], total: number, ... }
        const apiResponse = response as { items: MenuItem[]; total: number; currentPage: number; totalPages: number };
        setMenuItems(apiResponse.items || []);
      }
    } catch (err) {
      setError(err instanceof Error ? err : new Error('Error al cargar el menú'));
    } finally {
      setLoading(false);
    }
  }, [restaurantId]);

  useEffect(() => {
    fetchMenuItems();
  }, [fetchMenuItems]);

  return {
    menuItems,
    loading,
    error,
    refetch: fetchMenuItems
  };
};

// Hook para un ítem específico
export const useMenuItem = (itemId: number) => {
  const [menuItem, setMenuItem] = useState<MenuItem | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  const fetchMenuItem = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      
      const response = await api.menu.getById(itemId);
      setMenuItem(response as MenuItem);
    } catch (err) {
      setError(err instanceof Error ? err : new Error('Error al cargar el ítem del menú'));
    } finally {
      setLoading(false);
    }
  }, [itemId]);

  useEffect(() => {
    fetchMenuItem();
  }, [fetchMenuItem]);

  return {
    menuItem,
    loading,
    error
  };
};

// Hook para items en promoción
export const useMenuItemsOnSale = (restaurantId?: string) => {
  const [menuItems, setMenuItems] = useState<MenuItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  const fetchMenuItemsOnSale = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      
      const response = await api.menu.getOnSale(restaurantId);
      setMenuItems(response as MenuItem[]);
    } catch (err) {
      setError(err instanceof Error ? err : new Error('Error al cargar las promociones'));
    } finally {
      setLoading(false);
    }
  }, [restaurantId]);

  useEffect(() => {
    fetchMenuItemsOnSale();
  }, [fetchMenuItemsOnSale]);

  return {
    menuItems,
    loading,
    error
  };
};