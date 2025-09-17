import React, { createContext, useContext, useState, useEffect } from 'react';
import { User } from '../types';

interface AuthContextType {
  user: User | null;
  login: (email: string, password: string) => Promise<boolean>;
  loginWithGoogle: () => Promise<boolean>;
  register: (name: string, email: string, phone: string, password: string) => Promise<boolean>;
  verifyPhone: (code: string) => Promise<boolean>;
  logout: () => void;
  isLoading: boolean;
  needsPhoneVerification: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [needsPhoneVerification, setNeedsPhoneVerification] = useState(false);

  useEffect(() => {
    // Check if user is logged in on app start
    const savedUser = localStorage.getItem('quiklii_user');
    if (savedUser) {
      const parsedUser = JSON.parse(savedUser);
      setUser(parsedUser);
      setNeedsPhoneVerification(!parsedUser.isPhoneVerified);
    }
    setIsLoading(false);
  }, []);

  const login = async (email: string, password: string): Promise<boolean> => {
    setIsLoading(true);
    // Simulate API call
    await new Promise(resolve => setTimeout(resolve, 1000));
    
    // Mock login - in real app, this would call your backend
    if (email && password) {
      const mockUser: User = {
        id: '1',
        name: email.split('@')[0],
        email,
        phone: '+57 300 123 4567',
        isPhoneVerified: email === 'demo@quiklii.com', // Demo user is verified
        favoriteRestaurants: [],
        createdAt: new Date(),
        address: {
          street: 'Carrera 15 #93-47',
          city: 'Bogotá',
          neighborhood: 'Chapinero',
          coordinates: { lat: 4.6751, lng: -74.0621 },
          instructions: 'Apartamento 301, portería'
        }
      };
      setUser(mockUser);
      setNeedsPhoneVerification(!mockUser.isPhoneVerified);
      localStorage.setItem('quiklii_user', JSON.stringify(mockUser));
      setIsLoading(false);
      return true;
    }
    
    setIsLoading(false);
    return false;
  };

  const loginWithGoogle = async (): Promise<boolean> => {
    setIsLoading(true);
    // Simulate Google OAuth
    await new Promise(resolve => setTimeout(resolve, 1500));
    
    const mockUser: User = {
      id: 'google_' + Date.now(),
      name: 'Usuario Google',
      email: 'usuario@gmail.com',
      phone: '+57 300 987 6543',
      isPhoneVerified: false, // Google users still need phone verification
      favoriteRestaurants: [],
      createdAt: new Date()
    };
    
    setUser(mockUser);
    setNeedsPhoneVerification(true);
    localStorage.setItem('quiklii_user', JSON.stringify(mockUser));
    setIsLoading(false);
    return true;
  };

  const register = async (name: string, email: string, phone: string, password: string): Promise<boolean> => {
    setIsLoading(true);
    // Simulate API call
    await new Promise(resolve => setTimeout(resolve, 1000));
    
    // Mock registration
    if (name && email && phone && password) {
      const mockUser: User = {
        id: Date.now().toString(),
        name,
        email,
        phone,
        isPhoneVerified: false,
        favoriteRestaurants: [],
        createdAt: new Date()
      };
      setUser(mockUser);
      setNeedsPhoneVerification(true);
      localStorage.setItem('quiklii_user', JSON.stringify(mockUser));
      setIsLoading(false);
      return true;
    }
    
    setIsLoading(false);
    return false;
  };

  const verifyPhone = async (code: string): Promise<boolean> => {
    setIsLoading(true);
    // Simulate phone verification
    await new Promise(resolve => setTimeout(resolve, 1000));
    
    if (code === '1234' && user) { // Mock verification code
      const verifiedUser = { ...user, isPhoneVerified: true };
      setUser(verifiedUser);
      setNeedsPhoneVerification(false);
      localStorage.setItem('quiklii_user', JSON.stringify(verifiedUser));
      setIsLoading(false);
      return true;
    }
    
    setIsLoading(false);
    return false;
  };

  const logout = () => {
    setUser(null);
    setNeedsPhoneVerification(false);
    localStorage.removeItem('quiklii_user');
  };

  return (
    <AuthContext.Provider value={{ 
      user, 
      login, 
      loginWithGoogle,
      register, 
      verifyPhone,
      logout, 
      isLoading,
      needsPhoneVerification
    }}>
      {children}
    </AuthContext.Provider>
  );
};