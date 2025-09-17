import express from 'express';
import { authenticate, authorize } from '../../middleware/auth.js';
import { validateUpdateProfile, validateAddress, validateChangePassword } from '../../middleware/validation.js';
import { getProfile, updateProfile, getAddresses, addAddress, changePassword, getAllUsers } from '../../controllers/userController.js';

const router = express.Router();

// Obtener perfil del usuario
router.get('/profile', authenticate, getProfile);

// Actualizar perfil
router.patch('/profile', authenticate, validateUpdateProfile, updateProfile);

// Cambiar contraseña
router.patch('/change-password', authenticate, validateChangePassword, changePassword);

// Obtener direcciones del usuario
router.get('/addresses', authenticate, getAddresses);

// Agregar dirección
router.post('/addresses', authenticate, validateAddress, addAddress);

// Listar todos los usuarios (solo admin)
router.get('/', authenticate, authorize('admin'), getAllUsers);

export default router;
