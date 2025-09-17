import express from 'express';
import { authenticate, authorize, optionalAuth } from '../../middleware/auth.js';
import { validatePagination } from '../../middleware/validation.js';

const router = express.Router();

// Listar promociones activas (público)
router.get('/', validatePagination, optionalAuth, (req, res) => {
  res.json({ message: 'Promociones activas - Próximamente implementado' });
});

// Crear promoción (admin/restaurant)
router.post('/', authenticate, authorize('admin', 'restaurant_owner'), (req, res) => {
  res.json({ message: 'Crear promoción - Próximamente implementado' });
});

export default router;
