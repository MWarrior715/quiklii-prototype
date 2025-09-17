import { Model, DataTypes, Op } from 'sequelize';

class MenuItem extends Model {
  static associate(models) {
    MenuItem.belongsTo(models.Restaurant, {
      foreignKey: 'restaurantId',
      as: 'restaurant'
    });
  }

  toJSON() {
    const values = Object.assign({}, this.get());
    
    // Calcular precio con descuento si aplica
    if (values.discount && values.discount > 0) {
      values.discountedPrice = (values.price * (1 - values.discount / 100)).toFixed(2);
    }
    
    return values;
  }

  getFormattedPrice() {
    return `$${parseFloat(this.price).toLocaleString('es-CO')}`;
  }

  isOnSale() {
    return this.discount && this.discount > 0;
  }

  // 🔹 Consultas utilitarias
  static async findByRestaurant(restaurantId, options = {}) {
    return this.findAll({
      where: { restaurantId, available: true },
      order: [['category', 'ASC'], ['name', 'ASC']],
      ...options
    });
  }

  static async findAvailable(options = {}) {
    return this.findAll({
      where: { available: true },
      order: [['name', 'ASC']],
      ...options
    });
  }

  static async findByCategory(restaurantId, category, options = {}) {
    return this.findAll({
      where: { restaurantId, category, available: true },
      order: [['name', 'ASC']],
      ...options
    });
  }

  static async findVegetarian(restaurantId, options = {}) {
    return this.findAll({
      where: { restaurantId, isVegetarian: true, available: true },
      order: [['name', 'ASC']],
      ...options
    });
  }

  static async findOnSale(restaurantId = null, options = {}) {
    const where = {
      discount: { [Op.gt]: 0 },
      available: true
    };
    if (restaurantId) where.restaurantId = restaurantId;

    return this.findAll({
      where,
      order: [['discount', 'DESC'], ['name', 'ASC']],
      ...options
    });
  }
}

export const initMenuItem = (sequelize) => {
  MenuItem.init({
    id: {
      type: DataTypes.UUID,  // 🔹 Antes era INTEGER
      primaryKey: true,
      defaultValue: DataTypes.UUIDV4,
      allowNull: false
    },

    name: {
      type: DataTypes.STRING(100),
      allowNull: false,
      validate: { len: [2, 100], notEmpty: true }
    },

    description: {
      type: DataTypes.TEXT,
      allowNull: true,
      validate: { len: [0, 500] }
    },

    price: {
      type: DataTypes.DECIMAL(10, 2),
      allowNull: false,
      validate: { min: 0.01, isDecimal: true, notEmpty: true }
    },

    image: {
      type: DataTypes.STRING(500),
      allowNull: true,
      validate: { isUrl: true }
    },

    available: {
      type: DataTypes.BOOLEAN,
      allowNull: false,
      defaultValue: true
    },

    restaurantId: {
      type: DataTypes.UUID,
      allowNull: false,
      field: 'restaurant_id',
      references: {
        model: 'restaurants',
        key: 'id'
      }
    },

    category: {
      type: DataTypes.STRING(50),
      allowNull: true,
      validate: { len: [0, 50] }
    },

    preparationTime: {
      type: DataTypes.INTEGER,
      allowNull: true,
      defaultValue: 15,
      field: 'preparation_time',
      validate: { min: 1, max: 120 }
    },

    isVegetarian: {
      type: DataTypes.BOOLEAN,
      allowNull: false,
      defaultValue: false,
      field: 'is_vegetarian'
    },

    isSpicy: {
      type: DataTypes.BOOLEAN,
      allowNull: false,
      defaultValue: false,
      field: 'is_spicy'
    },

    allergens: {
      type: DataTypes.JSON,
      allowNull: true,
      defaultValue: []
    },

    nutritionalInfo: {
      type: DataTypes.JSON,
      allowNull: true,
      defaultValue: null,
      field: 'nutritional_info'
    },

    discount: {
      type: DataTypes.DECIMAL(5, 2),
      allowNull: true,
      defaultValue: null,
      validate: { min: 0.00, max: 100.00 }
    }
  }, {
    sequelize,
    tableName: 'menu_items',
    timestamps: true,
    underscored: true,
    indexes: [
      { fields: ['restaurant_id'] },
      { fields: ['name'] },
      { fields: ['available'] },
      { fields: ['category'] },
      { fields: ['price'] },
      { fields: ['is_vegetarian'] },
      { fields: ['is_spicy'] }
    ]
  });

  return MenuItem;
};

export { MenuItem };
