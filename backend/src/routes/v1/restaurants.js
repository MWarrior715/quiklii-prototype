import express from 'express';
import { authenticate, authorize, optionalAuth } from '../../middleware/auth.js';
import { validateRestaurant, validateUUID, validatePagination, validateRestaurantFilters } from '../../middleware/validation.js';
import { 
  getAllRestaurants, 
  getRestaurantById, 
  createRestaurant, 
  updateRestaurant, 
  deleteRestaurant,
  getRestaurantsByCategory,
  getTopRatedRestaurants
} from '../../controllers/restaurantController.js';

const router = express.Router();

// Rutas especiales (deben ir antes de las rutas con parámetros)
router.get('/top-rated', getTopRatedRestaurants);
router.get('/category/:category', getRestaurantsByCategory);

// Obtener todos los restaurantes con filtros y paginación
router.get('/', validatePagination, validateRestaurantFilters, getAllRestaurants);

// Obtener restaurante por ID
router.get('/:id', validateUUID, getRestaurantById);

// Crear restaurante (sin autenticación por ahora para testing)
router.post('/', validateRestaurant, createRestaurant);

// Actualizar restaurante (sin autenticación por ahora para testing)
router.put('/:id', validateUUID, updateRestaurant);

// Eliminar restaurante (sin autenticación por ahora para testing)
router.delete('/:id', validateUUID, deleteRestaurant);

export default router;
