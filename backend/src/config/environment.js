import dotenv from 'dotenv';

// Cargar variables de entorno
dotenv.config();

export const config = {
  // Servidor
  server: {
    port: process.env.PORT || 3001,
    environment: process.env.NODE_ENV || 'development',
    frontendUrl: process.env.FRONTEND_URL || 'http://localhost:5173'
  },

  // Base de datos
  database: {
    // Configuración para PostgreSQL (producción)
    postgres: {
      host: process.env.DB_HOST || 'localhost',
      port: process.env.DB_PORT || 5432,
      name: process.env.DB_NAME || 'quiklii_db',
      username: process.env.DB_USERNAME || 'quiklii_user',
      password: process.env.DB_PASSWORD || 'quiklii_password',
      dialect: 'postgres',
      logging: process.env.NODE_ENV === 'development' ? console.log : false,
      pool: {
        max: 10,
        min: 0,
        acquire: 30000,
        idle: 10000
      }
    },
    // Configuración para SQLite (desarrollo temporal)
    sqlite: {
      dialect: 'sqlite',
      storage: './src/data/database.sqlite',
      logging: process.env.NODE_ENV === 'development' ? console.log : false
    },
    // Usar SQLite por defecto - NO usar PostgreSQL hasta indicación
    current: 'sqlite'
  },

  // JWT
  jwt: {
    secret: process.env.JWT_SECRET || 'quiklii_super_secret_key_2024',
    expiresIn: process.env.JWT_EXPIRES_IN || '7d',
    refreshExpiresIn: process.env.JWT_REFRESH_EXPIRES_IN || '30d'
  },

  // Redis (para cache y sesiones)
  redis: {
    host: process.env.REDIS_HOST || 'localhost',
    port: process.env.REDIS_PORT || 6379,
    password: process.env.REDIS_PASSWORD || 'quiklii_redis_password'
  },

  // Uploads
  uploads: {
    maxSize: process.env.MAX_UPLOAD_SIZE || '10mb',
    allowedTypes: ['image/jpeg', 'image/png', 'image/webp'],
    destination: process.env.UPLOAD_DESTINATION || './uploads'
  },

  // Rate limiting
  rateLimiting: {
    windowMs: 15 * 60 * 1000, // 15 minutos
    max: process.env.RATE_LIMIT_MAX || 100
  },

  // Pagos (Para integraciones futuras)
  payments: {
    mercadoPago: {
      accessToken: process.env.MERCADOPAGO_ACCESS_TOKEN,
      publicKey: process.env.MERCADOPAGO_PUBLIC_KEY
    },
    payu: {
      apiKey: process.env.PAYU_API_KEY,
      merchantId: process.env.PAYU_MERCHANT_ID
    }
  },

  // Notificaciones
  notifications: {
    smtp: {
      host: process.env.SMTP_HOST,
      port: process.env.SMTP_PORT || 587,
      user: process.env.SMTP_USER,
      password: process.env.SMTP_PASSWORD
    },
    twilio: {
      accountSid: process.env.TWILIO_ACCOUNT_SID,
      authToken: process.env.TWILIO_AUTH_TOKEN,
      phoneNumber: process.env.TWILIO_PHONE_NUMBER
    }
  }
};
