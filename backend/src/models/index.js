import { sequelize } from '../database.js';

// Importar funciones de inicialización de modelos
import { initUser } from './User.js';
import { initRestaurant } from './Restaurant.js';
import { initOrder } from './Order.js';
import { initOrderItem } from './OrderItem.js';
import { initMenuItem } from './MenuItem.js';
import { initPayment } from './Payment.js';

// Inicializar modelos
const User = initUser(sequelize);
const Restaurant = initRestaurant(sequelize);
const Order = initOrder(sequelize);
const OrderItem = initOrderItem(sequelize);
const MenuItem = initMenuItem(sequelize);
const Payment = initPayment(sequelize);

// Configurar asociaciones entre modelos
const models = { User, Restaurant, Order, OrderItem, MenuItem, Payment };
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

export { User, Restaurant, Order, OrderItem, MenuItem, Payment, syncDatabase };
