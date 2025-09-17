'use strict';

module.exports = {
  async up(queryInterface, Sequelize) {
    // Evitar falla si la tabla no existe (más robusto para entornos nuevos)
    const tables = await queryInterface.showAllTables();
    const normalized = tables.map(t => String(t));
    if (!normalized.includes('menu_items')) {
      console.log('Skipping migration 20250913210111-change-menuitem-id-to-uuid: table "menu_items" not found.');
      return;
    }

    const dialect = queryInterface.sequelize.getDialect();

    if (dialect === 'sqlite') {
      await queryInterface.createTable('menu_items_tmp', {
        id: {
          type: Sequelize.UUID,
          primaryKey: true,
          allowNull: false,
          defaultValue: Sequelize.UUIDV4,
        },
        name: {
          type: Sequelize.STRING(100),
          allowNull: false,
        },
        description: {
          type: Sequelize.TEXT,
        },
        price: {
          type: Sequelize.DECIMAL(10, 2),
          allowNull: false,
        },
        image: {
          type: Sequelize.STRING(500),
        },
        available: {
          type: Sequelize.BOOLEAN,
          allowNull: false,
          defaultValue: true,
        },
        restaurant_id: {
          type: Sequelize.UUID,
          allowNull: false,
        },
        category: {
          type: Sequelize.STRING(50),
        },
        preparation_time: {
          type: Sequelize.INTEGER,
          defaultValue: 15,
        },
        is_vegetarian: {
          type: Sequelize.BOOLEAN,
          defaultValue: false,
        },
        is_spicy: {
          type: Sequelize.BOOLEAN,
          defaultValue: false,
        },
        allergens: {
          type: Sequelize.JSON,
          defaultValue: [],
        },
        nutritional_info: {
          type: Sequelize.JSON,
        },
        discount: {
          type: Sequelize.DECIMAL(5, 2),
        },
        created_at: {
          type: Sequelize.DATE,
          allowNull: false,
          defaultValue: Sequelize.literal('CURRENT_TIMESTAMP'),
        },
        updated_at: {
          type: Sequelize.DATE,
          allowNull: false,
          defaultValue: Sequelize.literal('CURRENT_TIMESTAMP'),
        },
      });

      await queryInterface.sequelize.query(`
        INSERT INTO menu_items_tmp (
          id, name, description, price, image, available, restaurant_id,
          category, preparation_time, is_vegetarian, is_spicy,
          allergens, nutritional_info, discount, created_at, updated_at
        )
        SELECT
          lower(hex(randomblob(16))), name, description, price, image, available, restaurant_id,
          category, preparation_time, is_vegetarian, is_spicy,
          allergens, nutritional_info, discount, created_at, updated_at
        FROM menu_items;
      `);

      await queryInterface.dropTable('menu_items');
      await queryInterface.renameTable('menu_items_tmp', 'menu_items');

    } else if (dialect === 'postgres') {
      await queryInterface.sequelize.query(`CREATE EXTENSION IF NOT EXISTS "pgcrypto";`);

      await queryInterface.changeColumn('menu_items', 'id', {
        type: Sequelize.UUID,
        allowNull: false,
        defaultValue: Sequelize.literal('gen_random_uuid()'),
        primaryKey: true,
      });
    }
  },

  async down(queryInterface, Sequelize) {
    const dialect = queryInterface.sequelize.getDialect();

    if (dialect === 'sqlite') {
      await queryInterface.createTable('menu_items_tmp', {
        id: {
          type: Sequelize.INTEGER,
          autoIncrement: true,
          primaryKey: true,
        },
        name: {
          type: Sequelize.STRING(100),
          allowNull: false,
        },
        description: Sequelize.TEXT,
        price: {
          type: Sequelize.DECIMAL(10, 2),
          allowNull: false,
        },
        image: Sequelize.STRING(500),
        available: {
          type: Sequelize.BOOLEAN,
          allowNull: false,
          defaultValue: true,
        },
        restaurant_id: {
          type: Sequelize.UUID,
          allowNull: false,
        },
        category: Sequelize.STRING(50),
        preparation_time: {
          type: Sequelize.INTEGER,
          defaultValue: 15,
        },
        is_vegetarian: {
          type: Sequelize.BOOLEAN,
          defaultValue: false,
        },
        is_spicy: {
          type: Sequelize.BOOLEAN,
          defaultValue: false,
        },
        allergens: Sequelize.JSON,
        nutritional_info: Sequelize.JSON,
        discount: Sequelize.DECIMAL(5, 2),
        created_at: Sequelize.DATE,
        updated_at: Sequelize.DATE,
      });

      await queryInterface.sequelize.query(`
        INSERT INTO menu_items_tmp (
          name, description, price, image, available, restaurant_id,
          category, preparation_time, is_vegetarian, is_spicy,
          allergens, nutritional_info, discount, created_at, updated_at
        )
        SELECT
          name, description, price, image, available, restaurant_id,
          category, preparation_time, is_vegetarian, is_spicy,
          allergens, nutritional_info, discount, created_at, updated_at
        FROM menu_items;
      `);

      await queryInterface.dropTable('menu_items');
      await queryInterface.renameTable('menu_items_tmp', 'menu_items');

    } else if (dialect === 'postgres') {
      await queryInterface.changeColumn('menu_items', 'id', {
        type: Sequelize.INTEGER,
        autoIncrement: true,
        primaryKey: true,
      });
    }
  }
};