'use strict';
const crypto = require('crypto');

module.exports = {
  async up (queryInterface, Sequelize) {
    // Datos de ejemplo para restaurantes
    const restaurants = [
      {
        id: crypto.randomUUID(),
        name: 'Pizzeria Bella Vista',
        address: 'Carrera 7 #85-20, Centro, Bogotá',
        phone: '+573001234560',
        image_url: 'https://images.unsplash.com/photo-1513104890138-7c749659a591?w=400&h=300&fit=crop',
        category: 'Italiana',
        rating: 4.5,
        description: 'Auténtica pizza italiana con ingredientes frescos',
        delivery_time: 35,
        delivery_fee: 5000.00,
        min_order: 20000.00,
        is_active: true,
        opening_time: '11:00',
        closing_time: '23:00',
        created_at: new Date(),
        updated_at: new Date()
      },
      {
        id: crypto.randomUUID(),
        name: 'Sushi Express',
        address: 'Calle 72 #10-15, Chapinero, Bogotá',
        phone: '+573001234561',
        image_url: 'https://images.unsplash.com/photo-1579871494447-9811cf80d66c?w=400&h=300&fit=crop',
        category: 'Japonesa',
        rating: 4.7,
        description: 'Sushi fresco y rolls creativos',
        delivery_time: 30,
        delivery_fee: 6000.00,
        min_order: 25000.00,
        is_active: true,
        opening_time: '12:00',
        closing_time: '22:00',
        created_at: new Date(),
        updated_at: new Date()
      },
      {
        id: crypto.randomUUID(),
        name: 'Burger House',
        address: 'Carrera 15 #123-45, Zona Rosa, Bogotá',
        phone: '+573001234562',
        image_url: 'https://images.unsplash.com/photo-1568901346375-23c9450c58cd?w=400&h=300&fit=crop',
        category: 'Americana',
        rating: 4.3,
        description: 'Hamburguesas gourmet con papas fritas',
        delivery_time: 25,
        delivery_fee: 4500.00,
        min_order: 15000.00,
        is_active: true,
        opening_time: '10:00',
        closing_time: '24:00',
        created_at: new Date(),
        updated_at: new Date()
      }
    ];

    await queryInterface.bulkInsert('restaurants', restaurants);
  },

  async down (queryInterface, Sequelize) {
    await queryInterface.bulkDelete('restaurants', null, {});
  }
};