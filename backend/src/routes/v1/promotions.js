const express = require('express');
const { authenticate, authorize, optionalAuth } = require('../../middleware/auth.js');
const { validatePagination } = require('../../middleware/validation.js');

const router = express.Router();

// Listar promociones activas (público)
router.get('/', validatePagination, optionalAuth, (req, res) => {
  res.json({ message: 'Promociones activas - Próximamente implementado' });
});

// Crear promoción (admin/restaurant)
router.post('/', authenticate, authorize('admin', 'restaurant_owner'), (req, res) => {
  res.json({ message: 'Crear promoción - Próximamente implementado' });
});

module.exports = router;
