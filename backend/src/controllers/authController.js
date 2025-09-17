import { validationResult } from 'express-validator';
import jwt from 'jsonwebtoken';
import { config } from '../config/environment.js';
import { User } from '../models/index.js';
//import User from '../models/User.js';
import { generateToken, generateRefreshToken } from '../services/authService.js';

/**
 * Registrar nuevo usuario
 * @route POST /api/v1/auth/register
 * @access Public
 */
export const register = async (req, res, next) => {
  try {
    // Verificar si hay errores de validación
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        success: false,
        message: 'Error en los datos proporcionados',
        errors: errors.array()
      });
    }

    const { name, email, phone, password, role = 'customer' } = req.body;

    // Verificar si el usuario ya existe por email
    const existingUserByEmail = await User.findOne({ where: { email } });
    if (existingUserByEmail) {
      return res.status(400).json({
        success: false,
        message: 'Ya existe un usuario con este email'
      });
    }

    // Verificar si el usuario ya existe por teléfono (si se proporciona)
    if (phone) {
      const existingUserByPhone = await User.findOne({ where: { phone } });
      if (existingUserByPhone) {
        return res.status(400).json({
          success: false,
          message: 'Ya existe un usuario con este número de teléfono'
        });
      }
    }

    // Crear nuevo usuario (el password se hasheará automáticamente por el hook beforeCreate)
    const newUser = await User.create({
      name,
      email,
      phone: phone || null,
      password,
      role
    });

    // Generar token JWT
    const token = generateToken(newUser);

    // Respuesta exitosa
    res.status(201).json({
      success: true,
      message: 'Usuario registrado exitosamente',
      data: {
        user: {
          id: newUser.id,
          name: newUser.name,
          email: newUser.email,
          phone: newUser.phone,
          role: newUser.role,
          isEmailVerified: newUser.isEmailVerified,
          isPhoneVerified: newUser.isPhoneVerified,
          createdAt: newUser.createdAt
        },
        token
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
    // Verificar errores de validación
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        success: false,
        message: 'Error en los datos proporcionados',
        errors: errors.array()
      });
    }

    const { email, password } = req.body;

    // Buscar usuario por email
    const user = await User.findOne({ 
      where: { 
        email,
        isActive: true 
      }
    });

    if (!user) {
      return res.status(401).json({
        success: false,
        message: 'Credenciales inválidas'
      });
    }

    // Verificar contraseña
    const isPasswordValid = await user.validatePassword(password);
    if (!isPasswordValid) {
      return res.status(401).json({
        success: false,
        message: 'Credenciales inválidas'
      });
    }

    // Actualizar último login
    await user.update({ lastLoginAt: new Date() });

    // Generar token
    const token = generateToken(user);

    // Respuesta exitosa
    res.json({
      success: true,
      message: 'Login exitoso',
      data: {
        user: {
          id: user.id,
          name: user.name,
          email: user.email,
          phone: user.phone,
          role: user.role,
          isEmailVerified: user.isEmailVerified,
          isPhoneVerified: user.isPhoneVerified,
          profileImage: user.profileImage,
          lastLoginAt: user.lastLoginAt
        },
        token
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

    res.json({
      success: true,
      message: 'Token válido',
      data: {
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
    console.error('Error en verificación:', error);
    res.status(500).json({
      success: false,
      message: 'Error interno del servidor'
    });
  }
};

/**
 * Logout (opcional - para invalidar token en el lado cliente)
 * @route POST /api/v1/auth/logout
 * @access Private
 */
export const logout = async (req, res) => {
  try {
    // En una implementación más avanzada, aquí se podría agregar el token a una blacklist
    // Por ahora, simplemente confirmamos el logout
    
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

// Refrescar token
export const refreshToken = async (req, res, next) => {
  try {
    const { refreshToken: clientRefreshToken } = req.body;

    if (!clientRefreshToken) {
      return res.status(401).json({
        success: false,
        message: 'Refresh token requerido'
      });
    }

    // Verificar refresh token
    const decoded = jwt.verify(clientRefreshToken, config.jwt.secret);

    // Buscar usuario
    const user = await User.findByPk(decoded.id);

    if (!user) {
      return res.status(401).json({
        success: false,
        message: 'Usuario no encontrado'
      });
    }

    // Generar nuevos tokens
    const tokenPayload = { id: user.id, email: user.email, role: user.role };
    const newToken = generateToken(tokenPayload);
    const newRefreshToken = generateRefreshToken(tokenPayload);

    res.json({
      success: true,
      message: 'Token renovado exitosamente',
      data: {
        token: newToken,
        refreshToken: newRefreshToken,
        user
      }
    });

  } catch (error) {
    console.error('Error renovando token:', error);
    
    if (error.name === 'JsonWebTokenError' || error.name === 'TokenExpiredError') {
      return res.status(401).json({
        success: false,
        message: 'Refresh token inválido o expirado'
      });
    }

    next(error);
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
