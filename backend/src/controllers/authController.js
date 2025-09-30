import { validationResult } from 'express-validator';
import { User } from '../models/index.js';
import {
  generateTokensAndSetCookies,
  clearAuthCookies,
  verifyRefreshToken,
  hashPassword,
  verifyPassword
} from '../services/authService.js';

/**
 * Registrar nuevo usuario
 * @route POST /api/v1/auth/register
 * @access Public
 */
export const register = async (req, res, next) => {
  try {
    console.log('🔍 [AuthController] Iniciando registro con body:', { ...req.body, password: '***' });

    // Verificar si hay errores de validación
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      console.log('❌ [AuthController] Errores de validación:', errors.array());
      return res.status(400).json({
        success: false,
        message: 'Error en los datos proporcionados',
        errors: errors.array()
      });
    }

    const { firstName, lastName, email, phone, password, role = 'customer' } = req.body;
    const name = `${firstName} ${lastName}`.trim();
    console.log('🔍 [AuthController] Datos procesados:', { name, email, phone, role });

    // Verificar si el usuario ya existe por email
    const existingUserByEmail = await User.findOne({ where: { email } });
    if (existingUserByEmail) {
      console.log('❌ [AuthController] Usuario ya existe por email:', email);
      return res.status(409).json({
        success: false,
        message: 'Este email ya está registrado',
        error: 'EMAIL_EXISTS',
        field: 'email'
      });
    }

    // Verificar si el usuario ya existe por teléfono (si se proporciona)
    if (phone) {
      const existingUserByPhone = await User.findOne({ where: { phone } });
      if (existingUserByPhone) {
        console.log('❌ [AuthController] Usuario ya existe por teléfono:', phone);
        return res.status(409).json({
          success: false,
          message: 'Este número de teléfono ya está registrado',
          error: 'PHONE_EXISTS',
          field: 'phone'
        });
      }
    }

    console.log('🔍 [AuthController] Creando nuevo usuario...');
    // Crear nuevo usuario (el password se hasheará automáticamente por el hook beforeCreate)
    const newUser = await User.create({
      name,
      email,
      phone: phone || null,
      password,
      role
    });
    console.log('✅ [AuthController] Usuario creado:', { id: newUser.id, name: newUser.name, email: newUser.email });

    // Generar tokens y configurar cookies
    console.log('🔍 [AuthController] Generando tokens...');
    const { accessToken } = generateTokensAndSetCookies(newUser, res);
    console.log('✅ [AuthController] Tokens generados');

    // Separar nombre para la respuesta
    const [resFirstName, ...resLastNameParts] = newUser.name.split(' ');
    const resLastName = resLastNameParts.join(' ');

    // Respuesta exitosa
    res.status(201).json({
      success: true,
      message: 'Usuario registrado exitosamente',
      data: {
        user: {
          id: newUser.id,
          firstName: resFirstName,
          lastName: resLastName,
          email: newUser.email,
          phone: newUser.phone,
          role: newUser.role,
          isEmailVerified: newUser.isEmailVerified,
          isPhoneVerified: newUser.isPhoneVerified,
          createdAt: newUser.createdAt
        },
        accessToken
      }
    });

  } catch (error) {
    console.error('Error en registro:', error);
    res.status(500).json({
      success: false,
      message: 'Error interno del servidor',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
};

/**
 * Iniciar sesión
 * @route POST /api/v1/auth/login
 * @access Public
 */
export const login = async (req, res, next) => {
  try {
    console.log('🔍 [AuthController] Iniciando login con:', { email: req.body.email, password: '***' });

    // Verificar errores de validación
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      console.log('❌ [AuthController] Errores de validación en login:', errors.array());
      return res.status(400).json({
        success: false,
        message: 'Error en los datos proporcionados',
        errors: errors.array()
      });
    }

    const { email, password } = req.body;

    // Buscar usuario por email
    console.log('🔍 [AuthController] Buscando usuario por email:', email);
    const user = await User.findOne({
      where: {
        email,
        isActive: true
      }
    });

    if (!user) {
      console.log('❌ [AuthController] Usuario no encontrado:', email);
      return res.status(401).json({
        success: false,
        message: 'Credenciales inválidas'
      });
    }

    console.log('✅ [AuthController] Usuario encontrado:', { id: user.id, name: user.name });

    // Verificar contraseña
    console.log('🔍 [AuthController] Verificando contraseña...');
    const isPasswordValid = await user.validatePassword(password);
    if (!isPasswordValid) {
      console.log('❌ [AuthController] Contraseña inválida');
      return res.status(401).json({
        success: false,
        message: 'Credenciales inválidas'
      });
    }

    console.log('✅ [AuthController] Contraseña válida');

    // Actualizar último login
    await user.update({ lastLoginAt: new Date() });

    // Generar tokens y configurar cookies
    const { accessToken } = generateTokensAndSetCookies(user, res);

    // Separar nombre para la respuesta
    const [resFirstName, ...resLastNameParts] = user.name.split(' ');
    const resLastName = resLastNameParts.join(' ');

    // Respuesta exitosa
    res.json({
      success: true,
      message: 'Login exitoso',
      data: {
        user: {
          id: user.id,
          firstName: resFirstName,
          lastName: resLastName,
          email: user.email,
          phone: user.phone,
          role: user.role,
          isEmailVerified: user.isEmailVerified,
          isPhoneVerified: user.isPhoneVerified,
          profileImage: user.profileImage,
          lastLoginAt: user.lastLoginAt
        },
        accessToken
      }
    });

  } catch (error) {
    console.error('Error en login:', error);
    res.status(500).json({
      success: false,
      message: 'Error interno del servidor',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
};

/**
 * Verificar token (para validar sesión)
 * @route GET /api/v1/auth/verify
 * @access Private
 */
export const verifyAuth = async (req, res) => {
  try {
    // El usuario ya viene del middleware authenticate
    const user = req.user;

    // Separar nombre para la respuesta
    const [resFirstName, ...resLastNameParts] = user.name.split(' ');
    const resLastName = resLastNameParts.join(' ');

    res.json({
      success: true,
      message: 'Token válido',
      data: {
        user: {
          id: user.id,
          firstName: resFirstName,
          lastName: resLastName,
          email: user.email,
          phone: user.phone,
          role: user.role,
          isEmailVerified: user.isEmailVerified,
          isPhoneVerified: user.isPhoneVerified,
          profileImage: user.profileImage
        }
      }
    });

  } catch (error) {
    console.error('Error en verificación:', error);
    res.status(500).json({
      success: false,
      message: 'Error interno del servidor'
    });
  }
};

/**
 * Logout - Limpia cookies de autenticación
 * @route POST /api/v1/auth/logout
 * @access Private
 */
export const logout = async (req, res) => {
  try {
    // Limpiar cookies de autenticación
    clearAuthCookies(res);

    res.json({
      success: true,
      message: 'Logout exitoso'
    });

  } catch (error) {
    console.error('Error en logout:', error);
    res.status(500).json({
      success: false,
      message: 'Error interno del servidor'
    });
  }
};

/**
 * Renovar access token usando refresh token de cookies
 * @route POST /api/v1/auth/refresh
 * @access Private (requiere refresh token válido en cookies)
 */
export const refreshToken = async (req, res) => {
  try {
    // El middleware authenticateRefresh ya validó el refresh token y agregó req.user
    const user = req.user;

    // Generar nuevos tokens y configurar cookies
    const { accessToken } = generateTokensAndSetCookies(user, res);

    res.json({
      success: true,
      message: 'Token renovado exitosamente',
      data: {
        accessToken,
        user: {
          id: user.id,
          name: user.name,
          email: user.email,
          phone: user.phone,
          role: user.role,
          isEmailVerified: user.isEmailVerified,
          isPhoneVerified: user.isPhoneVerified,
          profileImage: user.profileImage
        }
      }
    });

  } catch (error) {
    console.error('Error renovando token:', error);
    res.status(500).json({
      success: false,
      message: 'Error interno del servidor'
    });
  }
};

// Verificar email (placeholder)
export const verifyEmail = async (req, res, next) => {
  try {
    res.json({
      success: true,
      message: 'Email verificado exitosamente (funcionalidad en desarrollo)'
    });
  } catch (error) {
    next(error);
  }
};

// Recuperar contraseña (placeholder)
export const forgotPassword = async (req, res, next) => {
  try {
    res.json({
      success: true,
      message: 'Email de recuperación enviado (funcionalidad en desarrollo)'
    });
  } catch (error) {
    next(error);
  }
};