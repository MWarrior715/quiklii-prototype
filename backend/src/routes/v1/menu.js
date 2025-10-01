const express = require('express');
const { param } = require('express-validator');
const menuController = require('../../controllers/menuController.js');
const { handleValidationErrors, validateMenuItem } = require('../../middleware/validation.js');
const { validateCreateMenuItem } = require('../../middleware/validationJoi.js');
const { authenticate } = require('../../middleware/auth.js');

const authMiddleware = authenticate;
const router = express.Router();

// GET /api/v1/menu - Listar todos los items (con paginación)
router.get('/', menuController.getAllMenuItems);

// GET /api/v1/menu/:id - Obtener un item específico
router.get('/:id', [
  param('id').isUUID().withMessage('ID inválido'),
  handleValidationErrors
], menuController.getMenuItem);


// POST /api/v1/menu - Crear nuevo item (requiere autenticación)
router.post('/', [
  authMiddleware,
  validateCreateMenuItem
], menuController.createMenuItem);

// PUT /api/v1/menu/:id - Actualizar item existente (requiere autenticación)
router.put('/:id', [
  authMiddleware,
  param('id').isUUID().withMessage('ID inválido'),
  ...validateMenuItem
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

module.exports = router;
