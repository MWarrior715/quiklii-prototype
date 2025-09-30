import axios from 'axios';
import { Restaurant, ServiceType } from '../types';

// API configuration
const API_BASE_URL = 'http://localhost:3001/api/v1';

// Axios instance
export const axiosInstance = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json'
  },
  withCredentials: true // Include cookies for refresh tokens
});

// Request interceptor to add auth token
axiosInstance.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('quiklii_access_token');
    if (token && config.headers) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Response interceptor to handle token refresh
axiosInstance.interceptors.response.use(
  (response) => {
    return response;
  },
  async (error) => {
    const originalRequest = error.config;

    if (error.response?.status === 401 && !originalRequest._retry) {
      originalRequest._retry = true;

      try {
        // Try to refresh token
        const refreshResponse = await axios.post(
          `${API_BASE_URL}/auth/refresh`,
          {},
          { withCredentials: true }
        );

        if (refreshResponse.data && typeof refreshResponse.data === 'object') {
          const data = refreshResponse.data as { success?: boolean; token?: string };
          if (data.success && data.token) {
            const newToken = data.token;
            localStorage.setItem('quiklii_access_token', newToken);

            // Update the original request with new token
            if (originalRequest.headers) {
              originalRequest.headers.Authorization = `Bearer ${newToken}`;
            }

            // Retry the original request
            return axiosInstance(originalRequest);
          }
        }
      } catch (refreshError) {
        // Refresh failed, redirect to login
        localStorage.removeItem('quiklii_access_token');
        localStorage.removeItem('quiklii_user');
        console.error('Token refresh failed:', refreshError);
        // Force a hard redirect to login to clear all state
        window.location.href = '/login';
        return Promise.reject(refreshError);
      }
    }

    return Promise.reject(error);
  }
);

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
  firstName: string;
  lastName: string;
  email: string;
  phone?: string;
  role: 'customer' | 'admin' | 'restaurant';
  isVerified: boolean;
  createdAt: string;
  updatedAt: string;
  address?: string; // ✅ nuevo campo opcional
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

// ... existing code ...
// Generic API request function
export const apiRequest = async <T>(
  endpoint: string,
  method: 'GET' | 'POST' | 'PUT' | 'DELETE',
  body?: unknown,
  params?: Record<string, string>
): Promise<T> => {
  console.log(`Making API request: ${method} ${endpoint}`, { body, params });

  try {
    const response = await axiosInstance({
      url: endpoint,
      method,
      data: body,
      params,
    });

    console.log('API request successful. Response:', response.data);
    return response.data as T;
  } catch (error) {
    console.error('Error in apiRequest:', error);
    return Promise.reject<T>(error as Error);
  }
};

// Restaurant API methods
// ... existing code ...

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
    return apiRequest<RestaurantsResponse>('/restaurants', 'GET', undefined, params as Record<string, string>);
  },

  // Get restaurant by ID
  getById: async (id: string) => {
    return apiRequest<{ restaurant: RestaurantApiData }>(`/restaurants/${id}`, 'GET');
  },

  // Get top rated restaurants
  getTopRated: async (limit: number = 10) => {
    return apiRequest<{ restaurants: RestaurantApiData[] }>('/restaurants/top-rated', 'GET', undefined, { limit: String(limit) });
  },

  // Get restaurants by category
  getByCategory: async (category: string, limit: number = 20) => {
    return apiRequest<{ restaurants: RestaurantApiData[]; category: string }>(`/restaurants/category/${category}`, 'GET', undefined, { limit: String(limit) });
  },

  // Create restaurant (admin only)
  create: async (restaurantData: Partial<RestaurantApiData>) => {
    return apiRequest<{ restaurant: RestaurantApiData }>('/restaurants', 'POST', restaurantData);
  },

  // Update restaurant
  update: async (id: string, restaurantData: Partial<RestaurantApiData>) => {
    return apiRequest<{ restaurant: RestaurantApiData }>(`/restaurants/${id}`, 'PUT', restaurantData);
  },

  // Delete restaurant
  delete: async (id: string) => {
    return apiRequest<{ success: boolean; message: string }>(`/restaurants/${id}`, 'DELETE');
  },
};

// Función para obtener imagen por defecto basada en categoría
const getDefaultImage = (category: string): string => {
  const categoryImages: Record<string, string> = {
    'Italiana': 'https://images.unsplash.com/photo-1555396273-367ea4eb4db5?w=400&h=300&fit=crop',
    'Japonesa': 'https://images.unsplash.com/photo-1579871494447-9811cf80d66c?w=400&h=300&fit=crop',
    'Colombiana': 'https://images.unsplash.com/photo-1551782450-17144efb5723?w=400&h=300&fit=crop',
    'Mediterránea': 'https://images.unsplash.com/photo-1414235077428-338989a2e8c0?w=400&h=300&fit=crop',
    'Vegetariana': 'https://images.unsplash.com/photo-1540420773420-3366772f4999?w=400&h=300&fit=crop',
    'Americana': 'https://images.unsplash.com/photo-1633577825615-0d3d62b4b2e4?w=400&h=300&fit=crop',
    'China': 'https://images.unsplash.com/photo-1563379091339-03246963d4ae?w=400&h=300&fit=crop',
    'Mexicana': 'https://images.unsplash.com/photo-1568901346375-23c9450c58cd?w=400&h=300&fit=crop',
  };
  return categoryImages[category] || 'https://images.unsplash.com/photo-1517248135467-4c7edcad34c4?w=400&h=300&fit=crop';
};

