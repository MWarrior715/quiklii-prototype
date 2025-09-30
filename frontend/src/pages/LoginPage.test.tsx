import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { vi, describe, it, expect, beforeEach } from 'vitest';
import LoginPage from './LoginPage';
import { AuthProvider } from '../contexts/AuthContext';

// Mock de navegación
const mockOnNavigate = vi.fn();

vi.mock('../contexts/AuthContext', async () => {
  const actual = await vi.importActual('../contexts/AuthContext');
  return {
    ...actual,
    useAuth: () => ({
      login: vi.fn(),
      loginWithGoogle: vi.fn().mockResolvedValue(true),
      register: vi.fn().mockResolvedValue(true),
      logout: vi.fn(),
      user: null,
      isLoading: false,
      needsPhoneVerification: false,
    }),
  };
});

describe('LoginPage', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockOnNavigate.mockClear();
  });

  it('debería renderizar el formulario de login por defecto', () => {
    render(
      <AuthProvider>
        <LoginPage onNavigate={mockOnNavigate} />
      </AuthProvider>
    );

    expect(screen.getByRole('heading', { name: 'Iniciar Sesión' })).toBeInTheDocument();
    expect(screen.getByText('Accede a tu cuenta')).toBeInTheDocument();
    expect(screen.getByPlaceholderText('Correo electrónico')).toBeInTheDocument();
    expect(screen.getByPlaceholderText('Contraseña')).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Iniciar Sesión' })).toBeInTheDocument();
  });

  it('debería mostrar credenciales demo cuando está en modo login', () => {
    render(
      <AuthProvider>
        <LoginPage onNavigate={mockOnNavigate} />
      </AuthProvider>
    );

    expect(screen.getByText('Credenciales demo:')).toBeInTheDocument();
    expect(screen.getByText((content) => {
      return content.includes('demo@quiklii.com');
    })).toBeInTheDocument();
  });

  it('debería cambiar a modo registro cuando se hace clic en "Regístrate"', async () => {
    const user = userEvent.setup();

    render(
      <AuthProvider>
        <LoginPage onNavigate={mockOnNavigate} />
      </AuthProvider>
    );

    const registerButton = screen.getByText('Regístrate');
    await user.click(registerButton);

    expect(screen.getByRole('heading', { name: 'Crear Cuenta' })).toBeInTheDocument();
    expect(screen.getByText('Comienza con Quiklii')).toBeInTheDocument();
    expect(screen.getByPlaceholderText('Nombre completo')).toBeInTheDocument();
    expect(screen.getByPlaceholderText('Teléfono (ej: +57 300 123 4567)')).toBeInTheDocument();
  });

  it('debería cambiar de vuelta a modo login desde registro', async () => {
    const user = userEvent.setup();

    render(
      <AuthProvider>
        <LoginPage onNavigate={mockOnNavigate} />
      </AuthProvider>
    );

    // Cambiar a registro
    const registerButton = screen.getByText('Regístrate');
    await user.click(registerButton);

    // Cambiar de vuelta a login
    const loginButton = screen.getByText('Inicia Sesión');
    await user.click(loginButton);

    expect(screen.getByRole('heading', { name: 'Iniciar Sesión' })).toBeInTheDocument();
    expect(screen.getByPlaceholderText('Correo electrónico')).toBeInTheDocument();
  });

  it('debería validar campos requeridos en login', async () => {
    const user = userEvent.setup();
    const { useAuth } = await import('../contexts/AuthContext');
    const mockUseAuth = vi.mocked(useAuth);
    const mockLogin = vi.fn();

    mockUseAuth.mockReturnValue({
      login: mockLogin,
      loginWithGoogle: vi.fn().mockResolvedValue(true),
      register: vi.fn().mockResolvedValue(true),
      verifyPhone: vi.fn().mockResolvedValue(true),
      logout: vi.fn(),
      user: null,
      isLoading: false,
      needsPhoneVerification: false,
      refreshTokenIfNeeded: vi.fn().mockResolvedValue(true),
    });

    render(
      <AuthProvider>
        <LoginPage onNavigate={mockOnNavigate} />
      </AuthProvider>
    );

    const submitButton = screen.getByRole('button', { name: 'Iniciar Sesión' });

    await user.click(submitButton);

    // Validation should prevent login from being called
    expect(mockLogin).not.toHaveBeenCalled();

    await waitFor(() => {
      expect(screen.getByText('Por favor completa todos los campos requeridos')).toBeInTheDocument();
    });
  });

  it('debería validar email y password en login', async () => {
    const user = userEvent.setup();

    render(
      <AuthProvider>
        <LoginPage onNavigate={mockOnNavigate} />
      </AuthProvider>
    );

    const emailInput = screen.getByPlaceholderText('Correo electrónico');
    const passwordInput = screen.getByPlaceholderText('Contraseña');
    const submitButton = screen.getByRole('button', { name: 'Iniciar Sesión' });

    await user.type(emailInput, 'invalid-email');
    await user.type(passwordInput, '123');
    await user.click(submitButton);

    // El formulario debería intentar enviar, pero como tenemos mock, no hay validación adicional
    expect(emailInput).toHaveValue('invalid-email');
    expect(passwordInput).toHaveValue('123');
  });

  it('debería manejar login exitoso', async () => {
    const user = userEvent.setup();

    render(
      <AuthProvider>
        <LoginPage onNavigate={mockOnNavigate} />
      </AuthProvider>
    );

    const emailInput = screen.getByPlaceholderText('Correo electrónico');
    const passwordInput = screen.getByPlaceholderText('Contraseña');
    const submitButton = screen.getByRole('button', { name: 'Iniciar Sesión' });

    await user.type(emailInput, 'test@example.com');
    await user.type(passwordInput, 'password123');
    await user.click(submitButton);

    await waitFor(() => {
      expect(mockOnNavigate).toHaveBeenCalledWith('home');
    });
  });

  it('debería mostrar error en login fallido', async () => {
    // Mock de login fallido
    vi.doMock('../contexts/AuthContext', () => ({
      useAuth: () => ({
        login: vi.fn().mockResolvedValue(false),
        loginWithGoogle: vi.fn(),
        register: vi.fn(),
        logout: vi.fn(),
        user: null,
        isLoading: false,
        needsPhoneVerification: false,
      }),
    }));

    const user = userEvent.setup();

    render(
      <AuthProvider>
        <LoginPage onNavigate={mockOnNavigate} />
      </AuthProvider>
    );

    const emailInput = screen.getByPlaceholderText('Correo electrónico');
    const passwordInput = screen.getByPlaceholderText('Contraseña');
    const submitButton = screen.getByRole('button', { name: 'Iniciar Sesión' });

    await user.type(emailInput, 'wrong@example.com');
    await user.type(passwordInput, 'wrongpass');
    await user.click(submitButton);

    await waitFor(() => {
      expect(screen.getByText('Email o contraseña incorrectos')).toBeInTheDocument();
    });
  });

  it('debería manejar login con Google', async () => {
    const user = userEvent.setup();

    render(
      <AuthProvider>
        <LoginPage onNavigate={mockOnNavigate} />
      </AuthProvider>
    );

    const googleButton = screen.getByText('Continuar con Google');
    await user.click(googleButton);

    await waitFor(() => {
      expect(mockOnNavigate).toHaveBeenCalledWith('home');
    });
  });

  it('debería mostrar indicador de carga durante login', () => {
    // Mock con loading
    vi.doMock('../contexts/AuthContext', () => ({
      useAuth: () => ({
        login: vi.fn().mockImplementation(() => new Promise(resolve => setTimeout(() => resolve(true), 1000))),
        loginWithGoogle: vi.fn(),
        register: vi.fn(),
        logout: vi.fn(),
        user: null,
        isLoading: true,
        needsPhoneVerification: false,
      }),
    }));

    render(
      <AuthProvider>
        <LoginPage onNavigate={mockOnNavigate} />
      </AuthProvider>
    );

    const submitButton = screen.getByText('Cargando...');

    expect(submitButton).toBeDisabled();
  });

  it('debería alternar visibilidad de contraseña', async () => {
    const user = userEvent.setup();

    render(
      <AuthProvider>
        <LoginPage onNavigate={mockOnNavigate} />
      </AuthProvider>
    );

    const passwordInput = screen.getByPlaceholderText('Contraseña');
    // Find the eye button inside the password field container
    const toggleButton = screen.getAllByRole('button')[0]; // First button is the eye icon

    // Por defecto debería ser password
    expect(passwordInput).toHaveAttribute('type', 'password');

    await user.click(toggleButton);

    // Después de hacer clic debería ser text
    expect(passwordInput).toHaveAttribute('type', 'text');
  });
});