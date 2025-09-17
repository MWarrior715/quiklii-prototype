import { Model, DataTypes } from 'sequelize';

class Order extends Model {
  static associate(models) {
    Order.belongsTo(models.User, {
      foreignKey: 'userId',
      as: 'user'
    });
    
    Order.belongsTo(models.Restaurant, {
      foreignKey: 'restaurantId',
      as: 'restaurant'
    });
    
    Order.hasMany(models.OrderItem, {
      foreignKey: 'orderId',
      as: 'items'
    });
  }
}

export const initOrder = (sequelize) => {
  Order.init({
    id: {
      type: DataTypes.UUID,
      defaultValue: DataTypes.UUIDV4,
      primaryKey: true
    },
    userId: {
      type: DataTypes.UUID,
      allowNull: false,
      references: {
        model: 'Users',
        key: 'id'
      }
    },
    restaurantId: {
      type: DataTypes.UUID,
      allowNull: false,
      references: {
        model: 'Restaurants',
        key: 'id'
      }
    },
    status: {
      type: DataTypes.ENUM('pending', 'confirmed', 'preparing', 'on_the_way', 'delivered', 'cancelled'),
      defaultValue: 'pending',
      allowNull: false
    },
    total: {
      type: DataTypes.DECIMAL(10, 2),
      allowNull: false
    },
    deliveryFee: {
      type: DataTypes.DECIMAL(10, 2),
      allowNull: false,
      defaultValue: 0.00
    },
    deliveryAddress: {
      type: DataTypes.STRING,
      allowNull: false
    },
    deliveryInstructions: {
      type: DataTypes.TEXT,
      allowNull: true
    },
    paymentMethod: {
      type: DataTypes.ENUM('mercadopago', 'payu', 'pse', 'nequi', 'daviplata', 'cash'),
      allowNull: false
    },
    paymentStatus: {
      type: DataTypes.ENUM('pending', 'completed', 'failed', 'refunded'),
      defaultValue: 'pending',
      allowNull: false
    },
    estimatedDeliveryTime: {
      type: DataTypes.DATE,
      allowNull: true
    }
  }, {
    sequelize,
    modelName: 'Order',
    tableName: 'orders',
    timestamps: true
  });

  return Order;
};

export { Order };