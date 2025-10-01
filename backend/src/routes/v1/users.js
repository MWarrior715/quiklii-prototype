const express = require('express');
const { authenticate, authorize } = require('../../middleware/auth.js');
const { validateUpdateProfile, validateAddress, validateChangePassword } = require('../../middleware/validation.js');
const { getProfile, updateProfile, getAddresses, addAddress, changePassword, getAllUsers } = require('../../controllers/userController.js');

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

module.exports = router;
