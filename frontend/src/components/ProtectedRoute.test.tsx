import { render, screen, waitFor } from '@testing-library/react';
import { vi, describe, it, expect, beforeEach } from 'vitest';
import ProtectedRoute from './ProtectedRoute';
import { AuthProvider } from '../contexts/AuthContext';
import { User } from '../types';

// Mock de navegación
const mockOnNavigate = vi.fn();

vi.mock('../contexts/AuthContext', async () => {
  const actual = await vi.importActual('../contexts/AuthContext');
  return {
    ...actual,
    useAuth: vi.fn(),
  };
});

import { useAuth } from '../contexts/AuthContext';

const mockUseAuth = vi.mocked(useAuth);

describe('ProtectedRoute', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockOnNavigate.mockClear();
  });

  it('debería mostrar loading mientras verifica autenticación', () => {
    mockUseAuth.mockReturnValue({
      user: null,
      login: vi.fn(),
      loginWithGoogle: vi.fn(),
      register: vi.fn(),
      verifyPhone: vi.fn(),
      logout: vi.fn(),
      isLoading: true,
      needsPhoneVerification: false,
      refreshTokenIfNeeded: vi.fn(),
    });

    render(
      <AuthProvider>
        <ProtectedRoute onNavigate={mockOnNavigate}>
          <div>Contenido protegido</div>
        </ProtectedRoute>
      </AuthProvider>
    );

    expect(screen.getByText('Verificando autenticación...')).toBeInTheDocument();
  });

  it('debería redirigir a login cuando no hay usuario autenticado', () => {
    mockUseAuth.mockReturnValue({
      user: null,
      login: vi.fn(),
      loginWithGoogle: vi.fn(),
      register: vi.fn(),
      verifyPhone: vi.fn(),
      logout: vi.fn(),
      isLoading: false,
      needsPhoneVerification: false,
      refreshTokenIfNeeded: vi.fn(),
    });

    render(
      <AuthProvider>
        <ProtectedRoute onNavigate={mockOnNavigate}>
          <div>Contenido protegido</div>
        </ProtectedRoute>
      </AuthProvider>
    );

    expect(mockOnNavigate).toHaveBeenCalledWith('login');
    expect(screen.queryByText('Contenido protegido')).not.toBeInTheDocument();
  });

  it('debería renderizar contenido cuando usuario está autenticado', () => {
    const mockUser: User = {
      id: 'user-1',
      name: 'Usuario Test',
      email: 'test@example.com',
      phone: '+57 300 123 4567',
      isPhoneVerified: true,
      role: 'customer' as const,
      favoriteRestaurants: [],
      createdAt: new Date()
    };

    mockUseAuth.mockReturnValue({
      user: mockUser,
      login: vi.fn(),
      loginWithGoogle: vi.fn(),
      register: vi.fn(),
      verifyPhone: vi.fn(),
      logout: vi.fn(),
      isLoading: false,
      needsPhoneVerification: false,
      refreshTokenIfNeeded: vi.fn(),
    });

    render(
      <AuthProvider>
        <ProtectedRoute onNavigate={mockOnNavigate}>
          <div>Contenido protegido</div>
        </ProtectedRoute>
      </AuthProvider>
    );

    expect(screen.getByText('Contenido protegido')).toBeInTheDocument();
    expect(mockOnNavigate).not.toHaveBeenCalled();
  });

  it('debería manejar cambios en el estado de autenticación', async () => {
    // Inicialmente sin usuario
    mockUseAuth.mockReturnValue({
      user: null,
      login: vi.fn(),
      loginWithGoogle: vi.fn(),
      register: vi.fn(),
      verifyPhone: vi.fn(),
      logout: vi.fn(),
      isLoading: false,
      needsPhoneVerification: false,
      refreshTokenIfNeeded: vi.fn(),
    });

    const { rerender } = render(
      <AuthProvider>
        <ProtectedRoute onNavigate={mockOnNavigate}>
          <div>Contenido protegido</div>
        </ProtectedRoute>
      </AuthProvider>
    );

    expect(mockOnNavigate).toHaveBeenCalledWith('login');

    // Cambiar a usuario autenticado
    const mockUser: User = {
      id: 'user-1',
      name: 'Usuario Test',
      email: 'test@example.com',
      phone: '+57 300 123 4567',
      isPhoneVerified: true,
      role: 'customer',
      favoriteRestaurants: [],
      createdAt: new Date()
    };

    mockUseAuth.mockReturnValue({
      user: mockUser,
      login: vi.fn(),
      loginWithGoogle: vi.fn(),
      register: vi.fn(),
      verifyPhone: vi.fn(),
      logout: vi.fn(),
      isLoading: false,
      needsPhoneVerification: false,
      refreshTokenIfNeeded: vi.fn(),
    });

    rerender(
      <AuthProvider>
        <ProtectedRoute onNavigate={mockOnNavigate}>
          <div>Contenido protegido</div>
        </ProtectedRoute>
      </AuthProvider>
    );

    await waitFor(() => {
      expect(screen.getByText('Contenido protegido')).toBeInTheDocument();
    });
  });
});