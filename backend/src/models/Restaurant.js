import { DataTypes } from 'sequelize';

let Restaurant;

export function initRestaurant(sequelize) {
  Restaurant = sequelize.define('Restaurant', {
  id: {
    type: DataTypes.UUID,
    defaultValue: DataTypes.UUIDV4,
    primaryKey: true,
    allowNull: false
  },
  
  name: {
    type: DataTypes.STRING(100),
    allowNull: false,
    validate: {
      len: [2, 100],
      notEmpty: true
    }
  },
  
  address: {
    type: DataTypes.STRING(200),
    allowNull: false,
    validate: {
      len: [5, 200],
      notEmpty: true
    }
  },
  
  phone: {
    type: DataTypes.STRING(20),
    allowNull: true,
    unique: true,
    validate: {
      is: /^[\+]?[1-9][\d\s\-\(\)]{7,19}$/ // Formato internacional de teléfono
    }
  },
  
  imageUrl: {
    type: DataTypes.STRING(500),
    allowNull: true,
    field: 'image_url',
    validate: {
      isUrl: true
    }
  },
  
  category: {
    type: DataTypes.STRING(50),
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
    type: DataTypes.FLOAT,
    allowNull: false,
    defaultValue: 0.0,
    validate: {
      min: 0.0,
      max: 5.0,
      isFloat: true
    }
  },
  
  description: {
    type: DataTypes.TEXT,
    allowNull: true,
    validate: {
      len: [0, 500]
    }
  },
  
  deliveryTime: {
    type: DataTypes.INTEGER,
    allowNull: true,
    defaultValue: 30,
    field: 'delivery_time',
    validate: {
      min: 10,
      max: 120
    }
  },
  
  deliveryFee: {
    type: DataTypes.DECIMAL(10, 2),
    allowNull: false,
    defaultValue: 0.00,
    field: 'delivery_fee',
    validate: {
      min: 0.00,
      max: 50000.00
    }
  },
  
  minOrder: {
    type: DataTypes.DECIMAL(10, 2),
    allowNull: false,
    defaultValue: 0.00,
    field: 'min_order',
    validate: {
      min: 0.00
    }
  },
  
  isActive: {
    type: DataTypes.BOOLEAN,
    defaultValue: true,
    field: 'is_active'
  },
  
  openingTime: {
    type: DataTypes.TIME,
    allowNull: true,
    field: 'opening_time'
  },
  
  closingTime: {
    type: DataTypes.TIME,
    allowNull: true,
    field: 'closing_time'
  }
}, {
  tableName: 'restaurants',
  timestamps: true,
  underscored: true,
  indexes: [
    {
      fields: ['name']
    },
    {
      unique: true,
      fields: ['phone'],
      where: {
        phone: {
          [sequelize.Sequelize.Op.ne]: null
        }
      }
    },
    {
      fields: ['category']
    },
    {
      fields: ['rating']
    },
    {
      fields: ['is_active']
    }
  ]
});

// Métodos de instancia
Restaurant.prototype.toJSON = function() {
  const values = Object.assign({}, this.get());
  return values;
};

// Métodos de clase
Restaurant.findActive = async function() {
  return this.findAll({
    where: { isActive: true },
    order: [['rating', 'DESC'], ['name', 'ASC']]
  });
};

Restaurant.findByCategory = async function(category) {
  return this.findAll({
    where: {
      category: category,
      isActive: true
    },
    order: [['rating', 'DESC']]
  });
};

Restaurant.findTopRated = async function(limit = 10) {
  return this.findAll({
    where: { isActive: true },
    order: [['rating', 'DESC']],
    limit: limit
  });
};

  return Restaurant;
}

export { Restaurant };
