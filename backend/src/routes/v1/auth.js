const express = require('express');
const rateLimit = require('express-rate-limit');
const { validateLogin, validateRegister } = require('../../middleware/validationJoi.js');
const { authenticate, authenticateRefresh } = require('../../middleware/auth.js');
const { register, login, logout, refreshToken, verifyEmail, forgotPassword, verifyAuth } = require('../../controllers/authController.js');

// Rate limiter específico para autenticación
const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutos
  max: 5, // Solo 5 intentos por ventana
  message: {
    success: false,
    error: 'Demasiados intentos de autenticación. Intente nuevamente en 15 minutos.'
  },
  standardHeaders: true,
  legacyHeaders: false
});

const router = express.Router();

// Registro de usuario (con rate limiting estricto)
router.post('/register', authLimiter, validateRegister, register);

// Login (con rate limiting estricto)
router.post('/login', authLimiter, validateLogin, login);

// Verificar autenticación (token válido)
router.get('/verify', authenticate, verifyAuth);

// Logout
router.post('/logout', authenticate, logout);

// Renovar token (usa refresh token de cookies)
router.post('/refresh', authenticateRefresh, refreshToken);

// Verificar email
router.post('/verify-email', verifyEmail);

// Recuperar contraseña
router.post('/forgot-password', forgotPassword);

module.exports = router;
