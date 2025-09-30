import { useState, useEffect, useCallback, useRef, useMemo } from 'react';
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

  const prevParamsRef = useRef<UseRestaurantsParams>();
  const fetchCountRef = useRef(0);

  // Memoizar params para evitar recreación del objeto
  const memoizedParams = useMemo(() => ({
    category: params.category,
    minRating: params.minRating,
    search: params.search,
    sortBy: params.sortBy,
    order: params.order,
    limit: params.limit,
    page: params.page
  }), [
    params.category,
    params.minRating,
    params.search,
    params.sortBy,
    params.order,
    params.limit,
    params.page
  ]);

  // Log cuando params cambia
  if (JSON.stringify(memoizedParams) !== JSON.stringify(prevParamsRef.current)) {
    console.log('🔄 [useRestaurants] Params cambió:', { prev: prevParamsRef.current, current: memoizedParams });
    prevParamsRef.current = memoizedParams;
  }

  const fetchRestaurants = useCallback(async () => {
    fetchCountRef.current += 1;
    console.log(`🔄 [useRestaurants] fetchRestaurants recreado #${fetchCountRef.current}, params:`, memoizedParams);
    try {
      console.log('🔍 [useRestaurants] Iniciando fetch con params:', memoizedParams);
      setLoading(true);
      setError(null);

      const response = await restaurantApi.getAll(memoizedParams);
      console.log('🔍 [useRestaurants] Respuesta de API:', response);

      if (response.success) {
        console.log('🔍 [useRestaurants] Datos recibidos:', response.data);
        const transformedRestaurants = response.data.restaurants.map(transformRestaurantData);
        console.log('🔍 [useRestaurants] Restaurantes transformados:', transformedRestaurants);
        setRestaurants(transformedRestaurants);
        setTotalItems(response.data.pagination.totalItems);
        setTotalPages(response.data.pagination.totalPages);
        setCurrentPage(response.data.pagination.currentPage);
        console.log('🔍 [useRestaurants] Estado actualizado correctamente');
      } else {
        console.error('❌ [useRestaurants] Error en respuesta:', response);
        setError('Error obteniendo restaurantes');
      }
    } catch (err) {
      console.error('❌ [useRestaurants] Error en fetch:', err);
      setError('Error de conexión con el servidor');
    } finally {
      setLoading(false);
      console.log('🔍 [useRestaurants] Fetch completado');
    }
  }, [memoizedParams]);

  useEffect(() => {
    console.log('🚀 [useRestaurants] useEffect ejecutándose, llamando fetchRestaurants');
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

  // No es necesario memoizar valores primitivos
  const memoizedLimit = limit;

  const fetchTopRated = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);

      const response = await restaurantApi.getTopRated(memoizedLimit);

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
  }, [memoizedLimit]);

  useEffect(() => {
    fetchTopRated();
  }, [fetchTopRated]);

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

  // No es necesario memoizar valores primitivos
  const memoizedCategory = category;
  const memoizedLimit = limit;

  const fetchByCategory = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);

      const response = await restaurantApi.getByCategory(memoizedCategory, memoizedLimit);

      if (response.success) {
        const transformedRestaurants = response.data.restaurants.map(transformRestaurantData);
        setRestaurants(transformedRestaurants);
      } else {
        setError(`Error obteniendo restaurantes de ${memoizedCategory}`);
      }
    } catch (err) {
      console.error('Error fetching restaurants by category:', err);
      setError('Error de conexión con el servidor');
    } finally {
      setLoading(false);
    }
  }, [memoizedCategory, memoizedLimit]);

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