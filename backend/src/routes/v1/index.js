const express = require('express');

// Importar rutas específicas
const authRoutes = require('./auth.js');
const restaurantRoutes = require('./restaurants.js');
const orderRoutes = require('./orders.js');
const userRoutes = require('./users.js');
const deliveryPersonRoutes = require('./deliveryPersons.js');
const promotionRoutes = require('./promotions.js');
const menuRoutes = require('./menu.js');
const paymentRoutes = require('./payments.js');

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
      menu: '/menu',
      payments: '/payments'
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
router.use('/payments', paymentRoutes);

module.exports = router;
