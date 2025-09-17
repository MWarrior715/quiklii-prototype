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
    const queryParams = new URLSearchParams(params as any).toString();
    return apiRequest<MenuItemsResponse>(`/menu${queryParams ? `?${queryParams}` : ''}`);
  },

  // Get menu item by ID
  getById: async (id: number) => {
    return apiRequest<MenuItem>(`/menu/${id}`);
  },

  // Get restaurant's menu
  getRestaurantMenu: async (restaurantId: string) => {
    return apiRequest<MenuItem[]>(`/restaurants/${restaurantId}/menu`);
  },

  // Get menu items by category
  getByCategory: async (category: string) => {
    return apiRequest<MenuItem[]>(`/menu/category/${category}`);
  },

  // Get available menu items
  getAvailable: async () => {
    return apiRequest<MenuItem[]>('/menu/available');
  },

  // Get menu items on sale
  getOnSale: async (restaurantId?: string) => {
    const queryParams = restaurantId ? `?restaurantId=${restaurantId}` : '';
    return apiRequest<MenuItem[]>(`/menu/on-sale${queryParams}`);
  },

  // Create menu item (admin/restaurant owner only)
  create: async (itemData: Omit<MenuItem, 'id'>) => {
    return apiRequest<MenuItem>('/menu', {
      method: 'POST',
      body: JSON.stringify(itemData),
    });
  },

  // Update menu item
  update: async (id: number, itemData: Partial<MenuItem>) => {
    return apiRequest<MenuItem>(`/menu/${id}`, {
      method: 'PUT',
      body: JSON.stringify(itemData),
    });
  },

  // Delete menu item
  delete: async (id: number) => {
    return apiRequest<{ message: string }>(`/menu/${id}`, {
      method: 'DELETE',
    });
  },
};