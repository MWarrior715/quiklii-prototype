import sequelize from '../database.js';

// Importar modelos
import { User, initUser } from './User.js';
import { Restaurant, initRestaurant } from './Restaurant.js';
import { Order, initOrder } from './Order.js';
import { OrderItem, initOrderItem } from './OrderItem.js';
import { MenuItem, initMenuItem } from './MenuItem.js';

// Inicializar modelos
const models = {
  User: initUser(sequelize),
  Restaurant: initRestaurant(sequelize),
  Order: initOrder(sequelize),
  OrderItem: initOrderItem(sequelize),
  MenuItem: initMenuItem(sequelize)
};

// Configurar asociaciones entre modelos
Object.values(models).forEach((model) => {
  if (model.associate) {
    model.associate(models);
  }
});

// Sincronizar base de datos en desarrollo
const syncDatabase = async () => {
  try {
    await sequelize.sync({ force: false });
    console.log('🔄 Base de datos sincronizada correctamente');
  } catch (error) {
    console.error('❌ Error sincronizando base de datos:', error);
    throw error;
  }
};

export { models as default, syncDatabase };
export { User, Restaurant, Order, OrderItem, MenuItem };
