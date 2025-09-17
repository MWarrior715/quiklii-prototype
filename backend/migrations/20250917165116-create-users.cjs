'use strict';

module.exports = {
  async up (queryInterface, Sequelize) {
    await queryInterface.createTable('users', {
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

      email: {
        type: Sequelize.STRING(255),
        allowNull: false,
        unique: true
      },

      phone: {
        type: Sequelize.STRING(20),
        allowNull: true,
        unique: true
      },

      password: {
        type: Sequelize.STRING(255),
        allowNull: false
      },

      role: {
        type: Sequelize.ENUM('customer', 'restaurant_owner', 'delivery_person', 'admin'),
        allowNull: false,
        defaultValue: 'customer'
      },

      is_email_verified: {
        type: Sequelize.BOOLEAN,
        allowNull: false,
        defaultValue: false
      },

      is_phone_verified: {
        type: Sequelize.BOOLEAN,
        allowNull: false,
        defaultValue: false
      },

      profile_image: {
        type: Sequelize.STRING(500),
        allowNull: true
      },

      address: {
        type: Sequelize.JSON,
        allowNull: true,
        defaultValue: null
      },

      favorite_restaurants: {
        type: Sequelize.JSON,
        allowNull: true,
        defaultValue: []
      },

      last_login_at: {
        type: Sequelize.DATE,
        allowNull: true
      },

      is_active: {
        type: Sequelize.BOOLEAN,
        allowNull: false,
        defaultValue: true
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
    await queryInterface.addIndex('users', ['email'], { unique: true });
    await queryInterface.addIndex('users', ['phone'], {
      unique: true,
      where: { phone: { [Sequelize.Op.ne]: null } }
    });
    await queryInterface.addIndex('users', ['role']);
  },

  async down (queryInterface, Sequelize) {
    await queryInterface.dropTable('users');
  }
};