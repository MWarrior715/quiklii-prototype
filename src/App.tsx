import React, { useState, useEffect } from 'react';
import { AuthProvider } from './contexts/AuthContext';
import { CartProvider } from './contexts/CartContext';
import Header from './components/Header';
import HomePage from './pages/HomePage';
import RestaurantsPage from './pages/RestaurantsPage';
import RestaurantDetailPage from './pages/RestaurantDetailPage';
import LoginPage from './pages/LoginPage';
import CartPage from './pages/CartPage';
import CheckoutPage from './pages/CheckoutPage';
import OrdersPage from './pages/OrdersPage';
import { Restaurant } from './types';

type Page = 'home' | 'restaurants' | 'restaurant' | 'login' | 'cart' | 'checkout' | 'orders' | 'profile';

function App() {
  const [currentPage, setCurrentPage] = useState<Page>('home');
  const [selectedRestaurant, setSelectedRestaurant] = useState<Restaurant | null>(null);

  const navigate = (page: Page, data?: any) => {
    if (page === 'restaurant' && data) {
      setSelectedRestaurant(data);
    }
    setCurrentPage(page);
  };

  useEffect(() => {
    // Update document title based on current page
    const titles = {
      home: 'Quiklii - Food Delivery',
      restaurants: 'Restaurants - Quiklii',
      restaurant: selectedRestaurant ? `${selectedRestaurant.name} - Quiklii` : 'Restaurant - Quiklii',
      login: 'Sign In - Quiklii',
      cart: 'Cart - Quiklii',
      checkout: 'Checkout - Quiklii',
      orders: 'My Orders - Quiklii',
      profile: 'Profile - Quiklii'
    };
    
    document.title = titles[currentPage];
  }, [currentPage, selectedRestaurant]);

  const renderPage = () => {
    switch (currentPage) {
      case 'home':
        return <HomePage onNavigate={navigate} />;
      case 'restaurants':
        return <RestaurantsPage onNavigate={navigate} />;
      case 'restaurant':
        return selectedRestaurant ? (
          <RestaurantDetailPage restaurant={selectedRestaurant} onNavigate={navigate} />
        ) : (
          <RestaurantsPage onNavigate={navigate} />
        );
      case 'login':
        return <LoginPage onNavigate={navigate} />;
      case 'cart':
        return <CartPage onNavigate={navigate} />;
      case 'checkout':
        return <CheckoutPage onNavigate={navigate} />;
      case 'orders':
        return <OrdersPage onNavigate={navigate} />;
      default:
        return <HomePage onNavigate={navigate} />;
    }
  };

  return (
    <AuthProvider>
      <CartProvider>
        <div className="min-h-screen bg-gray-50">
          {currentPage !== 'login' && (
            <Header currentPage={currentPage} onNavigate={navigate} />
          )}
          {renderPage()}
        </div>
      </CartProvider>
    </AuthProvider>
  );
}

export default App;