import express from 'express';

// Importar rutas específicas
import authRoutes from './auth.js';
import restaurantRoutes from './restaurants.js';
import orderRoutes from './orders.js';
import userRoutes from './users.js';
import deliveryPersonRoutes from './deliveryPersons.js';
import promotionRoutes from './promotions.js';
import menuRoutes from './menu.js';

const router = express.Router();

// Ruta de bienvenida de la API v1
router.get('/', (req, res) => {
  res.json({
    message: '🚀 Quiklii API v1',
    version: '1.0.0',
    description: 'API REST para la plataforma de delivery Quiklii',
    status: 'active',
    endpoints: {
      auth: '/auth',
      restaurants: '/restaurants',
      orders: '/orders',
      users: '/users',
      deliveryPersons: '/delivery-persons',
      promotions: '/promotions',
      menu: '/menu'
    },
    features: [
      'Autenticación JWT',
      'Gestión de restaurantes',
      'Sistema de pedidos',
      'Tracking en tiempo real',
      'Pagos colombianos',
      'Notificaciones push'
    ],
    documentation: '/docs',
    support: {
      email: 'dev@quiklii.com',
      phone: '+57 1 234 5678'
    }
  });
});

// Rutas de la API
router.use('/auth', authRoutes);
router.use('/restaurants', restaurantRoutes);
router.use('/orders', orderRoutes);
router.use('/users', userRoutes);
router.use('/delivery-persons', deliveryPersonRoutes);
router.use('/promotions', promotionRoutes);
router.use('/menu', menuRoutes);

export default router;
