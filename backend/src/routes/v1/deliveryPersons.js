const express = require('express');
const { authenticate, authorize } = require('../../middleware/auth.js');

const router = express.Router();

// Obtener pedidos disponibles para delivery
router.get('/available-orders', authenticate, authorize('delivery_person'), (req, res) => {
  res.json({ message: 'Pedidos disponibles - Próximamente implementado' });
});

// Aceptar pedido
router.post('/accept-order/:orderId', authenticate, authorize('delivery_person'), (req, res) => {
  res.json({ message: `Aceptar pedido ${req.params.orderId} - Próximamente implementado` });
});

// Actualizar ubicación
router.post('/location', authenticate, authorize('delivery_person'), (req, res) => {
  res.json({ message: 'Actualizar ubicación - Próximamente implementado' });
});

module.exports = router;
