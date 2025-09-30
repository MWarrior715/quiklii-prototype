import { useState, useEffect } from 'react';
import { AuthProvider, useAuth } from './contexts/AuthContext';
import { CartProvider } from './contexts/CartContext';
import Header from './components/Header';
import HomePage from './pages/HomePage';
import RestaurantsPage from './pages/RestaurantsPage';
import RestaurantDetailPage from './pages/RestaurantDetailPage';
import LoginPage from './pages/LoginPage';
import CartPage from './pages/CartPage';
import CheckoutPage from './pages/CheckoutPage';
import OrdersPage from './pages/OrdersPage';
import ProfilePage from './pages/ProfilePage';
import PhoneVerification from './components/PhoneVerification';
import RestaurantSubscriptionPage from './pages/RestaurantSubscriptionPage';
import ProtectedRoute from './components/ProtectedRoute';
import { Page, NavigationData } from './types/navigation';
import { Restaurant } from './types';

function AppContent() {
  const [currentPage, setCurrentPage] = useState<Page>('home');
  const [selectedRestaurant, setSelectedRestaurant] = useState<Restaurant | null>(null);
  const { user, needsPhoneVerification } = useAuth();

  const navigate = (page: Page, data?: Restaurant | NavigationData) => {
    if (page === 'restaurant' && data && 'name' in data) {
      setSelectedRestaurant(data as Restaurant);
    }
    setCurrentPage(page);
  };

  useEffect(() => {
    // Update document title based on current page
    const titles = {
      home: 'Quiklii - Delivery de Comida',
      restaurants: 'Restaurantes - Quiklii',
      restaurant: selectedRestaurant ? `${selectedRestaurant.name} - Quiklii` : 'Restaurante - Quiklii',
      login: 'Iniciar Sesión - Quiklii',
      cart: 'Carrito - Quiklii',
      checkout: 'Finalizar Compra - Quiklii',
      orders: 'Mis Pedidos - Quiklii',
      profile: 'Mi Perfil - Quiklii',
      subscription: 'Inscribe tu Restaurante - Quiklii'
    };

    document.title = titles[currentPage];
  }, [currentPage, selectedRestaurant]);

  // Show phone verification if user is logged in but phone not verified
  if (user && needsPhoneVerification) {
    return <PhoneVerification onBack={() => navigate('home')} />;
  }

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
        return (
          <ProtectedRoute onNavigate={navigate} requiredRole="customer">
            <OrdersPage onNavigate={navigate} />
          </ProtectedRoute>
        );
      case 'profile':
        return (
          <ProtectedRoute onNavigate={navigate} requiredRole="customer">
            <ProfilePage onNavigate={navigate} />
          </ProtectedRoute>
        );
      case 'subscription':
        return <RestaurantSubscriptionPage onNavigate={navigate} />;
      default:
        return <HomePage onNavigate={navigate} />;
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {currentPage !== 'login' && (
        <Header currentPage={currentPage} onNavigate={navigate} />
      )}
      {renderPage()}
    </div>
  );
}

function App() {
  return (
    <AuthProvider>
      <CartProvider>
        <AppContent />
      </CartProvider>
    </AuthProvider>
  );
}

export default App;