import jwt from 'jsonwebtoken';
import bcrypt from 'bcryptjs';
import { config } from '../config/environment.js';

/**
 * Generar access token JWT con expiración corta (15 minutos)
 * @param {Object} user - Objeto usuario
 * @returns {string} Access token JWT
 */
export const generateAccessToken = (user) => {
  const payload = {
    userId: user.id,
    email: user.email,
    role: user.role,
    name: user.name,
    type: 'access'
  };

  const options = {
    expiresIn: config.jwt.accessTokenExpiresIn || '15m',
    issuer: 'quiklii-api'
  };

  return jwt.sign(payload, config.jwt.secret, options);
};

/**
 * Generar refresh token JWT con expiración larga (30 días)
 * @param {Object} user - Objeto usuario
 * @returns {string} Refresh token JWT
 */
export const generateRefreshToken = (user) => {
  const payload = {
    userId: user.id,
    type: 'refresh'
  };

  const options = {
    expiresIn: config.jwt.refreshTokenExpiresIn || '30d',
    issuer: 'quiklii-api'
  };

  return jwt.sign(payload, config.jwt.refreshSecret || config.jwt.secret, options);
};

/**
 * Verificar access token JWT
 * @param {string} token - Token a verificar
 * @returns {Object} Payload decodificado
 * @throws {Error} Si el token es inválido
 */
export const verifyAccessToken = (token) => {
  try {
    const decoded = jwt.verify(token, config.jwt.secret);
    if (decoded.type !== 'access') {
      throw new Error('Token de tipo incorrecto');
    }
    return decoded;
  } catch (error) {
    throw new Error('Access token inválido o expirado');
  }
};

/**
 * Verificar refresh token JWT
 * @param {string} token - Refresh token a verificar
 * @returns {Object} Payload decodificado
 * @throws {Error} Si el token es inválido
 */
export const verifyRefreshToken = (token) => {
  try {
    const decoded = jwt.verify(token, config.jwt.refreshSecret || config.jwt.secret);
    if (decoded.type !== 'refresh') {
      throw new Error('Token de tipo incorrecto');
    }
    return decoded;
  } catch (error) {
    throw new Error('Refresh token inválido o expirado');
  }
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

/**
 * Extraer refresh token de las cookies
 * @param {Object} cookies - Objeto de cookies de la request
 * @returns {string|null} Refresh token o null
 */
export const extractRefreshTokenFromCookies = (cookies) => {
  return cookies?.refreshToken || null;
};

/**
 * Generar tokens y configurar cookies para respuesta
 * @param {Object} user - Usuario para generar tokens
 * @param {Object} res - Objeto response de Express
 * @returns {Object} Access token para enviar al cliente
 */
export const generateTokensAndSetCookies = (user, res) => {
  const accessToken = generateAccessToken(user);
  const refreshToken = generateRefreshToken(user);

  // Configurar cookie httpOnly para refresh token
  res.cookie('refreshToken', refreshToken, {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'strict',
    maxAge: 30 * 24 * 60 * 60 * 1000, // 30 días
    path: '/api/v1/auth'
  });

  return { accessToken, refreshToken };
};

/**
 * Limpiar cookies de autenticación
 * @param {Object} res - Objeto response de Express
 */
export const clearAuthCookies = (res) => {
  res.clearCookie('refreshToken', {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'strict',
    path: '/api/v1/auth'
  });
};
