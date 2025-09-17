'use strict';
const crypto = require('crypto');

module.exports = {
  async up (queryInterface, Sequelize) {
    // Obtener IDs de usuarios y restaurantes existentes
    const users = await queryInterface.sequelize.query('SELECT id FROM users LIMIT 2', {
      type: Sequelize.QueryTypes.SELECT
    });
    const restaurants = await queryInterface.sequelize.query('SELECT id FROM restaurants LIMIT 3', {
      type: Sequelize.QueryTypes.SELECT
    });

    if (users.length === 0 || restaurants.length === 0) {
      console.log('⚠️ No hay usuarios o restaurantes suficientes para crear órdenes de ejemplo.');
      return;
    }

    // Datos de ejemplo para órdenes
    const orders = [
      {
        id: crypto.randomUUID(),
        user_id: users[0].id,
        restaurant_id: restaurants[0].id,
        status: 'delivered',
        total: 45000.00,
        delivery_fee: 4500.00,
        delivery_address: 'Carrera 15 #123-45, Zona Rosa, Bogotá',
        delivery_instructions: 'Dejar en portería edificio Azul',
        payment_method: 'mercadopago',
        payment_status: 'completed',
        estimated_delivery_time: new Date(Date.now() + 35 * 60 * 1000), // 35 minutos desde ahora
        created_at: new Date(),
        updated_at: new Date()
      },
      {
        id: crypto.randomUUID(),
        user_id: users[1].id,
        restaurant_id: restaurants[1].id,
        status: 'preparing',
        total: 68000.00,
        delivery_fee: 5000.00,
        delivery_address: 'Calle 72 #10-15, Chapinero, Bogotá',
        delivery_instructions: 'Llamar al llegar',
        payment_method: 'nequi',
        payment_status: 'completed',
        estimated_delivery_time: new Date(Date.now() + 40 * 60 * 1000), // 40 minutos
        created_at: new Date(),
        updated_at: new Date()
      },
      {
        id: crypto.randomUUID(),
        user_id: users[0].id,
        restaurant_id: restaurants[2].id,
        status: 'pending',
        total: 32000.00,
        delivery_fee: 3500.00,
        delivery_address: 'Carrera 15 #123-45, Zona Rosa, Bogotá',
        delivery_instructions: null,
        payment_method: 'cash',
        payment_status: 'pending',
        estimated_delivery_time: new Date(Date.now() + 25 * 60 * 1000), // 25 minutos
        created_at: new Date(),
        updated_at: new Date()
      }
    ];

    await queryInterface.bulkInsert('orders', orders);
  },

  async down (queryInterface, Sequelize) {
    await queryInterface.bulkDelete('orders', null, {});
  }
};