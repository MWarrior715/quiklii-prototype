const express = require('express');
const rateLimit = require('express-rate-limit');
const { authenticate, authorize } = require('../../middleware/auth.js');
const { validateCreatePayment, validatePaymentStatus } = require('../../middleware/validationJoi.js');
const { validateUUID, validatePagination } = require('../../middleware/validation.js');
const paymentController = require('../../controllers/paymentController.js');

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

// Rate limiter específico para webhooks
const webhookLimiter = rateLimit({
  windowMs: 60 * 1000, // 1 minuto
  max: 100, // 100 webhooks por minuto por IP
  message: {
    success: false,
    error: 'Límite de webhooks excedido'
  },
  standardHeaders: true,
  legacyHeaders: false
});

// Rate limiter para estadísticas
const statsLimiter = rateLimit({
  windowMs: 60 * 60 * 1000, // 1 hora
  max: 10, // 10 consultas de estadísticas por hora por IP
  message: {
    success: false,
    error: 'Límite de consultas de estadísticas excedido'
  },
  standardHeaders: true,
  legacyHeaders: false
});

const router = express.Router();

/**
 * @swagger
 * /v1/payments:
 *   post:
 *     summary: Crear un nuevo pago
 *     tags: [Payments]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - orderId
 *               - paymentMethod
 *             properties:
 *               orderId:
 *                 type: string
 *                 format: uuid
 *               paymentMethod:
 *                 type: string
 *                 enum: [cash, card, nequi, daviplata, mercadopago, wompi, stripe]
 *               provider:
 *                 type: string
 *                 enum: [wompi, stripe, internal]
 *     responses:
 *       201:
 *         description: Pago creado exitosamente
 *       400:
 *         description: Datos inválidos
 *       401:
 *         description: No autorizado
 *       404:
 *         description: Orden no encontrada
 *       429:
 *         description: Límite de rate excedido
 */
router.post('/', authenticate, paymentLimiter, validateCreatePayment, paymentController.createPayment);

/**
 * @swagger
 * /v1/payments:
 *   get:
 *     summary: Obtener pagos del usuario autenticado
 *     tags: [Payments]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: page
 *         schema:
 *           type: integer
 *           minimum: 1
 *           default: 1
 *       - in: query
 *         name: limit
 *         schema:
 *           type: integer
 *           minimum: 1
 *           maximum: 100
 *           default: 10
 *     responses:
 *       200:
 *         description: Lista de pagos del usuario
 *       401:
 *         description: No autorizado
 */
router.get('/', authenticate, validatePagination, paymentController.getUserPayments);

/**
 * @swagger
 * /v1/payments/{paymentId}:
 *   get:
 *     summary: Obtener estado de un pago específico
 *     tags: [Payments]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: paymentId
 *         required: true
 *         schema:
 *           type: string
 *           format: uuid
 *     responses:
 *       200:
 *         description: Estado del pago
 *       401:
 *         description: No autorizado
 *       404:
 *         description: Pago no encontrado
 */
router.get('/:paymentId', authenticate, validateUUID, paymentController.getPaymentStatus);

/**
 * @swagger
 * /v1/payments/{paymentId}/retry:
 *   post:
 *     summary: Reintentar un pago fallido
 *     tags: [Payments]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: paymentId
 *         required: true
 *         schema:
 *           type: string
 *           format: uuid
 *     responses:
 *       200:
 *         description: Pago reintentado exitosamente
 *       400:
 *         description: Pago no puede ser reintentado
 *       401:
 *         description: No autorizado
 *       404:
 *         description: Pago no encontrado
 */
router.post('/:paymentId/retry', authenticate, validateUUID, paymentController.retryPayment);

/**
 * @swagger
 * /v1/payments/webhook/wompi:
 *   post:
 *     summary: Webhook para notificaciones de Wompi
 *     tags: [Payments]
 *     parameters:
 *       - in: header
 *         name: x-wompi-signature
 *         required: true
 *         schema:
 *           type: string
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               transaction:
 *                 type: object
 *               event:
 *                 type: string
 *     responses:
 *       200:
 *         description: Webhook procesado exitosamente
 *       400:
 *         description: Firma inválida o datos incorrectos
 *       401:
 *         description: Firma no válida
 */
router.post('/webhook/wompi', webhookLimiter, paymentController.handleWebhook);

/**
 * @swagger
 * /v1/payments/stats:
 *   get:
 *     summary: Obtener estadísticas de pagos (solo admin)
 *     tags: [Payments]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Estadísticas de pagos
 *       401:
 *         description: No autorizado
 *       403:
 *         description: Acceso denegado
 */
router.get('/stats', authenticate, authorize('admin'), statsLimiter, paymentController.getPaymentStats);

module.exports = router;