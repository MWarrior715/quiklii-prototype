import { Sequelize } from 'sequelize';
import path from 'path';
import { fileURLToPath } from 'url';
import { config } from '../config/environment.js';

const __dirname = path.dirname(fileURLToPath(import.meta.url));

// Configurar entorno de testing
process.env.NODE_ENV = 'test';

// Crear instancia de Sequelize para tests (in-memory)
const sequelize = new Sequelize({
  dialect: 'sqlite',
  storage: ':memory:',
  logging: false,
  define: {
    timestamps: true,
    underscored: true,
    createdAt: 'created_at',
    updatedAt: 'updated_at'
  }
});

// Configurar Jest
beforeAll(async () => {
  try {
    // Sincronizar modelos (crear tablas)
    const modelsPath = path.join(__dirname, '../models/index.js');
    const models = await import(modelsPath);
    
    // Ejecutar migraciones manualmente o sync
    await sequelize.sync({ force: true });
    
    // Seed data básica si es necesario
    // Por ahora, depender de seeders si los tests necesitan data
    
  } catch (error) {
    console.error('Error configurando base de datos para tests:', error);
  }
});

afterAll(async () => {
  // Cerrar conexión
  await sequelize.close();
});