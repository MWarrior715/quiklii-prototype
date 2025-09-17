import express from 'express';
import { validateLogin, validateRegister } from '../../middleware/validation.js';
import { authenticate } from '../../middleware/auth.js';
import { register, login, logout, refreshToken, verifyEmail, forgotPassword, verifyAuth } from '../../controllers/authController.js';

const router = express.Router();

// Registro de usuario
router.post('/register', validateRegister, register);

// Login
router.post('/login', validateLogin, login);

// Verificar autenticación (token válido)
router.get('/verify', authenticate, verifyAuth);

// Logout
router.post('/logout', authenticate, logout);

// Renovar token
router.post('/refresh', refreshToken);

// Verificar email
router.post('/verify-email', verifyEmail);

// Recuperar contraseña
router.post('/forgot-password', forgotPassword);

export default router;
