import { apiRequest } from './api';

export interface MenuItem {
  id: number;
  name: string;
  description?: string;
  price: number;
  image?: string;
  available: boolean;
  restaurantId: string;
  category?: string;
  preparationTime?: number;
  isVegetarian: boolean;
  isSpicy: boolean;
  allergens?: string[];
  nutritionalInfo?: {
    calories?: number;
    protein?: number;
    carbs?: number;
    fat?: number;
  };
  discount?: number;
  discountedPrice?: number;
}

export interface MenuItemsResponse {
  items: MenuItem[];
  total: number;
  currentPage: number;
  totalPages: number;
}

export const menuApi = {
  // Get all menu items with pagination
  getAll: async (params: {
    page?: number;
    limit?: number;
  } = {}) => {
    return apiRequest<MenuItemsResponse>('/menu', 'GET', undefined, params as Record<string, string>);
  },

  // Get menu item by ID
  getById: async (id: number) => {
    return apiRequest<MenuItem>(`/menu/${id}`, 'GET');
  },

  // Get restaurant's menu
  getRestaurantMenu: async (restaurantId: string) => {
    return apiRequest<{ success: boolean; data: MenuItem[] }>(`/restaurants/${restaurantId}/menu`, 'GET');
  },

  // Get menu items by category
  getByCategory: async (category: string) => {
    return apiRequest<MenuItem[]>(`/menu/category/${category}`, 'GET');
  },

  // Get available menu items
  getAvailable: async () => {
    return apiRequest<MenuItem[]>('/menu/available', 'GET');
  },

  // Get menu items on sale
  getOnSale: async (restaurantId?: string) => {
    const params = restaurantId ? { restaurantId } : undefined;
    return apiRequest<MenuItem[]>('/menu/on-sale', 'GET', undefined, params);
  },

  // Create menu item (admin/restaurant owner only)
  create: async (itemData: Omit<MenuItem, 'id'>) => {
    return apiRequest<MenuItem>('/menu', 'POST', itemData);
  },

  // Update menu item
  update: async (id: number, itemData: Partial<MenuItem>) => {
    return apiRequest<MenuItem>(`/menu/${id}`, 'PUT', itemData);
  },

  // Delete menu item
  delete: async (id: number) => {
    return apiRequest<{ message: string }>(`/menu/${id}`, 'DELETE');
  },
};