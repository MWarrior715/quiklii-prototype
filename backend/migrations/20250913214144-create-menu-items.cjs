'use strict';

module.exports = {
  async up (queryInterface, Sequelize) {
    await queryInterface.createTable('menu_items', {
      id: {
        type: Sequelize.UUID,
        allowNull: false,
        primaryKey: true,
        defaultValue: Sequelize.UUIDV4
      },

      name: {
        type: Sequelize.STRING(100),
        allowNull: false
      },

      description: {
        type: Sequelize.TEXT,
        allowNull: true
      },

      price: {
        type: Sequelize.DECIMAL(10,2),
        allowNull: false
      },

      image: {
        type: Sequelize.STRING(500),
        allowNull: true
      },

      available: {
        type: Sequelize.BOOLEAN,
        allowNull: false,
        defaultValue: true
      },

      restaurant_id: {
        type: Sequelize.UUID,
        allowNull: false,
        references: {
          model: 'restaurants',
          key: 'id'
        },
        onUpdate: 'CASCADE',
        onDelete: 'CASCADE'
      },

      category: {
        type: Sequelize.STRING(50),
        allowNull: true
      },

      preparation_time: {
        type: Sequelize.INTEGER,
        allowNull: true,
        defaultValue: 15
      },

      is_vegetarian: {
        type: Sequelize.BOOLEAN,
        allowNull: false,
        defaultValue: false
      },

      is_spicy: {
        type: Sequelize.BOOLEAN,
        allowNull: false,
        defaultValue: false
      },

      allergens: {
        type: Sequelize.JSON,
        allowNull: true,
        defaultValue: []
      },

      nutritional_info: {
        type: Sequelize.JSON,
        allowNull: true
      },

      discount: {
        type: Sequelize.DECIMAL(5,2),
        allowNull: true
      },

      created_at: {
        allowNull: false,
        type: Sequelize.DATE,
        defaultValue: Sequelize.literal('CURRENT_TIMESTAMP')
      },

      updated_at: {
        allowNull: false,
        type: Sequelize.DATE,
        defaultValue: Sequelize.literal('CURRENT_TIMESTAMP')
      }
    });

    // Índices útiles
    await queryInterface.addIndex('menu_items', ['restaurant_id']);
    await queryInterface.addIndex('menu_items', ['name']);
    await queryInterface.addIndex('menu_items', ['available']);
    await queryInterface.addIndex('menu_items', ['category']);
    await queryInterface.addIndex('menu_items', ['price']);
    await queryInterface.addIndex('menu_items', ['is_vegetarian']);
    await queryInterface.addIndex('menu_items', ['is_spicy']);
  },

  async down (queryInterface, Sequelize) {
    await queryInterface.dropTable('menu_items');
  }
};