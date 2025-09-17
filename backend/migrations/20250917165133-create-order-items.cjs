'use strict';

module.exports = {
  async up (queryInterface, Sequelize) {
    await queryInterface.createTable('order_items', {
      id: {
        type: Sequelize.UUID,
        allowNull: false,
        primaryKey: true,
        defaultValue: Sequelize.UUIDV4
      },

      order_id: {
        type: Sequelize.UUID,
        allowNull: false,
        references: {
          model: 'orders',
          key: 'id'
        },
        onUpdate: 'CASCADE',
        onDelete: 'CASCADE'
      },

      menu_item_id: {
        type: Sequelize.UUID,
        allowNull: false,
        references: {
          model: 'menu_items',
          key: 'id'
        },
        onUpdate: 'CASCADE',
        onDelete: 'CASCADE'
      },

      quantity: {
        type: Sequelize.INTEGER,
        allowNull: false,
        defaultValue: 1
      },

      unit_price: {
        type: Sequelize.DECIMAL(10, 2),
        allowNull: false
      },

      total_price: {
        type: Sequelize.DECIMAL(10, 2),
        allowNull: false
      },

      special_instructions: {
        type: Sequelize.TEXT,
        allowNull: true
      },

      selected_modifiers: {
        type: Sequelize.JSON,
        allowNull: true,
        defaultValue: []
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
    await queryInterface.addIndex('order_items', ['order_id']);
    await queryInterface.addIndex('order_items', ['menu_item_id']);
    await queryInterface.addIndex('order_items', ['quantity']);
  },

  async down (queryInterface, Sequelize) {
    await queryInterface.dropTable('order_items');
  }
};