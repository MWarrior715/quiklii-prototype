'use strict';

module.exports = {
  async up (queryInterface, Sequelize) {
    await queryInterface.createTable('payments', {
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

      amount: {
        type: Sequelize.DECIMAL(10, 2),
        allowNull: false
      },

      currency: {
        type: Sequelize.STRING(3),
        allowNull: false,
        defaultValue: 'COP'
      },

      payment_method: {
        type: Sequelize.ENUM('cash', 'card', 'nequi', 'daviplata', 'mercadopago', 'wompi', 'stripe'),
        allowNull: false
      },

      provider: {
        type: Sequelize.ENUM('wompi', 'stripe', 'internal'),
        allowNull: false,
        defaultValue: 'internal'
      },

      status: {
        type: Sequelize.ENUM('pending', 'processing', 'completed', 'failed', 'cancelled', 'refunded'),
        allowNull: false,
        defaultValue: 'pending'
      },

      transaction_id: {
        type: Sequelize.STRING,
        allowNull: true
      },

      reference: {
        type: Sequelize.STRING,
        allowNull: true
      },

      payment_data: {
        type: Sequelize.JSON,
        allowNull: true,
        comment: 'Datos adicionales del proveedor de pago (Wompi, Stripe, etc.)'
      },

      processed_at: {
        type: Sequelize.DATE,
        allowNull: true
      },

      error_message: {
        type: Sequelize.TEXT,
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
    await queryInterface.addIndex('payments', ['order_id']);
    await queryInterface.addIndex('payments', ['user_id']);
    await queryInterface.addIndex('payments', ['status']);
    await queryInterface.addIndex('payments', ['provider']);
    await queryInterface.addIndex('payments', ['transaction_id']);
    await queryInterface.addIndex('payments', ['created_at']);
  },

  async down (queryInterface, Sequelize) {
    await queryInterface.dropTable('payments');
  }
};