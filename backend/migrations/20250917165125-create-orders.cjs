'use strict';

module.exports = {
  async up (queryInterface, Sequelize) {
    await queryInterface.createTable('orders', {
      id: {
        type: Sequelize.UUID,
        allowNull: false,
        primaryKey: true,
        defaultValue: Sequelize.UUIDV4
      },

      user_id: {
        type: Sequelize.UUID,
        allowNull: false,
        references: {
          model: 'users',
          key: 'id'
        },
        onUpdate: 'CASCADE',
        onDelete: 'CASCADE'
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

      status: {
        type: Sequelize.ENUM('pending', 'confirmed', 'preparing', 'on_the_way', 'delivered', 'cancelled'),
        allowNull: false,
        defaultValue: 'pending'
      },

      total: {
        type: Sequelize.DECIMAL(10, 2),
        allowNull: false
      },

      delivery_fee: {
        type: Sequelize.DECIMAL(10, 2),
        allowNull: false,
        defaultValue: 0.00
      },

      delivery_address: {
        type: Sequelize.STRING,
        allowNull: false
      },

      delivery_instructions: {
        type: Sequelize.TEXT,
        allowNull: true
      },

      payment_method: {
        type: Sequelize.ENUM('mercadopago', 'payu', 'pse', 'nequi', 'daviplata', 'cash'),
        allowNull: false
      },

      payment_status: {
        type: Sequelize.ENUM('pending', 'completed', 'failed', 'refunded'),
        allowNull: false,
        defaultValue: 'pending'
      },

      estimated_delivery_time: {
        type: Sequelize.DATE,
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
    await queryInterface.addIndex('orders', ['user_id']);
    await queryInterface.addIndex('orders', ['restaurant_id']);
    await queryInterface.addIndex('orders', ['status']);
    await queryInterface.addIndex('orders', ['payment_status']);
    await queryInterface.addIndex('orders', ['created_at']);
  },

  async down (queryInterface, Sequelize) {
    await queryInterface.dropTable('orders');
  }
};