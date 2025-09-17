import React, { useState, useMemo } from 'react';
import { Filter, Search, MapPin, Clock, Star, Zap, Loader } from 'lucide-react';
import { SearchFilters, ServiceType } from '../types';
import RestaurantCard from '../RestaurantCard';
import { useRestaurants } from '../hooks/useRestaurants';

import { NavigationProps } from '../types/props';

type RestaurantsPageProps = NavigationProps;

const RestaurantsPage: React.FC<RestaurantsPageProps> = ({ onNavigate }) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [showFilters, setShowFilters] = useState(false);
  const [filters, setFilters] = useState<SearchFilters>({
    serviceType: 'all',
    cuisine: [],
    priceRange: [1, 4],
    rating: 0,
    openNow: false,
    hasPromotions: false,
    deliveryTime: 60
  });

  // Fetch restaurants from API
  const { 
    restaurants, 
    loading, 
    error, 
    totalItems,
    refetch 
  } = useRestaurants({
    search: searchTerm || undefined,
    minRating: filters.rating > 0 ? filters.rating : undefined,
    category: filters.cuisine.length > 0 ? filters.cuisine[0] : undefined,
    limit: 20,
    page: 1
  });

  const cuisines = useMemo(() => {
    // Get unique categories from available restaurants
    const allCuisines = restaurants.flatMap(r => r.cuisine);
    return [...new Set(allCuisines)];
  }, [restaurants]);

  const serviceTypes: { value: ServiceType | 'all', label: string, icon: React.ReactNode }[] = [
    { value: 'all', label: 'Todos', icon: <Zap className="w-4 h-4" /> },
    { value: 'delivery', label: 'Delivery', icon: <MapPin className="w-4 h-4" /> },
    { value: 'dining', label: 'Restaurante', icon: <Clock className="w-4 h-4" /> },
    { value: 'nightlife', label: 'Vida Nocturna', icon: <Star className="w-4 h-4" /> }
  ];

  const filteredRestaurants = useMemo(() => {
    const filtered = restaurants.filter(restaurant => {
      // Search term
      const matchesSearch = restaurant.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                           restaurant.cuisine.some(c => c.toLowerCase().includes(searchTerm.toLowerCase())) ||
                           restaurant.address.neighborhood.toLowerCase().includes(searchTerm.toLowerCase());
      
      // Service type
      const matchesServiceType = filters.serviceType === 'all' || 
                                 restaurant.serviceTypes.includes(filters.serviceType);
      
      // Cuisine
      const matchesCuisine = filters.cuisine.length === 0 || 
                            filters.cuisine.some(c => restaurant.cuisine.includes(c));
      
      // Price range
      const matchesPriceRange = restaurant.priceRange >= filters.priceRange[0] && 
                               restaurant.priceRange <= filters.priceRange[1];
      
      // Rating
      const matchesRating = restaurant.rating >= filters.rating;
      
      // Open now
      const matchesOpenNow = !filters.openNow || restaurant.isOpen;
      
      // Has promotions
      const matchesPromotions = !filters.hasPromotions || restaurant.isPromoted;
      
      // Delivery time (convert "25-35 min" to number)
      const deliveryTimeNum = parseInt(restaurant.deliveryTime.split('-')[1]);
      const matchesDeliveryTime = deliveryTimeNum <= filters.deliveryTime;
      
      return matchesSearch && matchesServiceType && matchesCuisine && 
             matchesPriceRange && matchesRating && matchesOpenNow && 
             matchesPromotions && matchesDeliveryTime;
    });

    // Sort by promoted first, then by rating
    filtered.sort((a, b) => {
      if (a.isPromoted && !b.isPromoted) return -1;
      if (!a.isPromoted && b.isPromoted) return 1;
      return b.rating - a.rating;
    });

    return filtered;
  }, [searchTerm, filters, restaurants]);

  const updateFilter = (key: keyof SearchFilters, value: SearchFilters[keyof SearchFilters]) => {
    setFilters(prev => ({ ...prev, [key]: value }));
  };

  const toggleCuisine = (cuisine: string) => {
    setFilters(prev => ({
      ...prev,
      cuisine: prev.cuisine.includes(cuisine)
        ? prev.cuisine.filter(c => c !== cuisine)
        : [...prev.cuisine, cuisine]
    }));
  };

  const clearFilters = () => {
    setFilters({
      serviceType: 'all',
      cuisine: [],
      priceRange: [1, 4],
      rating: 0,
      openNow: false,
      hasPromotions: false,
      deliveryTime: 60
    });
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-800 mb-2">Restaurantes</h1>
          <p className="text-gray-600">Descubre comida increíble cerca de ti</p>
        </div>

        {/* Search and Service Type Tabs */}
        <div className="bg-white rounded-lg shadow-md p-6 mb-6">
          {/* Search */}
          <div className="relative mb-4">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
            <input
              type="text"
              placeholder="Buscar restaurantes, cocinas, barrios..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent"
            />
          </div>

          {/* Service Type Tabs */}
          <div className="flex flex-wrap gap-2 mb-4">
            {serviceTypes.map(type => (
              <button
                key={type.value}
                onClick={() => updateFilter('serviceType', type.value)}
                className={`flex items-center space-x-2 px-4 py-2 rounded-full text-sm font-medium transition-colors ${
                  filters.serviceType === type.value
                    ? 'bg-orange-500 text-white'
                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                }`}
              >
                {type.icon}
                <span>{type.label}</span>
              </button>
            ))}
          </div>

          {/* Filter Toggle */}
          <div className="flex justify-between items-center">
            <button
              onClick={() => setShowFilters(!showFilters)}
              className="flex items-center space-x-2 text-orange-500 hover:text-orange-600 transition-colors"
            >
              <Filter className="w-5 h-5" />
              <span>Filtros avanzados</span>
            </button>
            
            {(filters.cuisine.length > 0 || filters.rating > 0 || filters.openNow || filters.hasPromotions) && (
              <button
                onClick={clearFilters}
                className="text-sm text-gray-500 hover:text-gray-700 transition-colors"
              >
                Limpiar filtros
              </button>
            )}
          </div>
        </div>

        {/* Advanced Filters */}
        {showFilters && (
          <div className="bg-white rounded-lg shadow-md p-6 mb-6">
            <h3 className="text-lg font-semibold text-gray-800 mb-4">Filtros Avanzados</h3>
            
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
              {/* Cuisine */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Cocina</label>
                <div className="space-y-2 max-h-32 overflow-y-auto">
                  {cuisines.map(cuisine => (
                    <label key={cuisine} className="flex items-center">
                      <input
                        type="checkbox"
                        checked={filters.cuisine.includes(cuisine)}
                        onChange={() => toggleCuisine(cuisine)}
                        className="rounded border-gray-300 text-orange-500 focus:ring-orange-500"
                      />
                      <span className="ml-2 text-sm text-gray-700">{cuisine}</span>
                    </label>
                  ))}
                </div>
              </div>

              {/* Price Range */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Rango de Precio: {'$'.repeat(filters.priceRange[0])} - {'$'.repeat(filters.priceRange[1])}
                </label>
                <div className="space-y-2">
                  <input
                    type="range"
                    min="1"
                    max="4"
                    value={filters.priceRange[1]}
                    onChange={(e) => updateFilter('priceRange', [1, parseInt(e.target.value)])}
                    className="w-full"
                  />
                  <div className="flex justify-between text-xs text-gray-500">
                    <span>$</span>
                    <span>$$$$</span>
                  </div>
                </div>
              </div>

              {/* Rating */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Calificación mínima: {filters.rating > 0 ? filters.rating : 'Cualquiera'}
                </label>
                <input
                  type="range"
                  min="0"
                  max="5"
                  step="0.5"
                  value={filters.rating}
                  onChange={(e) => updateFilter('rating', parseFloat(e.target.value))}
                  className="w-full"
                />
                <div className="flex justify-between text-xs text-gray-500">
                  <span>0</span>
                  <span>5</span>
                </div>
              </div>

              {/* Quick Filters */}
              <div className="md:col-span-2 lg:col-span-3">
                <div className="flex flex-wrap gap-4">
                  <label className="flex items-center">
                    <input
                      type="checkbox"
                      checked={filters.openNow}
                      onChange={(e) => updateFilter('openNow', e.target.checked)}
                      className="rounded border-gray-300 text-orange-500 focus:ring-orange-500"
                    />
                    <span className="ml-2 text-sm text-gray-700">Abierto ahora</span>
                  </label>
                  
                  <label className="flex items-center">
                    <input
                      type="checkbox"
                      checked={filters.hasPromotions}
                      onChange={(e) => updateFilter('hasPromotions', e.target.checked)}
                      className="rounded border-gray-300 text-orange-500 focus:ring-orange-500"
                    />
                    <span className="ml-2 text-sm text-gray-700">Con promociones</span>
                  </label>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Loading State */}
        {loading && (
          <div className="flex justify-center items-center py-12">
            <Loader className="w-8 h-8 animate-spin text-orange-500" />
            <span className="ml-2 text-gray-600">Cargando restaurantes...</span>
          </div>
        )}

        {/* Error State */}
        {error && (
          <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-6">
            <div className="flex items-center">
              <div className="text-red-400 text-2xl mr-3">⚠️</div>
              <div>
                <h3 className="text-red-800 font-semibold">Error al cargar restaurantes</h3>
                <p className="text-red-600">{error}</p>
                <button
                  onClick={refetch}
                  className="mt-2 bg-red-500 text-white px-4 py-2 rounded hover:bg-red-600 transition-colors"
                >
                  Intentar de nuevo
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Results Count */}
        {!loading && !error && (
          <div className="mb-6">
            <p className="text-gray-600">
              {filteredRestaurants.length} restaurante{filteredRestaurants.length !== 1 ? 's' : ''} encontrado{filteredRestaurants.length !== 1 ? 's' : ''}
              {totalItems > 0 && ` de ${totalItems} total`}
            </p>
          </div>
        )}

        {/* Restaurant Grid */}
        {!loading && !error && (
          filteredRestaurants.length > 0 ? (
            <div className="grid md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
              {filteredRestaurants.map((restaurant) => (
                <RestaurantCard
                  key={restaurant.id}
                  restaurant={restaurant}
                  onClick={() => onNavigate('restaurant', restaurant)}
                />
              ))}
            </div>
          ) : (
            <div className="text-center py-12">
              <div className="text-gray-400 text-6xl mb-4">🍽️</div>
              <h3 className="text-xl font-semibold text-gray-600 mb-2">No se encontraron restaurantes</h3>
              <p className="text-gray-500 mb-4">Intenta ajustar tus filtros de búsqueda</p>
              <button
                onClick={clearFilters}
                className="bg-orange-500 text-white px-6 py-2 rounded-lg hover:bg-orange-600 transition-colors"
              >
                Limpiar filtros
              </button>
            </div>
          )
        )}
      </div>
    </div>
  );
};

export default RestaurantsPage;