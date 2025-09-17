import jwt from 'jsonwebtoken';
import bcrypt from 'bcryptjs';
import { config } from '../config/environment.js';

/**
 * Generar token JWT para un usuario
 * @param {Object} user - Objeto usuario (debe contener al menos id y role)
 * @returns {string} Token JWT
 */
export const generateToken = (user) => {
  const payload = {
    userId: user.id,
    email: user.email,
    role: user.role,
    name: user.name
  };

  const options = {
    expiresIn: config.jwt.expiresIn || '7d',
    issuer: 'quiklii-api'
  };

  return jwt.sign(payload, config.jwt.secret, options);
};

/**
 * Hash de contraseña usando bcrypt
 * @param {string} password - Contraseña en texto plano
 * @returns {string} Contraseña hasheada
 */
export const hashPassword = async (password) => {
  const saltRounds = 12;
  return bcrypt.hash(password, saltRounds);
};

/**
 * Verificar contraseña contra hash
 * @param {string} password - Contraseña en texto plano
 * @param {string} hashedPassword - Contraseña hasheada
 * @returns {boolean} Verdadero si coincide
 */
export const verifyPassword = async (password, hashedPassword) => {
  return bcrypt.compare(password, hashedPassword);
};

/**
 * Verificar token JWT
 * @param {string} token - Token a verificar
 * @returns {Object} Payload decodificado
 * @throws {Error} Si el token es inválido
 */
export const verifyToken = (token) => {
  try {
    return jwt.verify(token, config.jwt.secret);
  } catch (error) {
    throw new Error('Token inválido o expirado');
  }
};

/**
 * Generar refresh token (opcional para futuras mejoras)
 * @param {Object} user - Objeto usuario
 * @returns {string} Refresh token
 */
export const generateRefreshToken = (user) => {
  const payload = {
    userId: user.id,
    type: 'refresh'
  };

  const options = {
    expiresIn: '30d',
    issuer: 'quiklii-api'
  };

  return jwt.sign(payload, config.jwt.refreshSecret || config.jwt.secret, options);
};

/**
 * Extraer token del header Authorization
 * @param {string} authHeader - Header Authorization
 * @returns {string|null} Token extraído o null
 */
export const extractTokenFromHeader = (authHeader) => {
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return null;
  }
  
  return authHeader.substring(7); // Remover "Bearer "
};
