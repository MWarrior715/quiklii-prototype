'use strict';
const crypto = require('crypto');

module.exports = {
  async up (queryInterface, Sequelize) {
    // Obtener IDs de órdenes y items de menú existentes
    const orders = await queryInterface.sequelize.query('SELECT id FROM orders LIMIT 3', {
      type: Sequelize.QueryTypes.SELECT
    });
    const menuItems = await queryInterface.sequelize.query('SELECT id, price FROM menu_items LIMIT 5', {
      type: Sequelize.QueryTypes.SELECT
    });

    if (orders.length === 0 || menuItems.length === 0) {
      console.log('⚠️ No hay órdenes o items de menú suficientes para crear items de orden de ejemplo.');
      return;
    }

    // Datos de ejemplo para items de orden
    const orderItems = [
      {
        id: crypto.randomUUID(),
        order_id: orders[0].id,
        menu_item_id: menuItems[0].id,
        quantity: 2,
        unit_price: menuItems[0].price || 25000.00,
        total_price: (menuItems[0].price || 25000.00) * 2,
        special_instructions: 'Sin cebolla por favor',
        selected_modifiers: JSON.stringify([]),
        created_at: new Date(),
        updated_at: new Date()
      },
      {
        id: crypto.randomUUID(),
        order_id: orders[0].id,
        menu_item_id: menuItems[1].id,
        quantity: 1,
        unit_price: menuItems[1].price || 18000.00,
        total_price: menuItems[1].price || 18000.00,
        special_instructions: null,
        selected_modifiers: JSON.stringify([]),
        created_at: new Date(),
        updated_at: new Date()
      },
      {
        id: crypto.randomUUID(),
        order_id: orders[1].id,
        menu_item_id: menuItems[2].id,
        quantity: 3,
        unit_price: menuItems[2].price || 15000.00,
        total_price: (menuItems[2].price || 15000.00) * 3,
        special_instructions: 'Extra queso',
        selected_modifiers: JSON.stringify([{ name: 'Extra queso', price: 3000.00 }]),
        created_at: new Date(),
        updated_at: new Date()
      },
      {
        id: crypto.randomUUID(),
        order_id: orders[1].id,
        menu_item_id: menuItems[3].id,
        quantity: 1,
        unit_price: menuItems[3].price || 12000.00,
        total_price: menuItems[3].price || 12000.00,
        special_instructions: 'Medio picante',
        selected_modifiers: JSON.stringify([]),
        created_at: new Date(),
        updated_at: new Date()
      },
      {
        id: crypto.randomUUID(),
        order_id: orders[2].id,
        menu_item_id: menuItems[4].id,
        quantity: 1,
        unit_price: menuItems[4].price || 22000.00,
        total_price: menuItems[4].price || 22000.00,
        special_instructions: null,
        selected_modifiers: JSON.stringify([]),
        created_at: new Date(),
        updated_at: new Date()
      }
    ];

    await queryInterface.bulkInsert('order_items', orderItems);
  },

  async down (queryInterface, Sequelize) {
    await queryInterface.bulkDelete('order_items', null, {});
  }
};