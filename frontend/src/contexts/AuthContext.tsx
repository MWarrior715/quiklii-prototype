/* eslint-disable react-refresh/only-export-components */
import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { User, Address } from '../types';
import { authApi, RegisterData } from '../services/api';

// Helper function to convert string address to Address object
const parseAddressString = (addressString: string | undefined): Address | undefined => {
  if (!addressString) return undefined;
  
  // Simple parsing - you can enhance this based on your address format
  const parts = addressString.split(',').map(part => part.trim());
  return {
    street: parts[0] || addressString,
    city: parts[1] || 'Bogotá', // Default city
    neighborhood: parts[2] || 'Centro', // Default neighborhood
  };
};

interface AuthContextType {
  user: User | null;
  login: (email: string, password: string) => Promise<boolean>;
  loginWithGoogle: () => Promise<boolean>;
  register: (data: RegisterData) => Promise<{ success: boolean; error?: string }>;
  verifyPhone: (code: string) => Promise<boolean>;
  logout: () => void;
  isLoading: boolean;
  needsPhoneVerification: boolean;
  refreshTokenIfNeeded: () => Promise<boolean>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

const ACCESS_TOKEN_KEY = 'quiklii_access_token';
const USER_KEY = 'quiklii_user';

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) throw new Error('useAuth must be used within an AuthProvider');
  return context;
};

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [needsPhoneVerification, setNeedsPhoneVerification] = useState(false);

  const setAccessToken = (token: string) => localStorage.setItem(ACCESS_TOKEN_KEY, token);
  const removeAccessToken = () => localStorage.removeItem(ACCESS_TOKEN_KEY);

  // 🔄 Refresh token usando authApi
  const refreshTokenIfNeeded = useCallback(async (): Promise<boolean> => {
    try {
      const response = await authApi.refresh();
      if (response.success && response.data && response.data.token && response.data.user) {
        setAccessToken(response.data.token);

        const userData: User = {
          id: response.data.user.id,
          firstName: response.data.user.firstName,
          lastName: response.data.user.lastName,
          email: response.data.user.email,
          phone: response.data.user.phone ?? '', // ✅ fallback a string vacío
          isPhoneVerified: response.data.user.isVerified,
          role: response.data.user.role,
          favoriteRestaurants: [],
          createdAt: new Date(response.data.user.createdAt),
          address: parseAddressString(response.data.user.address),
        };

        setUser(userData);
        localStorage.setItem(USER_KEY, JSON.stringify(userData));
        return true;
      }
      return false;
    } catch (error) {
      console.error('Error refreshing token:', error);
      return false;
    }
  }, []);

  // ✅ Login con authApi
  const login = async (email: string, password: string): Promise<boolean> => {
    console.log('🔍 [AuthContext] Iniciando login con:', { email, password: '***' });
    setIsLoading(true);
    try {
      const response = await authApi.login({ email, password });
      console.log('🔍 [AuthContext] Respuesta del login:', response);
      if (response.success && response.data && response.data.user && response.data.accessToken) {
        const { user: userData, accessToken: token } = response.data;

        const newUser: User = {
          id: userData.id,
          firstName: userData.firstName,
          lastName: userData.lastName,
          email: userData.email,
          phone: userData.phone || '',
          isPhoneVerified: userData.isVerified,
          role: userData.role,
          favoriteRestaurants: [],
          createdAt: new Date(userData.createdAt),
          address: parseAddressString(userData.address),
        };

        console.log('🔍 [AuthContext] Usuario creado:', newUser);
        setUser(newUser);
        setAccessToken(token);
        localStorage.setItem(USER_KEY, JSON.stringify(newUser));
        setNeedsPhoneVerification(!newUser.isPhoneVerified);
        console.log('🔍 [AuthContext] Login exitoso');
        return true;
      }
      console.log('🔍 [AuthContext] Login fallido: respuesta incompleta');
      return false;
    } catch (error) {
      console.error('❌ [AuthContext] Error en login:', error);
      return false;
    } finally {
      setIsLoading(false);
    }
  };

  // ✅ Register con authApi
  const register = async (data: RegisterData): Promise<{ success: boolean; error?: string }> => {
    console.log('🔍 [AuthContext] Iniciando registro con:', { ...data, password: '***' });
    setIsLoading(true);
    try {
      const response = await authApi.register(data);
      console.log('🔍 [AuthContext] Respuesta del registro:', response);
      if (response.success && response.data && response.data.user && response.data.accessToken) {
        const { user: userData, accessToken: token } = response.data;

        const newUser: User = {
          id: userData.id,
          firstName: userData.firstName,
          lastName: userData.lastName,
          email: userData.email,
          phone: userData.phone || '',
          isPhoneVerified: userData.isVerified,
          role: userData.role,
          favoriteRestaurants: [],
          createdAt: new Date(userData.createdAt),
          address: parseAddressString(userData.address),
        };

        console.log('🔍 [AuthContext] Usuario registrado:', newUser);
        setUser(newUser);
        setAccessToken(token);
        localStorage.setItem(USER_KEY, JSON.stringify(newUser));
        setNeedsPhoneVerification(!newUser.isPhoneVerified);
        console.log('🔍 [AuthContext] Registro exitoso');
        return { success: true };
      }
      console.log('🔍 [AuthContext] Registro fallido: respuesta incompleta');
      return { success: false, error: 'Error inesperado en el registro' };
    } catch (error) {
      console.error('❌ [AuthContext] Error en registro:', error);

      // Manejar errores específicos del backend
      const axiosError = error as { response?: { data?: { error?: string; message?: string } } };
      if (axiosError.response?.data) {
        const errorData = axiosError.response.data;
        if (errorData.error === 'EMAIL_EXISTS') {
          return { success: false, error: 'Este email ya está registrado. Intenta con otro email.' };
        }
        if (errorData.error === 'PHONE_EXISTS') {
          return { success: false, error: 'Este número de teléfono ya está registrado. Intenta con otro número.' };
        }
        if (errorData.message) {
          return { success: false, error: errorData.message };
        }
      }

      return { success: false, error: 'Error al crear la cuenta. Inténtalo nuevamente.' };
    } finally {
      setIsLoading(false);
    }
  };

  // Simulación de Google login (mock)
  const loginWithGoogle = async (): Promise<boolean> => {
    setIsLoading(true);
    try {
      await new Promise((resolve) => setTimeout(resolve, 1500));
      const mockUser: User = {
        id: 'google_' + Date.now(),
        firstName: 'Usuario',
        lastName: 'Google',
        email: 'usuario@gmail.com',
        phone: '+57 300 987 6543',
        isPhoneVerified: false,
        role: 'customer',
        favoriteRestaurants: [],
        createdAt: new Date(),
      };

      setUser(mockUser);
      setNeedsPhoneVerification(true);
      localStorage.setItem(USER_KEY, JSON.stringify(mockUser));
      setAccessToken('mock_google_token');
      return true;
    } catch (error) {
      console.error('Google login error:', error);
      return false;
    } finally {
      setIsLoading(false);
    }
  };

  // Mock de verificación de teléfono
  const verifyPhone = async (code: string): Promise<boolean> => {
    setIsLoading(true);
    try {
      await new Promise((resolve) => setTimeout(resolve, 1000));
      if (code === '1234' && user) {
        const verifiedUser = { ...user, isPhoneVerified: true };
        setUser(verifiedUser);
        setNeedsPhoneVerification(false);
        localStorage.setItem(USER_KEY, JSON.stringify(verifiedUser));
        return true;
      }
      return false;
    } catch (error) {
      console.error('Phone verification error:', error);
      return false;
    } finally {
      setIsLoading(false);
    }
  };

  // ✅ Logout usando authApi
  const logout = useCallback(() => {
    setUser(null);
    setNeedsPhoneVerification(false);
    removeAccessToken();
    localStorage.removeItem(USER_KEY);

    authApi.logout().catch((error: unknown) => console.error('Logout error:', error));
  }, []);

  // Inicializar auth al montar la app
  useEffect(() => {
    const initializeAuth = async () => {
      console.log('🔍 [AuthContext] Inicializando autenticación...');
      const savedUser = localStorage.getItem(USER_KEY);
      console.log('🔍 [AuthContext] Usuario guardado en localStorage:', savedUser);

      if (savedUser) {
        const parsedUser = JSON.parse(savedUser);
        // Convertir createdAt de string a Date si es necesario
        if (parsedUser.createdAt && typeof parsedUser.createdAt === 'string') {
          parsedUser.createdAt = new Date(parsedUser.createdAt);
        }
        console.log('🔍 [AuthContext] Usuario parseado:', parsedUser);
        setUser(parsedUser);
        setNeedsPhoneVerification(!parsedUser.isPhoneVerified);

        const isValid = await refreshTokenIfNeeded();
        console.log('🔍 [AuthContext] Token válido:', isValid);
        if (!isValid) {
          console.log('🔍 [AuthContext] Token inválido, haciendo logout');
          logout();
        }
      } else {
        console.log('🔍 [AuthContext] No hay usuario guardado en localStorage');
      }
      setIsLoading(false);
      console.log('🔍 [AuthContext] Inicialización completada');
    };
    initializeAuth();
  }, [refreshTokenIfNeeded, logout]);

  return (
    <AuthContext.Provider
      value={{
        user,
        login,
        loginWithGoogle,
        register,
        verifyPhone,
        logout,
        isLoading,
        needsPhoneVerification,
        refreshTokenIfNeeded,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};