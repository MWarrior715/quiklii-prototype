import express from 'express';
import { authenticate, authorize } from '../../middleware/auth.js';
import { validateOrder, validateUUID, validatePagination } from '../../middleware/validation.js';
import orderController from '../../controllers/orderController.js';

const router = express.Router();

// Crear pedido
router.post('/', authenticate, validateOrder, orderController.createOrder);

// Listar pedidos del usuario
router.get('/', authenticate, validatePagination, orderController.getUserOrders);

// Obtener pedido por ID
router.get('/:id', authenticate, validateUUID, orderController.getOrderById);

// Actualizar estado de pedido
router.put('/:id/status', authenticate, authorize('restaurant_owner', 'delivery_person', 'admin'), validateUUID, orderController.updateOrderStatus);

// Obtener pedidos de un restaurante
router.get('/restaurant/:restaurantId', authenticate, authorize('restaurant_owner', 'admin'), validateUUID, orderController.getRestaurantOrders);

// Obtener historial de pedidos de un usuario
router.get('/user/:userId', authenticate, validateUUID, orderController.getUserOrderHistory);

export default router;
