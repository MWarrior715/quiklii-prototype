'use strict';
const crypto = require('crypto');

module.exports = {
  async up (queryInterface, Sequelize) {
    // Datos de ejemplo para restaurantes
    const restaurants = [
      {
        id: 'ebaf82d5-305a-4de3-a4a2-0735ebe29b8e',
        name: 'Café Paradiso',
        address: 'Carrera 7 #24-89, Bogotá',
        category: 'Mediterránea',
        rating: 4.6,
        delivery_fee: 1500.00,
        min_order: 8000.00,
        image_url: 'https://images.unsplash.com/photo-1559496417-e7f25cb247f3?w=400&h=300&fit=crop',
        is_active: true,
        created_at: new Date(),
        updated_at: new Date()
      }
    ];

    await queryInterface.bulkInsert('restaurants', restaurants, {});
  },

  async down (queryInterface, Sequelize) {
    await queryInterface.bulkDelete('restaurants', null, {});
  }
};