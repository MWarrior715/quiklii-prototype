import { Sequelize } from 'sequelize';
import { config } from './environment.js';
import fs from 'fs';
import path from 'path';

// Función para obtener la configuración de base de datos activa
function getDatabaseConfig() {
  const dbType = config.database.current;
  return config.database[dbType];
}

// Asegurar que existe el directorio de SQLite
function ensureSqliteDir() {
  const dbDir = path.dirname('./src/data/database.sqlite');
  if (!fs.existsSync(dbDir)) {
    fs.mkdirSync(dbDir, { recursive: true });
  }
}

// Crear instancia de Sequelize basada en la configuración
function createSequelizeInstance() {
  const dbConfig = getDatabaseConfig();
  
  if (dbConfig.dialect === 'sqlite') {
    ensureSqliteDir();
    return new Sequelize({
      dialect: 'sqlite',
      storage: dbConfig.storage,
      logging: dbConfig.logging,
      define: {
        timestamps: true,
        underscored: true,
        createdAt: 'created_at',
        updatedAt: 'updated_at'
      }
    });
  } else {
    return new Sequelize(
      dbConfig.name,
      dbConfig.username,
      dbConfig.password,
      {
        host: dbConfig.host,
        port: dbConfig.port,
        dialect: dbConfig.dialect,
        logging: dbConfig.logging,
        pool: dbConfig.pool,
        define: {
          timestamps: true,
          underscored: true,
          createdAt: 'created_at',
          updatedAt: 'updated_at'
        },
        timezone: '-05:00' // Colombia
      }
    );
  }
}

// ✅ Instancia de Sequelize
export const sequelize = createSequelizeInstance();

// Función para probar la conexión
export const connectDatabase = async () => {
  try {
    const dbType = config.database.current;
    await sequelize.authenticate();
    console.log(`✅ Conexión a ${dbType.toUpperCase()} establecida exitosamente`);
    
    if (config.server.environment === 'development') {
      await sequelize.sync({ force: false });
      console.log(`🔄 Modelos sincronizados con ${dbType.toUpperCase()}`);
    }
    
    return true;
  } catch (error) {
    console.error('❌ Error al conectar con la base de datos:', error.message);
    
    if (config.database.current === 'postgres') {
      console.log('🔄 Intentando conectar con SQLite como respaldo...');
      process.env.USE_POSTGRES = 'false';
      return false;
    }
    
    process.exit(1);
  }
};

// Función para cerrar la conexión
export const closeDatabase = async () => {
  try {
    await sequelize.close();
    console.log('📴 Conexión a la base de datos cerrada');
  } catch (error) {
    console.error('❌ Error al cerrar la conexión:', error);
  }
};
