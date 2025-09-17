import axios from 'axios';
import { Restaurant, ServiceType } from '../types';

// API configuration
const API_BASE_URL = 'http://localhost:3001/api/v1';

// Axios instance
export const axiosInstance = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json'
  }
});

// Types for API responses
export interface ApiResponse<T> {
  success: boolean;
  message: string;
  data: T;
  errors?: {
    field?: string;
    message: string;
  }[];
}

export interface UserApiData {
  id: string;
  name: string;
  email: string;
  phone?: string;
  role: 'customer' | 'admin' | 'restaurant';
  isVerified: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface RestaurantApiData {
  id: string;
  name: string;
  address: string;
  phone?: string;
  imageUrl?: string;
  category: string;
  rating: number;
  description?: string;
  deliveryTime: number;
  deliveryFee: number;
  minOrder: number;
  isActive: boolean;
  openingTime?: string;
  closingTime?: string;
  created_at: string;
  updated_at: string;
  reviewCount?: number; // ✅ nuevo campo
}

export interface PaginationData {
  currentPage: number;
  totalPages: number;
  totalItems: number;
  limit: number;
}

export interface RestaurantsResponse {
  restaurants: RestaurantApiData[];
  pagination: PaginationData;
}

// Generic API request function
export async function apiRequest<T>(
  endpoint: string, 
  options: RequestInit = {}
): Promise<ApiResponse<T>> {
  try {
    const url = `${API_BASE_URL}${endpoint}`;
    
    const config: RequestInit = {
      headers: {
        'Content-Type': 'application/json',
        ...options.headers,
      },
      ...options,
    };

    const response = await fetch(url, config);
    
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }
    
    const data = await response.json();
    return data;
    
  } catch (error) {
    console.error('API request failed:', error);
    throw error;
  }
}

// Restaurant API methods
export const restaurantApi = {
  // Get all restaurants with filters
  getAll: async (params: {
    category?: string;
    minRating?: number;
    search?: string;
    sortBy?: string;
    order?: string;
    limit?: number;
    page?: number;
  } = {}) => {
    const queryParams = new URLSearchParams();
    
    Object.entries(params).forEach(([key, value]) => {
      if (value !== undefined && value !== null) {
        queryParams.append(key, value.toString());
      }
    });
    
    const queryString = queryParams.toString();
    const endpoint = `/restaurants${queryString ? `?${queryString}` : ''}`;
    
    return apiRequest<RestaurantsResponse>(endpoint);
  },

  // Get restaurant by ID
  getById: async (id: string) => {
    return apiRequest<{ restaurant: RestaurantApiData }>(`/restaurants/${id}`);
  },

  // Get top rated restaurants
  getTopRated: async (limit: number = 10) => {
    return apiRequest<{ restaurants: RestaurantApiData[] }>(`/restaurants/top-rated?limit=${limit}`);
  },

  // Get restaurants by category
  getByCategory: async (category: string, limit: number = 20) => {
    return apiRequest<{ restaurants: RestaurantApiData[]; category: string }>(`/restaurants/category/${category}?limit=${limit}`);
  },

  // Create restaurant (admin only)
  create: async (restaurantData: Partial<RestaurantApiData>) => {
    return apiRequest<{ restaurant: RestaurantApiData }>('/restaurants', {
      method: 'POST',
      body: JSON.stringify(restaurantData),
    });
  },

  // Update restaurant
  update: async (id: string, restaurantData: Partial<RestaurantApiData>) => {
    return apiRequest<{ restaurant: RestaurantApiData }>(`/restaurants/${id}`, {
      method: 'PUT',
      body: JSON.stringify(restaurantData),
    });
  },

  // Delete restaurant
  delete: async (id: string) => {
    return apiRequest<{ success: boolean; message: string }>(`/restaurants/${id}`, {
      method: 'DELETE',
    });
  },
};

// Transform API data to frontend format
export function transformRestaurantData(apiData: RestaurantApiData): Restaurant {
  const openingTime = apiData.openingTime || '10:00';
  const closingTime = apiData.closingTime || '22:00';

  const openingHours = {
    monday: { open: openingTime, close: closingTime, isOpen: true },
    tuesday: { open: openingTime, close: closingTime, isOpen: true },
    wednesday: { open: openingTime, close: closingTime, isOpen: true },
    thursday: { open: openingTime, close: closingTime, isOpen: true },
    friday: { open: openingTime, close: closingTime, isOpen: true },
    saturday: { open: openingTime, close: closingTime, isOpen: true },
    sunday: { open: openingTime, close: closingTime, isOpen: true },
  };

  const priceRange = Math.max(1, Math.min(4, Math.ceil(apiData.rating))) as 1 | 2 | 3 | 4;

  return {
    id: apiData.id,
    name: apiData.name,
    image: apiData.imageUrl || 'https://images.unsplash.com/photo-1517248135467-4c7edcad34c4?w=400&h=300&fit=crop',
    logo: undefined,
    cuisine: [apiData.category],
    rating: apiData.rating,
    reviewCount: apiData.reviewCount ?? 0,
    deliveryTime: `${Math.max(10, apiData.deliveryTime - 10)}-${apiData.deliveryTime} min`,
    deliveryFee: apiData.deliveryFee,
    minOrder: apiData.minOrder,
    isOpen: true, // We'll improve this logic later
    openingHours: openingHours,
    description: apiData.description || '',
    address: {
      street: apiData.address,
      neighborhood: apiData.address.split(',')[1]?.trim() || 'Centro',
      city: 'Bogotá',
    },
    serviceTypes: ['delivery'] as ServiceType[],
    priceRange: priceRange,
    isPromoted: apiData.rating >= 4.5,
    promotions: undefined,
  };
}

// Auth API methods (for future use)
export const authApi = {
  register: async (userData: {
    name: string;
    email: string;
    password: string;
    phone?: string;
  }) => {
    return apiRequest<{ user: UserApiData; token: string }>('/auth/register', {
      method: 'POST',
      body: JSON.stringify(userData),
    });
  },

  login: async (credentials: { email: string; password: string }) => {
    return apiRequest<{ user: UserApiData; token: string }>('/auth/login', {
      method: 'POST',
      body: JSON.stringify(credentials),
    });
  },

  verify: async (token: string) => {
    return apiRequest<{ user: UserApiData }>('/auth/verify', {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });
  },
};

// Import menu API
import { menuApi } from './menuApi';

export default {
  restaurants: restaurantApi,
  auth: authApi,
  menu: menuApi
};