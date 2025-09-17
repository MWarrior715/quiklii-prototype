import { Model, DataTypes } from 'sequelize';

class OrderItem extends Model {
  static associate(models) {
    OrderItem.belongsTo(models.Order, {
      foreignKey: 'orderId',
      as: 'order'
    });
    
    OrderItem.belongsTo(models.MenuItem, {
      foreignKey: 'menuItemId',
      as: 'menuItem'
    });
  }
}

export const initOrderItem = (sequelize) => {
  OrderItem.init({
    id: {
      type: DataTypes.UUID,
      defaultValue: DataTypes.UUIDV4,
      primaryKey: true
    },
    orderId: {
      type: DataTypes.UUID,
      allowNull: false,
      references: {
        model: 'Orders',
        key: 'id'
      }
    },
    menuItemId: {
      type: DataTypes.UUID,
      allowNull: false,
      references: {
        model: 'MenuItems',
        key: 'id'
      }
    },
    quantity: {
      type: DataTypes.INTEGER,
      allowNull: false,
      defaultValue: 1
    },
    unitPrice: {
      type: DataTypes.DECIMAL(10, 2),
      allowNull: false
    },
    totalPrice: {
      type: DataTypes.DECIMAL(10, 2),
      allowNull: false
    },
    specialInstructions: {
      type: DataTypes.TEXT,
      allowNull: true
    },
    selectedModifiers: {
      type: DataTypes.JSON,
      allowNull: true,
      defaultValue: []
    }
  }, {
    sequelize,
    modelName: 'OrderItem',
    tableName: 'order_items',
    timestamps: true
  });

  return OrderItem;
};

export { OrderItem };