'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up (queryInterface, Sequelize) {
    await queryInterface.createTable('restaurants', {
      id: {
        type: Sequelize.UUID,
        defaultValue: Sequelize.UUIDV4,
        primaryKey: true,
        allowNull: false
      },

      name: {
        type: Sequelize.STRING(100),
        allowNull: false,
        validate: {
          len: [2, 100],
          notEmpty: true
        }
      },

      address: {
        type: Sequelize.STRING(200),
        allowNull: false,
        validate: {
          len: [5, 200],
          notEmpty: true
        }
      },

      phone: {
        type: Sequelize.STRING(20),
        allowNull: true,
        unique: true,
        validate: {
          is: /^[\+]?[1-9][\d\s\-\(\)]{7,19}$/
        }
      },

      image_url: {
        type: Sequelize.STRING(500),
        allowNull: true,
        validate: {
          isUrl: true
        }
      },

      category: {
        type: Sequelize.STRING(50),
        allowNull: false,
        defaultValue: 'General',
        validate: {
          len: [2, 50],
          isIn: {
            args: [['Italiana', 'Japonesa', 'Mexicana', 'Comida local', 'Asiática', 'Americana', 'Mediterránea', 'Vegetariana', 'Pizzería', 'Hamburguesas', 'Sushi', 'Parrilla', 'General']],
            msg: 'Categoría no válida'
          }
        }
      },

      rating: {
        type: Sequelize.FLOAT,
        allowNull: false,
        defaultValue: 0.0,
        validate: {
          min: 0.0,
          max: 5.0,
          isFloat: true
        }
      },

      description: {
        type: Sequelize.TEXT,
        allowNull: true,
        validate: {
          len: [0, 500]
        }
      },

      delivery_time: {
        type: Sequelize.INTEGER,
        allowNull: true,
        defaultValue: 30,
        validate: {
          min: 10,
          max: 120
        }
      },

      delivery_fee: {
        type: Sequelize.DECIMAL(10, 2),
        allowNull: false,
        defaultValue: 0.00,
        validate: {
          min: 0.00,
          max: 50.00
        }
      },

      min_order: {
        type: Sequelize.DECIMAL(10, 2),
        allowNull: false,
        defaultValue: 0.00,
        validate: {
          min: 0.00
        }
      },

      is_active: {
        type: Sequelize.BOOLEAN,
        defaultValue: true
      },

      opening_time: {
        type: Sequelize.TIME,
        allowNull: true
      },

      closing_time: {
        type: Sequelize.TIME,
        allowNull: true
      },

      created_at: {
        type: Sequelize.DATE,
        allowNull: false
      },

      updated_at: {
        type: Sequelize.DATE,
        allowNull: false
      }
    });

    // Crear índices para optimizar consultas
    await queryInterface.addIndex('restaurants', ['name']);
    await queryInterface.addIndex('restaurants', ['phone'], {
      unique: true,
      where: {
        phone: {
          [Sequelize.Op.ne]: null
        }
      }
    });
    await queryInterface.addIndex('restaurants', ['category']);
    await queryInterface.addIndex('restaurants', ['rating']);
    await queryInterface.addIndex('restaurants', ['is_active']);
  },

  async down (queryInterface, Sequelize) {
    await queryInterface.dropTable('restaurants');
  }
};
