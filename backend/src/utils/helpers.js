import jwt from 'jsonwebtoken';
import bcrypt from 'bcryptjs';
import { config } from '../config/environment.js';

// Generar JWT token
export const generateToken = (payload) => {
  return jwt.sign(payload, config.jwt.secret, {
    expiresIn: config.jwt.expiresIn
  });
};

// Generar refresh token
export const generateRefreshToken = (payload) => {
  return jwt.sign(payload, config.jwt.secret, {
    expiresIn: config.jwt.refreshExpiresIn
  });
};

// Hash de contraseña
export const hashPassword = async (password) => {
  const salt = await bcrypt.genSalt(10);
  return bcrypt.hash(password, salt);
};

// Verificar contraseña
export const comparePassword = async (password, hashedPassword) => {
  return bcrypt.compare(password, hashedPassword);
};

// Generar código de verificación
export const generateVerificationCode = () => {
  return Math.floor(1000 + Math.random() * 9000).toString();
};

// Formatear precio en pesos colombianos
export const formatPrice = (price) => {
  return new Intl.NumberFormat('es-CO', {
    style: 'currency',
    currency: 'COP',
    minimumFractionDigits: 0
  }).format(price);
};

// Calcular distancia entre dos puntos (fórmula haversine simplificada)
export const calculateDistance = (lat1, lng1, lat2, lng2) => {
  const R = 6371; // Radio de la Tierra en km
  const dLat = (lat2 - lat1) * Math.PI / 180;
  const dLng = (lng2 - lng1) * Math.PI / 180;
  const a = 
    Math.sin(dLat/2) * Math.sin(dLat/2) +
    Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) * 
    Math.sin(dLng/2) * Math.sin(dLng/2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));
  const distance = R * c; // Distancia en km
  return Math.round(distance * 100) / 100; // Redondear a 2 decimales
};

// Calcular tiempo estimado de entrega basado en distancia
export const calculateDeliveryTime = (distance) => {
  // Base: 15 minutos + 5 minutos por cada 2km adicionales
  const baseTime = 15;
  const additionalTime = Math.ceil(distance / 2) * 5;
  return baseTime + additionalTime;
};

// Validar número de teléfono colombiano
export const validateColombianPhone = (phone) => {
  const colombianPhoneRegex = /^(\+57|57)?[1-9]\d{9}$/;
  return colombianPhoneRegex.test(phone.replace(/[\s-()]/g, ''));
};

// Generar código de seguimiento único
export const generateTrackingCode = () => {
  const timestamp = Date.now().toString(36);
  const random = Math.random().toString(36).substr(2, 5);
  return `QK${timestamp}${random}`.toUpperCase();
};

// Paginación helper
export const paginate = (page = 1, limit = 10) => {
  const offset = (page - 1) * limit;
  return {
    limit: parseInt(limit),
    offset: parseInt(offset)
  };
};

// Respuesta estándar de API
export const apiResponse = (res, statusCode, success, message, data = null, meta = null) => {
  const response = {
    success,
    message,
    statusCode,
    timestamp: new Date().toISOString()
  };

  if (data !== null) {
    response.data = data;
  }

  if (meta !== null) {
    response.meta = meta;
  }

  return res.status(statusCode).json(response);
};

// Sanitizar entrada de usuario
export const sanitizeInput = (input) => {
  if (typeof input !== 'string') return input;
  
  return input
    .replace(/[<>]/g, '') // Remover < y >
    .trim(); // Remover espacios al inicio y final
};

// Manejar errores de manera uniforme
export const handleError = (res, error) => {
  console.error('Error:', error);
  const statusCode = error.statusCode || 500;
  return res.status(statusCode).json({
    success: false,
    message: error.message || 'Error interno del servidor',
    error: process.env.NODE_ENV === 'development' ? error.stack : undefined,
    statusCode,
    timestamp: new Date().toISOString()
  });
};

// Validar coordenadas de Bogotá y área metropolitana
export const isValidBogotaCoordinates = (lat, lng) => {
  // Aproximadamente el área metropolitana de Bogotá
  const minLat = 4.0;
  const maxLat = 5.2;
  const minLng = -74.8;
  const maxLng = -73.8;
  
  return lat >= minLat && lat <= maxLat && lng >= minLng && lng <= maxLng;
};

// Generar slug a partir de texto
export const generateSlug = (text) => {
  return text
    .toLowerCase()
    .trim()
    .replace(/[^\w\s-]/g, '') // Remover caracteres especiales
    .replace(/[\s_-]+/g, '-') // Reemplazar espacios y guiones bajos con guiones
    .replace(/^-+|-+$/g, ''); // Remover guiones al inicio y final
};

// Calcular edad basada en fecha de nacimiento
export const calculateAge = (birthDate) => {
  const today = new Date();
  const birth = new Date(birthDate);
  let age = today.getFullYear() - birth.getFullYear();
  const monthDiff = today.getMonth() - birth.getMonth();
  
  if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birth.getDate())) {
    age--;
  }
  
  return age;
};

// Generar horarios de operación por defecto
export const generateDefaultOperatingHours = () => {
  return {
    monday: { open: '08:00', close: '22:00', isOpen: true },
    tuesday: { open: '08:00', close: '22:00', isOpen: true },
    wednesday: { open: '08:00', close: '22:00', isOpen: true },
    thursday: { open: '08:00', close: '22:00', isOpen: true },
    friday: { open: '08:00', close: '23:00', isOpen: true },
    saturday: { open: '09:00', close: '23:00', isOpen: true },
    sunday: { open: '09:00', close: '21:00', isOpen: true }
  };
};

// Verificar si un restaurante está abierto
export const isRestaurantOpen = (operatingHours) => {
  const now = new Date();
  const currentDay = now.toLocaleLowerCase('en-US', { weekday: 'long' });
  const currentTime = now.toTimeString().slice(0, 5); // HH:MM format
  
  const todayHours = operatingHours[currentDay];
  if (!todayHours || !todayHours.isOpen) {
    return false;
  }
  
  return currentTime >= todayHours.open && currentTime <= todayHours.close;
};
