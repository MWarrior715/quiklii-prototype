import { verifyAccessToken, verifyRefreshToken, extractRefreshTokenFromCookies } from '../services/authService.js';
import { User } from '../models/index.js';

// Middleware para verificar access token JWT
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
        message: 'Access token requerido'
      });
    }

    try {
      // Verificar access token
      const decoded = verifyAccessToken(token);

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
        message: 'Access token inválido o expirado'
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
      const decoded = verifyAccessToken(token);
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

// Middleware para verificar refresh token desde cookies
export const authenticateRefresh = async (req, res, next) => {
  try {
    console.log('🔍 [authenticateRefresh] Cookies recibidas:', req.cookies);
    const refreshToken = extractRefreshTokenFromCookies(req.cookies);
    console.log('🔍 [authenticateRefresh] Refresh token extraído:', refreshToken ? 'presente' : 'no presente');

    if (!refreshToken) {
      console.log('❌ [authenticateRefresh] No hay refresh token');
      return res.status(401).json({
        success: false,
        message: 'Refresh token requerido'
      });
    }

    try {
      // Verificar refresh token
      const decoded = verifyRefreshToken(refreshToken);

      // Buscar usuario
      const user = await User.findByPk(decoded.userId);
      if (!user || !user.isActive) {
        return res.status(401).json({
          success: false,
          message: 'Refresh token inválido - Usuario no encontrado'
        });
      }

      // Agregar usuario al request
      req.user = user;
      next();
    } catch (error) {
      return res.status(401).json({
        success: false,
        message: 'Refresh token inválido o expirado'
      });
    }
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: 'Error en verificación de refresh token'
    });
  }
};

// Middleware para verificar roles específicos
export const requireRole = (...allowedRoles) => {
  return (req, res, next) => {
    if (!req.user) {
      return res.status(401).json({
        success: false,
        message: 'Usuario no autenticado'
      });
    }

    if (!allowedRoles.includes(req.user.role)) {
      return res.status(403).json({
        success: false,
        message: `Acceso denegado. Rol requerido: ${allowedRoles.join(' o ')}`
      });
    }

    next();
  };
};

// Middleware para verificar permisos de administrador
export const requireAdmin = (req, res, next) => {
  return requireRole('admin')(req, res, next);
};

// Middleware para verificar permisos de restaurante
export const requireRestaurant = (req, res, next) => {
  return requireRole('restaurant_owner')(req, res, next);
};

// Middleware para verificar permisos de delivery
export const requireDelivery = (req, res, next) => {
  return requireRole('delivery_person')(req, res, next);
};