// Transform API data to frontend format
export function transformRestaurantData(apiData: RestaurantApiData): Restaurant {
  console.log('🔍 [transformRestaurantData] Datos de entrada:', apiData);
  console.log('🔍 [transformRestaurantData] Address value:', apiData.address);

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

  // Safe address parsing
  let street = 'Dirección no disponible';
  let neighborhood = 'Centro';

  try {
    if (apiData.address && typeof apiData.address === 'string') {
      const addressParts = apiData.address.split(',');
      street = addressParts[0]?.trim() || apiData.address;
      neighborhood = addressParts[1]?.trim() || 'Centro';
      console.log('🔍 [transformRestaurantData] Address parsed successfully:', { street, neighborhood });
    } else {
      console.warn('⚠️ [transformRestaurantData] Address is undefined or not a string:', apiData.address);
    }
    
  } catch (error) {
    console.error('❌ [transformRestaurantData] Error parsing address:', error);
  }


  // Validar si la URL de imagen existe y es accesible
  const getValidImageUrl = (category: string, imageUrl?: string): string => {
    console.log('🔍 [getValidImageUrl] Procesando imagen para categoría:', category, 'URL:', imageUrl);

    if (!imageUrl) {
      console.log('🔍 [getValidImageUrl] No hay URL, usando imagen por defecto');
      return getDefaultImage(category);
    }

    // Lista de URLs problemáticas conocidas que deben ser reemplazadas
    const problematicUrls = [
      'https://images.unsplash.com/photo-1559054663-e8c0a7e3f0d7',
      'https://images.unsplash.com/photo-1559054663-e8c0a7e3f0d7?w=400&h=300&fit=crop'
    ];

    // Si la URL está en la lista de problemáticas, usar imagen por defecto
    if (problematicUrls.some(url => imageUrl.includes(url))) {
      console.log('🔍 [getValidImageUrl] URL problemática detectada, usando imagen por defecto para:', category);
      return getDefaultImage(category);
    }

    // Verificar si es una URL válida de Unsplash
    try {
      const url = new URL(imageUrl);
      if (url.hostname === 'images.unsplash.com') {
        // Para URLs de Unsplash, verificar que tengan parámetros básicos
        console.log('🔍 [getValidImageUrl] URL de Unsplash válida, usando original');
        return imageUrl;
      }
    } catch {
      // URL inválida, usar imagen por defecto
      console.log('🔍 [getValidImageUrl] URL inválida, usando imagen por defecto');
      return getDefaultImage(category);
    }

    console.log('🔍 [getValidImageUrl] Usando URL original');
    return imageUrl;
  };

  const result = {
    id: apiData.id,
    name: apiData.name,
    image: getValidImageUrl(apiData.category, apiData.imageUrl),
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
      street: street,
      neighborhood: neighborhood,
      city: 'Bogotá',
    },
    serviceTypes: ['delivery'] as ServiceType[],
    priceRange: priceRange,
    isPromoted: apiData.rating >= 4.5,
    promotions: undefined,
  };

  console.log('🔍 [transformRestaurantData] Resultado transformado:', result);
  return result;
}

// Función auxiliar para validar imágenes en tiempo real (para usar en componentes)
export const validateImageUrl = (imageUrl: string, category: string): string => {
  if (!imageUrl) {
    return getDefaultImage(category);
  }

  // Lista de URLs problemáticas conocidas
  const problematicUrls = [
    'https://images.unsplash.com/photo-1559054663-e8c0a7e3f0d7',
    'https://images.unsplash.com/photo-1559054663-e8c0a7e3f0d7?w=400&h=300&fit=crop'
  ];

  // Si la URL está en la lista de problemáticas, usar imagen por defecto
  if (problematicUrls.some(url => imageUrl.includes(url))) {
    return getDefaultImage(category);
  }

  // Verificar si es una URL válida
  try {
    const url = new URL(imageUrl);
    if (url.hostname === 'images.unsplash.com') {
      return imageUrl;
    }
  } catch {
    // URL inválida, usar imagen por defecto
    return getDefaultImage(category);
  }

  return imageUrl;
};

export interface RegisterData {
  firstName: string;
  lastName: string;
  email: string;
  password: string;
  phone?: string;
}

// Auth API methods (for future use)
export const authApi = {
  register: async (userData: RegisterData) => {
    return apiRequest<{
      success: boolean;
      message: string;
      data: { user: UserApiData; accessToken: string };
    }>('/auth/register', 'POST', userData);
  },

  login: async (credentials: { email: string; password: string }) => {
    return apiRequest<{
      success: boolean;
      message: string;
      data: { user: UserApiData; accessToken: string };
    }>('/auth/login', 'POST', credentials);
  },

  verify: async () => {
    return apiRequest<{
      success: boolean;
      message: string;
      data: { user: UserApiData };
    }>('/auth/verify', 'GET');
  },

  // Refresh token using httpOnly cookies
  refresh: async () => {
    return apiRequest<{
      success: boolean;
      message: string;
      data: { token: string; user: UserApiData };
    }>('/auth/refresh', 'POST');
  },

  // ✅ Logout
  logout: async () => {
    return apiRequest<{ success: boolean; message: string }>('/auth/logout', 'POST');
  },
};


// Import menu API
import { menuApi } from './menuApi';

export default {
  restaurants: restaurantApi,
  auth: authApi,
  menu: menuApi
};