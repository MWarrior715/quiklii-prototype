import { User } from '../models/index.js';

// Datos de ejemplo para usuarios de prueba
const userSeedData = [
  {
    name: 'Juan Pérez',
    email: 'juan.perez@example.com',
    phone: '+573001234567',
    password: 'password123',
    role: 'customer',
    isEmailVerified: true,
    isPhoneVerified: true
  },
  {
    name: 'María García',
    email: 'maria.garcia@example.com',
    phone: '+573001234568',
    password: 'password123',
    role: 'restaurant_owner',
    isEmailVerified: true,
    isPhoneVerified: false
  },
  {
    name: 'Carlos Rodríguez',
    email: 'carlos.rodriguez@example.com',
    phone: '+573001234569',
    password: 'password123',
    role: 'delivery_person',
    isEmailVerified: false,
    isPhoneVerified: true
  }
];

// Función para poblar la base de datos con usuarios de ejemplo
const seedUsers = async () => {
  try {
    console.log('🌱 Iniciando seed de usuarios...');

    // Verificar si ya existen usuarios
    const existingUsers = await User.count();

    if (existingUsers > 0) {
      console.log(`⚠️  Ya existen ${existingUsers} usuarios en la base de datos.`);
      return;
    }

    // Crear usuarios de ejemplo
    const createdUsers = await User.bulkCreate(userSeedData);

    console.log(`✅ ${createdUsers.length} usuarios creados exitosamente:`);
    createdUsers.forEach((user, index) => {
      console.log(`   ${index + 1}. ${user.name} (${user.email}) - ${user.role}`);
    });

    return createdUsers;

  } catch (error) {
    console.error('❌ Error en seed de usuarios:', error);
    throw error;
  }
};

// Función para limpiar todos los usuarios
const clearUsers = async () => {
  try {
    console.log('🗑️  Limpiando usuarios existentes...');

    const deletedCount = await User.destroy({
      where: {},
      truncate: true
    });

    console.log(`✅ ${deletedCount} usuarios eliminados.`);

  } catch (error) {
    console.error('❌ Error limpiando usuarios:', error);
    throw error;
  }
};

// Exports
export { seedUsers, clearUsers };