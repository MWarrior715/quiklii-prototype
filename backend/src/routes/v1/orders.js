import express from 'express';
import rateLimit from 'express-rate-limit';
import { authenticate, authorize } from '../../middleware/auth.js';
import { validateCreateOrder, validateConfirmPayment } from '../../middleware/validationJoi.js';
import { validateUUID, validatePagination } from '../../middleware/validation.js';
import orderController from '../../controllers/orderController.js';

// Rate limiter específico para pagos
const paymentLimiter = rateLimit({
  windowMs: 60 * 60 * 1000, // 1 hora
  max: 20, // 20 intentos de pago por hora por IP
  message: {
    success: false,
    error: 'Ha excedido el límite de intentos de pago. Intente nuevamente en 1 hora.'
  },
  standardHeaders: true,
  legacyHeaders: false
});

// Rate limiter específico para órdenes
const ordersLimiter = rateLimit({
  windowMs: 60 * 60 * 1000, // 1 hora
  max: 50, // 50 órdenes por hora por IP
  message: {
    success: false,
    error: 'Ha excedido el límite de solicitudes de órdenes. Intente nuevamente en 1 hora.'
  },
  standardHeaders: true,
  legacyHeaders: false
});

const router = express.Router();

// Crear pedido (con rate limiting específico)
router.post('/', authenticate, ordersLimiter, validateCreateOrder, orderController.createOrder);

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

// Iniciar un pago
router.post('/:orderId/payment/initiate', authenticate, paymentLimiter, validateUUID, orderController.initiatePayment);

// Confirmar un pago (webhook)
router.post('/payment/confirm', validateConfirmPayment, orderController.confirmPayment);

// Procesar pago en efectivo
router.post('/:orderId/payment/cash', authenticate, validateUUID, orderController.processCashPayment);

// Obtener pagos del usuario
router.get('/payments', authenticate, orderController.getUserPayments);

// Obtener detalle de un pago
router.get('/payment/:paymentId', authenticate, validateUUID, orderController.getPaymentById);

export default router;
