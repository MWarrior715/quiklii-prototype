import React from 'react';
import { ArrowRight, Clock, Truck, Shield, Search, Loader } from 'lucide-react';
import RestaurantCard from '../components/cards/RestaurantCard';
import { useTopRatedRestaurants } from '../hooks/useRestaurants';

import { NavigationProps } from '../types/props';

type HomePageProps = NavigationProps;

const HomePage: React.FC<HomePageProps> = ({ onNavigate }) => {
  const { restaurants: featuredRestaurants, loading, error } = useTopRatedRestaurants(6);

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Hero Section */}
      <section className="bg-gradient-to-br from-orange-500 via-red-500 to-pink-500 text-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20">
          <div className="text-center">
            <h1 className="text-4xl md:text-6xl font-bold mb-6 animate-fade-in">
              Comida deliciosa,
              <br />
              entregada rápidamente
            </h1>
            <p className="text-xl md:text-2xl mb-8 text-orange-100 max-w-3xl mx-auto">
              Pide de tus restaurantes favoritos y recibe comidas frescas y calientes en tu puerta en minutos.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center max-w-md mx-auto">
              <button
                onClick={() => onNavigate('restaurants')}
                className="bg-white text-orange-500 px-8 py-4 rounded-lg font-semibold hover:bg-orange-50 transition-colors flex items-center justify-center space-x-2 text-lg"
              >
                <Search className="w-5 h-5" />
                <span>Buscar restaurantes</span>
              </button>
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-16 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-gray-800 mb-4">¿Por qué elegir Quiklii?</h2>
            <p className="text-gray-600 text-lg max-w-2xl mx-auto">
              Hacemos que la entrega de comida sea simple, rápida y confiable
            </p>
          </div>
          
          <div className="grid md:grid-cols-3 gap-8">
            <div className="text-center p-6">
              <div className="bg-orange-100 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
                <Clock className="w-8 h-8 text-orange-500" />
              </div>
              <h3 className="text-xl font-semibold mb-3">Entrega Rápida</h3>
              <p className="text-gray-600">Recibe tus comidas favoritas en 30 minutos o menos</p>
            </div>
            
            <div className="text-center p-6">
              <div className="bg-green-100 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
                <Truck className="w-8 h-8 text-green-500" />
              </div>
              <h3 className="text-xl font-semibold mb-3">Seguimiento en Vivo</h3>
              <p className="text-gray-600">Sigue tu pedido en tiempo real desde la preparación hasta la entrega</p>
            </div>
            
            <div className="text-center p-6">
              <div className="bg-blue-100 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
                <Shield className="w-8 h-8 text-blue-500" />
              </div>
              <h3 className="text-xl font-semibold mb-3">Seguro y Protegido</h3>
              <p className="text-gray-600">Pagos seguros y opciones de entrega sin contacto</p>
            </div>
          </div>
        </div>
      </section>

      {/* Featured Restaurants */}
      <section className="py-16 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center mb-8">
            <h2 className="text-3xl font-bold text-gray-800">Restaurantes Destacados</h2>
            <button
              onClick={() => onNavigate('restaurants')}
              className="text-orange-500 hover:text-orange-600 font-semibold flex items-center space-x-1"
            >
              <span>Ver Todos</span>
              <ArrowRight className="w-5 h-5" />
            </button>
          </div>
          
          {/* Loading State */}
          {loading && (
            <div className="flex justify-center items-center py-8">
              <Loader className="w-6 h-6 animate-spin text-orange-500" />
              <span className="ml-2 text-gray-600">Cargando restaurantes...</span>
            </div>
          )}

          {/* Error State */}
          {error && (
            <div className="text-center py-8">
              <div className="text-red-400 text-4xl mb-2">⚠️</div>
              <p className="text-gray-600">Error al cargar restaurantes destacados</p>
            </div>
          )}

          {/* Restaurants Grid */}
          {!loading && !error && (
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
              {featuredRestaurants.map((restaurant) => (
                <RestaurantCard
                  key={restaurant.id}
                  restaurant={restaurant}
                  onClick={() => onNavigate('restaurant', restaurant)}
                />
              ))}
            </div>
          )}
        </div>
      </section>

      {/* CTA Section */}
      <section className="bg-gradient-to-r from-orange-500 to-red-500 text-white py-16">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-3xl font-bold mb-4">¿Listo para ordenar?</h2>
          <p className="text-xl mb-8 text-orange-100">
            Únete a miles de clientes satisfechos que confían en Quiklii para sus necesidades de entrega de alimentos
          </p>
          <button
            onClick={() => onNavigate('restaurants')}
            className="bg-white text-orange-500 px-8 py-4 rounded-lg font-semibold hover:bg-orange-50 transition-colors text-lg"
          >
            Empieza a ordenar ahora
          </button>
        </div>
      </section>
    </div>
  );
};

export default HomePage;