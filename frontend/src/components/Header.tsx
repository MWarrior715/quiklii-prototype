import React, { useState } from 'react';
import { ShoppingCart, User, Search, Menu, X } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import { useCart } from '../contexts/CartContext';

import { PageProps } from '../types/props';

type HeaderProps = PageProps;

const Header: React.FC<HeaderProps> = ({ currentPage, onNavigate }) => {
  const { user, logout } = useAuth();
  const { getTotalItems } = useCart();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  const totalItems = getTotalItems();

  return (
    <header className="bg-white shadow-lg sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          {/* Logo */}
          <div 
            className="flex items-center cursor-pointer"
            onClick={() => onNavigate('home')}
          >
            <div className="bg-gradient-to-r from-orange-500 to-red-500 text-white px-3 py-2 rounded-lg font-bold text-xl">
              Quiklii
            </div>
          </div>

          {/* Search Bar - Hidden on mobile */}
          {currentPage === 'restaurants' && (
            <div className="hidden md:flex flex-1 max-w-lg mx-8">
              <div className="relative w-full">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                <input
                  type="text"
                  placeholder="Buscar restaurantes, cocinas..."
                  className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent"
                />
              </div>
            </div>
          )}

          {/* Desktop Navigation */}
          <div className="hidden md:flex items-center space-x-6">
            <button
              onClick={() => onNavigate('restaurants')}
              className={`text-gray-700 hover:text-orange-500 transition-colors ${
                currentPage === 'restaurants' ? 'text-orange-500 font-semibold' : ''
              }`}
            >
              Restaurantes
            </button>

            <button
              onClick={() => onNavigate('subscription')}
              className={`text-gray-700 hover:text-orange-500 transition-colors ${
                currentPage === 'subscription' ? 'text-orange-500 font-semibold' : ''
              }`}
            >
              Inscribe Tu Restaurante
            </button>

            {/* Cart */}
            <button
              onClick={() => onNavigate('cart')}
              className="relative p-2 text-gray-700 hover:text-orange-500 transition-colors"
            >
              <ShoppingCart className="w-6 h-6" />
              {totalItems > 0 && (
                <span className="absolute -top-1 -right-1 bg-orange-500 text-white text-xs rounded-full w-5 h-5 flex items-center justify-center">
                  {totalItems}
                </span>
              )}
            </button>

            {/* User Menu */}
            {user ? (
              <div className="relative group">
                <button className="flex items-center space-x-2 text-gray-700 hover:text-orange-500 transition-colors">
                  <User className="w-6 h-6" />
                  <span className="font-medium">{user.name}</span>
                </button>
                <div className="absolute right-0 top-full mt-1 w-48 bg-white rounded-lg shadow-lg border opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-200">
                  <div className="py-1">
                    <button
                      onClick={() => onNavigate('profile')}
                      className="block w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                    >
                      Perfil
                    </button>
                    <button
                      onClick={() => onNavigate('orders')}
                      className="block w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                    >
                      Mis Pedidos
                    </button>
                    <div className="border-t border-gray-100"></div>
                    <button
                      onClick={logout}
                      className="block w-full text-left px-4 py-2 text-sm text-red-600 hover:bg-gray-100"
                    >
                      Cerrar Sesión
                    </button>
                  </div>
                </div>
              </div>
            ) : (
              <button
                onClick={() => onNavigate('login')}
                className="bg-orange-500 text-white px-4 py-2 rounded-lg hover:bg-orange-600 transition-colors"
              >
                Iniciar Sesión
              </button>
            )}
          </div>

          {/* Mobile menu button */}
          <button
            className="md:hidden p-2 text-gray-700"
            onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
          >
            {isMobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
          </button>
        </div>

        {/* Mobile Menu */}
        {isMobileMenuOpen && (
          <div className="md:hidden border-t border-gray-200 pb-4">
            <div className="pt-4 space-y-2">
              <button
                onClick={() => {
                  onNavigate('restaurants');
                  setIsMobileMenuOpen(false);
                }}
                className="block w-full text-left px-4 py-2 text-gray-700 hover:bg-gray-100 rounded-lg"
              >
                Restaurantes
              </button>

              <button
                onClick={() => {
                  onNavigate('subscription');
                  setIsMobileMenuOpen(false);
                }}
                className="block w-full text-left px-4 py-2 text-gray-700 hover:bg-gray-100 rounded-lg"
              >
                Inscribe Tu Restaurante
              </button>
              
              <button
                onClick={() => {
                  onNavigate('cart');
                  setIsMobileMenuOpen(false);
                }}
                className="flex items-center w-full px-4 py-2 text-gray-700 hover:bg-gray-100 rounded-lg"
              >
                <ShoppingCart className="w-5 h-5 mr-2" />
                Carrito ({totalItems})
              </button>

              {user ? (
                <>
                  <button
                    onClick={() => {
                      onNavigate('profile');
                      setIsMobileMenuOpen(false);
                    }}
                    className="block w-full text-left px-4 py-2 text-gray-700 hover:bg-gray-100 rounded-lg"
                  >
                    Perfil
                  </button>
                  <button
                    onClick={() => {
                      onNavigate('orders');
                      setIsMobileMenuOpen(false);
                    }}
                    className="block w-full text-left px-4 py-2 text-gray-700 hover:bg-gray-100 rounded-lg"
                  >
                    Mis Pedidos
                  </button>
                  <button
                    onClick={() => {
                      logout();
                      setIsMobileMenuOpen(false);
                    }}
                    className="block w-full text-left px-4 py-2 text-red-600 hover:bg-gray-100 rounded-lg"
                  >
                    Cerrar Sesión
                  </button>
                </>
              ) : (
                <button
                  onClick={() => {
                    onNavigate('login');
                    setIsMobileMenuOpen(false);
                  }}
                  className="block w-full text-left px-4 py-2 bg-orange-500 text-white hover:bg-orange-600 rounded-lg"
                >
                  Iniciar Sesión
                </button>
              )}
            </div>
          </div>
        )}
      </div>
    </header>
  );
};

export default Header;