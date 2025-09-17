'use strict';
const crypto = require('crypto');

module.exports = {
  async up (queryInterface, Sequelize) {
    // Obtener IDs de restaurantes existentes
    const restaurants = await queryInterface.sequelize.query('SELECT id FROM restaurants LIMIT 3', {
      type: Sequelize.QueryTypes.SELECT
    });

    if (restaurants.length === 0) {
      console.log('⚠️ No hay restaurantes para crear items de menú de ejemplo.');
      return;
    }

    // Datos de ejemplo para items de menú
    const menuItems = [
      {
        id: crypto.randomUUID(),
        name: 'Pizza Margherita',
        description: 'Pizza clásica con salsa de tomate, mozzarella y albahaca fresca',
        price: 25000.00,
        image: 'https://images.unsplash.com/photo-1604382354936-07c5d9983bd3?w=300&h=200&fit=crop',
        available: true,
        restaurant_id: restaurants[0].id,
        category: 'Pizzas',
        preparation_time: 20,
        is_vegetarian: true,
        is_spicy: false,
        allergens: JSON.stringify(['Lácteos', 'Gluten']),
        nutritional_info: JSON.stringify({ calories: 850, protein: 35 }),
        discount: null,
        created_at: new Date(),
        updated_at: new Date()
      },
      {
        id: crypto.randomUUID(),
        name: 'Sushi Roll California',
        description: 'Roll de sushi con aguacate, pepino y cangrejo',
        price: 18000.00,
        image: 'https://images.unsplash.com/photo-1579584425555-c3ce17fd4351?w=300&h=200&fit=crop',
        available: true,
        restaurant_id: restaurants[1].id,
        category: 'Rolls',
        preparation_time: 15,
        is_vegetarian: false,
        is_spicy: false,
        allergens: JSON.stringify(['Pescado', 'Mariscos']),
        nutritional_info: JSON.stringify({ calories: 320, protein: 18 }),
        discount: null,
        created_at: new Date(),
        updated_at: new Date()
      },
      {
        id: crypto.randomUUID(),
        name: 'Hamburguesa Clásica',
        description: 'Hamburguesa con queso, lechuga, tomate y salsa especial',
        price: 15000.00,
        image: 'https://images.unsplash.com/photo-1568901346375-23c9450c58cd?w=300&h=200&fit=crop',
        available: true,
        restaurant_id: restaurants[2].id,
        category: 'Hamburguesas',
        preparation_time: 12,
        is_vegetarian: false,
        is_spicy: false,
        allergens: JSON.stringify(['Gluten', 'Lácteos']),
        nutritional_info: JSON.stringify({ calories: 650, protein: 28 }),
        discount: null,
        created_at: new Date(),
        updated_at: new Date()
      },
      {
        id: crypto.randomUUID(),
        name: 'Ensalada César',
        description: 'Ensalada con pollo, crutones, parmesano y aderezo césar',
        price: 12000.00,
        image: 'https://images.unsplash.com/photo-1550304943-4f24f54ddde9?w=300&h=200&fit=crop',
        available: true,
        restaurant_id: restaurants[0].id,
        category: 'Ensaladas',
        preparation_time: 10,
        is_vegetarian: false,
        is_spicy: false,
        allergens: JSON.stringify(['Lácteos', 'Gluten']),
        nutritional_info: JSON.stringify({ calories: 450, protein: 32 }),
        discount: null,
        created_at: new Date(),
        updated_at: new Date()
      },
      {
        id: crypto.randomUUID(),
        name: 'Sashimi de Salmón',
        description: 'Salmón fresco cortado en láminas finas',
        price: 22000.00,
        image: 'https://images.unsplash.com/photo-1546833999-b9f581a1996d?w=300&h=200&fit=crop',
        available: true,
        restaurant_id: restaurants[1].id,
        category: 'Sashimi',
        preparation_time: 8,
        is_vegetarian: false,
        is_spicy: false,
        allergens: JSON.stringify(['Pescado']),
        nutritional_info: JSON.stringify({ calories: 280, protein: 25 }),
        discount: null,
        created_at: new Date(),
        updated_at: new Date()
      }
    ];

    await queryInterface.bulkInsert('menu_items', menuItems);
  },

  async down (queryInterface, Sequelize) {
    await queryInterface.bulkDelete('menu_items', null, {});
  }
};