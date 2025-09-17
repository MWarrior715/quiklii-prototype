import express from 'express';
import { body, param } from 'express-validator';
import * as menuController from '../../controllers/menuController.js';
import { handleValidationErrors, validateMenuItem } from '../../middleware/validation.js';
import { authenticate } from '../../middleware/auth.js';

const authMiddleware = authenticate;
const router = express.Router();

// Validaciones comunes (puedes reutilizar validateMenuItem desde validation.js)
const menuItemValidations = validateMenuItem;

// GET /api/v1/menu - Listar todos los items (con paginación)
router.get('/', menuController.getAllMenuItems);

// GET /api/v1/menu/:id - Obtener un item específico
router.get('/:id', [
  param('id').isUUID().withMessage('ID inválido'),
  handleValidationErrors
], menuController.getMenuItem);

// GET /api/v1/restaurants/:id/menu - Obtener menú de un restaurante específico
router.get('/restaurants/:restaurantId/menu', [
  param('restaurantId').isUUID().withMessage('ID de restaurante inválido'),
  handleValidationErrors
], menuController.getRestaurantMenu);

// POST /api/v1/menu - Crear nuevo item (requiere autenticación)
router.post('/', [
  authMiddleware,
  ...menuItemValidations
], menuController.createMenuItem);

// PUT /api/v1/menu/:id - Actualizar item existente (requiere autenticación)
router.put('/:id', [
  authMiddleware,
  param('id').isUUID().withMessage('ID inválido'),
  ...menuItemValidations
], menuController.updateMenuItem);

// DELETE /api/v1/menu/:id - Eliminar item (soft delete) (requiere autenticación)
router.delete('/:id', [
  authMiddleware,
  param('id').isUUID().withMessage('ID inválido'),
  handleValidationErrors
], menuController.deleteMenuItem);

// GET /api/v1/menu/category/:category - Obtener items por categoría
router.get('/category/:category', [
  param('category').trim().notEmpty().withMessage('Categoría inválida'),
  handleValidationErrors
], menuController.getMenuItemsByCategory);

// GET /api/v1/menu/available - Obtener solo items disponibles
router.get('/available', menuController.getAvailableMenuItems);

// GET /api/v1/menu/on-sale - Obtener items en promoción
router.get('/on-sale', menuController.getMenuItemsOnSale);

export default router;
