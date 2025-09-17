import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import morgan from 'morgan';
import compression from 'compression';
import rateLimit from 'express-rate-limit';
import { createServer } from 'http';
import { Server } from 'socket.io';
import dotenv from 'dotenv';

// Importar configuración y base de datos
import { config } from './config/environment.js';
import { connectDatabase } from './database.js';
import { errorHandler } from './middleware/errorHandler.js';

// Importar rutas
import v1Routes from './routes/v1/index.js';

// Importar sockets
import { initializeOrderSockets } from './sockets/orderUpdates.js';

// Cargar variables de entorno
dotenv.config();

const app = express();
const server = createServer(app);
const io = new Server(server, {
  cors: {
    origin: process.env.FRONTEND_URL || "http://localhost:5173",
    methods: ["GET", "POST"]
  }
});

// Rate limiting
const limiter = rateLimit({
  windowMs: 1 * 60 * 1000, // 1 minuto (reducido para desarrollo)
  max: 500 // límite de 500 requests por ventana de tiempo (aumentado para desarrollo)
});

// Middleware global
app.use(helmet());
app.use(cors({
  origin: process.env.FRONTEND_URL || "http://localhost:5173",
  credentials: true
}));
app.use(compression());
app.use(morgan('combined'));
app.use(limiter);
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// Configurar Socket.io
initializeOrderSockets(io);

// Ruta de bienvenida
app.get('/', (req, res) => {
  const dbType = config.database.current;
  res.json({
    message: '🚀 Hello Quiklii API!',
    version: '1.0.0',
    description: 'Backend para la plataforma de delivery Quiklii',
    status: 'active',
    database: `✅ Conectado a ${dbType.toUpperCase()}`,
    endpoints: {
      health: '/health',
      api: '/api/v1',
      docs: '/api/v1/docs'
    },
    features: ['REST API', 'Real-time updates', 'Colombian payments'],
    environment: process.env.NODE_ENV || 'development'
  });
});

// Health check endpoint
app.get('/health', (req, res) => {
  const dbType = config.database.current;
  res.status(200).json({
    status: 'OK',
    timestamp: new Date().toISOString(),
    uptime: process.uptime(),
    memory: process.memoryUsage(),
    environment: process.env.NODE_ENV || 'development',
    database: `✅ ${dbType.toUpperCase()} conectada`
  });
});

// API Routes v1
app.use('/api/v1', v1Routes);

// Middleware de manejo de errores (debe ir al final)
app.use(errorHandler);

// Manejo de rutas no encontradas
app.use('*', (req, res) => {
  res.status(404).json({
    error: 'Endpoint not found',
    message: `La ruta ${req.originalUrl} no existe en esta API`,
    availableEndpoints: [
      'GET /',
      'GET /health', 
      'GET /api/v1'
    ]
  });
});

const PORT = process.env.PORT || 3001;

// Función para iniciar el servidor
const startServer = async () => {
  try {
    // Conectar a la base de datos
    let connected = await connectDatabase();
    
    // Si falló PostgreSQL, reintentar con SQLite
    if (!connected && config.database.current === 'postgres') {
      console.log('🔄 PostgreSQL no disponible, cambiando a SQLite...');
      process.env.USE_POSTGRES = 'false';
      // Recargar configuración
      delete require.cache[require.resolve('./config/environment.js')];
      delete require.cache[require.resolve('./config/database.js')];
      
      const { connectDatabase: connectDatabaseRetry } = await import('./config/database.js');
      connected = await connectDatabaseRetry();
    }
    
    if (!connected) {
      console.error('❌ No se pudo conectar a ninguna base de datos');
      process.exit(1);
    }

    // Iniciar servidor
    server.listen(PORT, () => {
      const dbType = config.database.current;
      console.log(`
  🚀 Quiklii API Server iniciado exitosamente!
  
  📍 Puerto: ${PORT}
  🌍 Entorno: ${process.env.NODE_ENV || 'development'}
  📱 Frontend URL: ${process.env.FRONTEND_URL || 'http://localhost:5173'}
  🔗 API Base URL: http://localhost:${PORT}/api/v1
  🗄️  Base de datos: ${dbType.toUpperCase()}
  
  📋 Endpoints disponibles:
  • GET  /                 → Información de la API
  • GET  /health           → Estado del servidor
  • GET  /api/v1           → Rutas principales de la API
  • POST /api/v1/auth/register → Registro de usuario
  • POST /api/v1/auth/login    → Login de usuario
  
  ✅ Listo para recibir requests!
  `);
    });

  } catch (error) {
    console.error('❌ Error iniciando servidor:', error);
    process.exit(1);
  }
};

// Manejo de cierre graceful
process.on('SIGTERM', () => {
  console.log('🛑 SIGTERM recibido, cerrando servidor graciosamente...');
  server.close(() => {
    console.log('📴 Servidor cerrado');
    process.exit(0);
  });
});

process.on('SIGINT', () => {
  console.log('🛑 SIGINT recibido, cerrando servidor graciosamente...');
  server.close(() => {
    console.log('📴 Servidor cerrado');
    process.exit(0);
  });
});

// Iniciar servidor
startServer();

export default app;
