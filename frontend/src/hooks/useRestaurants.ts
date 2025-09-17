import { useState, useEffect, useCallback } from 'react';
import { restaurantApi, transformRestaurantData } from '../services/api';
import { Restaurant } from '../types';

export interface UseRestaurantsParams {
  category?: string;
  minRating?: number;
  search?: string;
  sortBy?: string;
  order?: string;
  limit?: number;
  page?: number;
}

export interface UseRestaurantsResult {
  restaurants: Restaurant[];
  loading: boolean;
  error: string | null;
  totalItems: number;
  totalPages: number;
  currentPage: number;
  refetch: () => void;
}

export const useRestaurants = (params: UseRestaurantsParams = {}): UseRestaurantsResult => {
  const [restaurants, setRestaurants] = useState<Restaurant[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [totalItems, setTotalItems] = useState(0);
  const [totalPages, setTotalPages] = useState(0);
  const [currentPage, setCurrentPage] = useState(1);

  const fetchRestaurants = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);

      const response = await restaurantApi.getAll(params);
      
      if (response.success) {
        const transformedRestaurants = response.data.restaurants.map(transformRestaurantData);
        setRestaurants(transformedRestaurants);
        setTotalItems(response.data.pagination.totalItems);
        setTotalPages(response.data.pagination.totalPages);
        setCurrentPage(response.data.pagination.currentPage);
      } else {
        setError('Error obteniendo restaurantes');
      }
    } catch (err) {
      console.error('Error fetching restaurants:', err);
      setError('Error de conexión con el servidor');
    } finally {
      setLoading(false);
    }
  }, [params]);

  useEffect(() => {
    fetchRestaurants();
  }, [fetchRestaurants]);

  return {
    restaurants,
    loading,
    error,
    totalItems,
    totalPages,
    currentPage,
    refetch: fetchRestaurants,
  };
};

export const useTopRatedRestaurants = (limit: number = 10) => {
  const [restaurants, setRestaurants] = useState<Restaurant[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchTopRated = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);

      const response = await restaurantApi.getTopRated(limit);

      if (response.success) {
        const transformedRestaurants = response.data.restaurants.map(transformRestaurantData);
        setRestaurants(transformedRestaurants);
      } else {
        setError('Error obteniendo restaurantes mejor calificados');
      }
    } catch (err) {
      console.error('Error fetching top rated restaurants:', err);
      setError('Error de conexión con el servidor');
    } finally {
      setLoading(false);
    }
  }, [limit]);

  useEffect(() => {
    fetchTopRated();
  }, [limit]); // Cambiar dependencia a solo 'limit' en lugar de 'fetchTopRated'

  return {
    restaurants,
    loading,
    error,
    refetch: fetchTopRated,
  };
};

export const useRestaurantsByCategory = (category: string, limit: number = 20) => {
  const [restaurants, setRestaurants] = useState<Restaurant[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchByCategory = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);

      const response = await restaurantApi.getByCategory(category, limit);
      
      if (response.success) {
        const transformedRestaurants = response.data.restaurants.map(transformRestaurantData);
        setRestaurants(transformedRestaurants);
      } else {
        setError(`Error obteniendo restaurantes de ${category}`);
      }
    } catch (err) {
      console.error('Error fetching restaurants by category:', err);
      setError('Error de conexión con el servidor');
    } finally {
      setLoading(false);
    }
  }, [category, limit]);

  useEffect(() => {
    if (category) {
      fetchByCategory();
    }
  }, [category, fetchByCategory]);

  return {
    restaurants,
    loading,
    error,
    refetch: fetchByCategory,
  };
};