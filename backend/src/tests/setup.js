import { Sequelize } from 'sequelize';
import path from 'path';
import { config } from '../config/environment.js';
import { seedUsers } from '../seeders/userSeed.js';
import { seedRestaurants } from '../seeders/restaurantSeed.js';
import { sequelize } from '../database.js';

const __dirname = path.dirname(__filename);

// Configurar entorno de testing
process.env.NODE_ENV = 'test';
process.env.JWT_SECRET = 'test_jwt_secret_key_123';
process.env.JWT_REFRESH_SECRET = 'test_refresh_secret_key_456';

// Usar instancia de Sequelize importada (configurada para tests)

// Mock de JWT para tests
jest.mock('jsonwebtoken', () => ({
  sign: jest.fn((payload, secret, options) => `mock_token_${JSON.stringify(payload)}`),
  verify: jest.fn((token, secret) => {
    if (token.startsWith('mock_token_')) {
      const payload = JSON.parse(token.replace('mock_token_', ''));
      return payload;
    }
    throw new Error('Invalid token');
  })
}));

// Mock de bcrypt para tests
jest.mock('bcryptjs', () => ({
  hash: jest.fn(async (password) => `hashed_${password}`),
  compare: jest.fn(async (password, hashedPassword) => {
    return hashedPassword === `hashed_${password}`;
  }),
  genSalt: jest.fn(),
  hashSync: jest.fn(),
  compareSync: jest.fn()
}));

// Configurar Jest
beforeAll(async () => {
  try {
    // Sincronizar modelos (crear tablas)
    const models = await import('../models/index.js');

    // Ejecutar migraciones manualmente o sync
    await sequelize.sync({ force: true });

    // Seed data para tests
    await seedUsers();
    await seedRestaurants();

    console.log('✅ Setup de tests completado con datos de prueba');

  } catch (error) {
    console.error('❌ Error configurando base de datos para tests:', error);
    throw error;
  }
});

afterEach(async () => {
  // Limpiar datos después de cada test para aislamiento
  try {
    const models = await import('../models/index.js');

    // Limpiar tablas en orden para evitar restricciones de clave foránea
    await models.OrderItem.destroy({ where: {} });
    await models.Order.destroy({ where: {} });
    await models.MenuItem.destroy({ where: {} });
    await models.Restaurant.destroy({ where: {} });
    await models.User.destroy({ where: {} });
  } catch (error) {
    console.error('Error limpiando datos de prueba:', error);
  }
});

afterAll(async () => {
  // Cerrar conexión
  await sequelize.close();
});