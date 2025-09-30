import React from 'react';
import { useAuth } from '../contexts/AuthContext';
import { NavigationProps } from '../types/props';

interface ProtectedRouteProps extends NavigationProps {
  children: React.ReactNode;
  requiredRole?: 'customer' | 'restaurant' | 'admin';
}

const ProtectedRoute: React.FC<ProtectedRouteProps> = ({
  children,
  onNavigate,
  requiredRole = 'customer'
}) => {
  const { user, isLoading } = useAuth();

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-orange-500 mx-auto mb-4"></div>
          <p className="text-gray-600">Verificando autenticación...</p>
        </div>
      </div>
    );
  }

  if (!user) {
    onNavigate('login');
    return null;
  }

  // Check if user has required role
  if (user.role !== requiredRole && user.role !== 'admin') {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="text-6xl mb-4">🚫</div>
          <h2 className="text-2xl font-bold text-gray-800 mb-2">Acceso Denegado</h2>
          <p className="text-gray-600 mb-6">
            No tienes permisos para acceder a esta página.
          </p>
          <button
            onClick={() => onNavigate('home')}
            className="bg-orange-500 text-white px-6 py-3 rounded-lg hover:bg-orange-600 transition-colors"
          >
            Ir al Inicio
          </button>
        </div>
      </div>
    );
  }

  return <>{children}</>;
};

export default ProtectedRoute;