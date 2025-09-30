import React, { useState } from 'react';
import { Mail, Lock, User, Eye, EyeOff, Phone } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';

import { NavigationProps } from '../types/props';

type LoginPageProps = NavigationProps;

const LoginPage: React.FC<LoginPageProps> = ({ onNavigate }) => {
  const [isLogin, setIsLogin] = useState(true);
  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    email: '',
    phone: '',
    password: ''
  });
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');
  
  const { login, loginWithGoogle, register, isLoading } = useAuth();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    // Validation
    if (!formData.email || !formData.password) {
      setError('Por favor completa todos los campos requeridos');
      return;
    }

    if (!isLogin && (!formData.firstName || !formData.lastName || !formData.phone)) {
      setError('Por favor completa todos los campos requeridos');
      return;
    }

    if (!isLogin && formData.phone && !formData.phone.match(/^\+?[0-9\s-()]{10,}$/)) {
      setError('Por favor ingresa un número de teléfono válido');
      return;
    }

    try {
      let result;
      if (isLogin) {
        const success = await login(formData.email, formData.password);
        result = { success, error: success ? undefined : 'Email o contraseña incorrectos' };
      } else {
        const { firstName, lastName, email, phone, password } = formData;
        result = await register({ firstName, lastName, email, phone, password });
      }

      if (result.success) {
        onNavigate('home');
      } else {
        setError(result.error || (isLogin ? 'Email o contraseña incorrectos' : 'Error al crear la cuenta'));
      }
    } catch {
      setError('Algo salió mal. Intenta nuevamente.');
    }
  };

  const handleGoogleLogin = async () => {
    setError('');
    const success = await loginWithGoogle();
    if (success) {
      onNavigate('home');
    } else {
      setError('Error al iniciar sesión con Google');
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData(prev => ({
      ...prev,
      [e.target.name]: e.target.value
    }));
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-orange-500 via-red-500 to-pink-500 flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md overflow-hidden">
        {/* Header */}
        <div className="bg-gradient-to-r from-orange-500 to-red-500 p-6 text-center">
          <div 
            className="text-white text-2xl font-bold mb-2 cursor-pointer"
            onClick={() => onNavigate('home')}
          >
            Quiklii
          </div>
          <p className="text-orange-100">
            {isLogin ? '¡Bienvenido de vuelta!' : 'Únete a la revolución del delivery'}
          </p>
        </div>

        {/* Form */}
        <div className="p-6">
          <div className="text-center mb-6">
            <h2 className="text-2xl font-bold text-gray-800 mb-2">
              {isLogin ? 'Iniciar Sesión' : 'Crear Cuenta'}
            </h2>
            <p className="text-gray-600">
              {isLogin ? 'Accede a tu cuenta' : 'Comienza con Quiklii'}
            </p>
          </div>

          {error && (
            <div className="bg-red-50 border border-red-200 text-red-600 px-4 py-3 rounded-lg mb-4">
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            {!isLogin && (
              <div className="flex space-x-4">
                <div className="relative w-1/2">
                  <User className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                  <input
                    type="text"
                    name="firstName"
                    placeholder="Nombre"
                    value={formData.firstName}
                    onChange={handleChange}
                    required={!isLogin}
                    className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent"
                  />
                </div>
                <div className="relative w-1/2">
                  <User className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                  <input
                    type="text"
                    name="lastName"
                    placeholder="Apellido"
                    value={formData.lastName}
                    onChange={handleChange}
                    required={!isLogin}
                    className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent"
                  />
                </div>
              </div>
            )}

            <div className="relative">
              <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
              <input
                type="email"
                name="email"
                placeholder="Correo electrónico"
                value={formData.email}
                onChange={handleChange}
                required
                className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent"
              />
            </div>

            {!isLogin && (
              <div className="relative">
                <Phone className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                <input
                  type="tel"
                  name="phone"
                  placeholder="Teléfono (ej: +57 300 123 4567)"
                  value={formData.phone}
                  onChange={handleChange}
                  required={!isLogin}
                  className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent"
                />
              </div>
            )}

            <div className="relative">
              <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
              <input
                type={showPassword ? 'text' : 'password'}
                name="password"
                placeholder="Contraseña"
                value={formData.password}
                onChange={handleChange}
                required
                className="w-full pl-10 pr-12 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent"
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
              >
                {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
              </button>
            </div>

            <button
              type="submit"
              disabled={isLoading}
              className="w-full bg-gradient-to-r from-orange-500 to-red-500 text-white py-3 rounded-lg font-semibold hover:from-orange-600 hover:to-red-600 transition-all duration-200 disabled:opacity-50"
            >
              {isLoading ? 'Cargando...' : (isLogin ? 'Iniciar Sesión' : 'Crear Cuenta')}
            </button>
          </form>

          {/* Google Login */}
          <div className="mt-4">
            <div className="relative">
              <div className="absolute inset-0 flex items-center">
                <div className="w-full border-t border-gray-300" />
              </div>
              <div className="relative flex justify-center text-sm">
                <span className="px-2 bg-white text-gray-500">o</span>
              </div>
            </div>

            <button
              onClick={handleGoogleLogin}
              disabled={isLoading}
              className="mt-4 w-full bg-white border border-gray-300 text-gray-700 py-3 rounded-lg font-semibold hover:bg-gray-50 transition-colors flex items-center justify-center space-x-2 disabled:opacity-50"
            >
              <svg className="w-5 h-5" viewBox="0 0 24 24">
                <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
                <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
                <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
                <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
              </svg>
              <span>Continuar con Google</span>
            </button>
          </div>

          {/* Toggle Mode */}
          <div className="mt-6 text-center">
            <p className="text-gray-600">
              {isLogin ? "¿No tienes cuenta?" : '¿Ya tienes cuenta?'}
            </p>
            <button
              onClick={() => {
                setIsLogin(!isLogin);
                setError('');
                setFormData({ firstName: '', lastName: '', email: '', phone: '', password: '' });
              }}
              className="text-orange-500 font-semibold hover:text-orange-600 transition-colors mt-1"
            >
              {isLogin ? 'Regístrate' : 'Inicia Sesión'}
            </button>
          </div>

          {/* Demo Credentials */}
          {isLogin && (
            <div className="mt-4 p-4 bg-orange-50 rounded-lg">
              <p className="text-sm text-orange-800 mb-2">
                <strong>Credenciales demo:</strong>
              </p>
              <p className="text-xs text-orange-600">
                Email: demo@quiklii.com<br />
                Contraseña: cualquier contraseña
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default LoginPage;