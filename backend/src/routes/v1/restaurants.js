const express = require('express');
const { param } = require('express-validator');
const { authenticate, authorize, optionalAuth } = require('../../middleware/auth.js');
const { validateRestaurant, validateUUID, validatePagination, validateRestaurantFilters, handleValidationErrors } = require('../../middleware/validation.js');
const {
  getAllRestaurants,
  getRestaurantById,
  createRestaurant,
  updateRestaurant,
  deleteRestaurant,
  getRestaurantsByCategory,
  getTopRatedRestaurants
} = require('../../controllers/restaurantController.js');
const menuController = require('../../controllers/menuController.js');

const router = express.Router();

// Rutas especiales (deben ir antes de las rutas con parámetros)
router.get('/top-rated', getTopRatedRestaurants);
router.get('/category/:category', getRestaurantsByCategory);

// Obtener todos los restaurantes con filtros y paginación
router.get('/', validatePagination, validateRestaurantFilters, getAllRestaurants);

// Obtener restaurante por ID
router.get('/:id', validateUUID, getRestaurantById);

// GET /api/v1/restaurants/:id/menu - Obtener menú de un restaurante específico
router.get('/:restaurantId/menu', [
  param('restaurantId').isUUID().withMessage('ID de restaurante inválido'),
  handleValidationErrors
], menuController.getRestaurantMenu);

// Crear restaurante (sin autenticación por ahora para testing)
router.post('/', validateRestaurant, createRestaurant);

// Actualizar restaurante (sin autenticación por ahora para testing)
router.put('/:id', validateUUID, updateRestaurant);

// Eliminar restaurante (sin autenticación por ahora para testing)
router.delete('/:id', validateUUID, deleteRestaurant);

module.exports = router;
