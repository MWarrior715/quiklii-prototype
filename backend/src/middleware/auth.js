import jwt from 'jsonwebtoken';
import { config } from '../config/environment.js';
import { User } from '../models/index.js';
//import User from '../models/User.js';

// Middleware para verificar JWT
export const authenticate = async (req, res, next) => {
  try {
    let token;

    // Obtener token del header Authorization
    if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
      token = req.headers.authorization.split(' ')[1];
    }

    if (!token) {
      return res.status(401).json({
        success: false,
        message: 'Token de acceso requerido'
      });
    }

    try {
      // Verificar token
      const decoded = jwt.verify(token, config.jwt.secret);
      
      // Buscar usuario actual
      const user = await User.findByPk(decoded.userId);
      if (!user || !user.isActive) {
        return res.status(401).json({
          success: false,
          message: 'Token inválido - Usuario no encontrado'
        });
      }

      // Agregar usuario al request
      req.user = user;
      next();
    } catch (error) {
      return res.status(401).json({
        success: false,
        message: 'Token inválido'
      });
    }
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: 'Error en autenticación'
    });
  }
};

// Middleware para verificar roles
export const authorize = (...roles) => {
  return (req, res, next) => {
    if (!req.user) {
      return res.status(401).json({
        success: false,
        message: 'Usuario no autenticado'
      });
    }

    if (!roles.includes(req.user.role)) {
      return res.status(403).json({
        success: false,
        message: 'No tienes permisos para acceder a este recurso'
      });
    }

    next();
  };
};

// Middleware opcional de autenticación (no requiere token, pero si existe lo valida)
export const optionalAuth = async (req, res, next) => {
  try {
    let token;

    if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
      token = req.headers.authorization.split(' ')[1];
    }

    if (!token) {
      return next();
    }

    try {
      const decoded = jwt.verify(token, config.jwt.secret);
      const user = await User.findByPk(decoded.userId);
      if (user && user.isActive) {
        req.user = user;
      }
    } catch (error) {
      // Token inválido, pero continuar sin usuario
    }

    next();
  } catch (error) {
    next();
  }
};
