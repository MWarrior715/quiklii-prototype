// backend/src/app-db.js
const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const morgan = require('morgan');
const compression = require('compression');
const rateLimit = require('express-rate-limit');
const { createServer } = require('http');
const { Server } = require('socket.io');
const dotenv = require('dotenv');
const path = require('path');
const fs = require('fs');

// Importar configuración y base de datos
const { config } = require('./config/environment.js');
const { connectDatabase } = require('./database.js');
const { errorHandler } = require('./middleware/errorHandler.js');

// Importar rutas
const v1Routes = require('./routes/v1/index.js');
const uploadRoutes = require('./routes/uploadRoutes.js');

// Importar middleware de imágenes
const { imageFallbackMiddleware } = require('./middleware/imageFallback.js');

// Importar servicios de tiempo real
const { initializeRealtimeService } = require('./services/realtimeService.js');
const { initializeRoomManager } = require('./sockets/roomManager.js');
const { initializeFallbackService } = require('./services/fallbackService.js');
const { initializeReconnectionService } = require('./services/reconnectionService.js');

// Cargar variables de entorno
dotenv.config();

const app = express();
const server = createServer(app);

// Configuración avanzada de Socket.io
const io = new Server(server, {
  cors: {
    origin: process.env.FRONTEND_URL || "http://localhost:5173",
    methods: ["GET", "POST"],
    credentials: true
  },
  // Configuración de conexión
  maxHttpBufferSize: 1e8, // 100 MB para payloads grandes
  pingTimeout: 60000,     // 60 segundos para ping timeout
  pingInterval: 25000,    // 25 segundos entre pings

  // Configuración de transporte
  transports: ['websocket', 'polling'],

  // Configuración de seguridad
  allowEIO3: true,        // Permitir Engine.IO v3
  allowUpgrades: true,    // Permitir upgrades de protocolo

  // Configuración de límites
  connectTimeout: 45000,  // 45 segundos para conexión
  upgradeTimeout: 10000,  // 10 segundos para upgrade

  // Configuración de reconexión
  allowRequest: (req, callback) => {
    // Validar origen de la solicitud
    const origin = req.headers.origin;
    const allowedOrigins = [
      process.env.FRONTEND_URL || "http://localhost:5173",
      "http://localhost:3000",
      "http://127.0.0.1:5173",
      "http://127.0.0.1:3000"
    ];

    if (allowedOrigins.includes(origin) || !origin) {
      callback(null, true);
    } else {
      callback(new Error('Origen no permitido'), false);
    }
  }
});

// Configuraciones de rate limiting diferenciadas
const generalLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutos
  max: 100, // 100 requests por IP
  message: {
    success: false,
    error: 'Demasiadas solicitudes desde esta IP, por favor inténtelo más tarde.'
  },
  standardHeaders: true,
  legacyHeaders: false
});

const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutos para autenticación
  max: 100, // Solo 100 intentos de login/registro por ventana
  message: {
    success: false,
    error: 'Demasiados intentos de autenticación. Intente nuevamente en 15 minutos.'
  },
  standardHeaders: true,
  legacyHeaders: false
});

const ordersLimiter = rateLimit({
  windowMs: 60 * 60 * 1000, // 1 hora para órdenes
  max: 50, // 50 órdenes por hora por IP
  message: {
    success: false,
    error: 'Ha excedido el límite de solicitudes de órdenes. Intente nuevamente en 1 hora.'
  },
  standardHeaders: true,
  legacyHeaders: false
});

// Configuración avanzada de Helmet para headers de seguridad
app.use(helmet({
  contentSecurityPolicy: {
    directives: {
      defaultSrc: ["'self'"],
      scriptSrc: ["'self'", "'unsafe-inline'", "'unsafe-eval'", "https://trusted-cdn.com"],
      styleSrc: ["'self'", "'unsafe-inline'", "https://fonts.googleapis.com"],
      fontSrc: ["'self'", "https://fonts.gstatic.com"],
      imgSrc: ["'self'", "data:", "https:", "blob:"],
      connectSrc: ["'self'", "https://api.stripe.com", "https://api.mercadopago.com"],
      objectSrc: ["'none'"],
      upgradeInsecureRequests: [],
    },
  },
  crossOriginEmbedderPolicy: false, // Para compatibilidad con APIs externas
  hsts: {
    maxAge: 31536000,
    includeSubDomains: true,
    preload: true
  },
  referrerPolicy: { policy: "strict-origin-when-cross-origin" },
  frameguard: { action: "deny" },
  noSniff: true,
  xssFilter: true
}));

app.use(cors({
  origin: process.env.FRONTEND_URL || "http://localhost:5173",
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With']
}));
app.use(compression());
app.use(morgan('combined'));
app.use(generalLimiter);
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// Crear directorios de uploads si no existen
const uploadsDir = path.join(process.cwd(), 'uploads');
const imagesDir = path.join(uploadsDir, 'images');
const tempDir = path.join(imagesDir, 'temp');
const restaurantsDir = path.join(imagesDir, 'restaurants');
const productsDir = path.join(imagesDir, 'products');
const profilesDir = path.join(imagesDir, 'profiles');

const dirsToCreate = [uploadsDir, imagesDir, tempDir, restaurantsDir, productsDir, profilesDir];

dirsToCreate.forEach(dir => {
  if (!fs.existsSync(dir)) {
    fs.mkdirSync(dir, { recursive: true });
  }
});

// Servir archivos estáticos desde /uploads con middleware de fallback
app.use('/uploads', imageFallbackMiddleware);
app.use('/uploads', express.static(uploadsDir));

// Inicializar servicios de tiempo real avanzados
const realtimeService = initializeRealtimeService(io);
const roomManager = initializeRoomManager(io);

// Inicializar servicios adicionales después del servicio de tiempo real
realtimeService.initializeFallbackService();
realtimeService.initializeReconnectionService();

// Middleware de autenticación para Socket.io
io.use(async (socket, next) => {
  try {
    const token = socket.handshake.auth.token || socket.handshake.headers.authorization?.split(' ')[1];

    if (!token) {
      return next(new Error('Token de autenticación requerido'));
    }

    // Verificar token JWT
    const jwt = require('jsonwebtoken');
    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    // Agregar información del usuario al socket
    socket.userId = decoded.id;
    socket.userRole = decoded.role;
    socket.userEmail = decoded.email;

    console.log(`🔐 Socket autenticado: ${socket.userId} (${socket.userRole})`);
    next();

  } catch (error) {
    console.error('❌ Error de autenticación en Socket.io:', error);
    next(new Error('Token de autenticación inválido'));
  }
});

// Configurar manejadores de conexión
io.on('connection', (socket) => {
  console.log(`🔗 Nueva conexión WebSocket: ${socket.id} (Usuario: ${socket.userId})`);

  // Configurar heartbeat personalizado
  socket.conn.on('heartbeat', () => {
    console.log(`💓 Heartbeat recibido de ${socket.id}`);
  });

  // Configurar timeout de conexión
  socket.conn.on('timeout', () => {
    console.log(`⏰ Timeout de conexión para ${socket.id}`);
  });

  // Manejar errores de conexión
  socket.conn.on('error', (error) => {
    console.error(`❌ Error de conexión para ${socket.id}:`, error);
  });

  // Configurar limpieza al desconectar
  socket.on('disconnect', (reason) => {
    console.log(`🔌 Desconexión WebSocket: ${socket.id} - Razón: ${reason}`);
  });
});

// Configurar limpieza graceful
process.on('SIGTERM', () => {
  console.log('🛑 SIGTERM recibido, cerrando servicios de tiempo real...');
  realtimeService.close();
  server.close(() => {
    console.log('📴 Servidor cerrado por SIGTERM');
    process.exit(0);
  });
});

process.on('SIGINT', () => {
  console.log('🛑 SIGINT recibido, cerrando servicios de tiempo real...');
  realtimeService.close();
  server.close(() => {
    console.log('📴 Servidor cerrado por SIGINT');
    process.exit(0);
  });
});

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
    features: ['REST API', 'Real-time WebSocket', 'Advanced Room Management', 'JWT Authentication', 'Fallback SSE/Polling', 'Auto-reconnection', 'Colombian payments', 'Image Upload & Optimization'],
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

// Real-time service stats endpoint
app.get('/api/v1/realtime/stats', (req, res) => {
  try {
    const stats = realtimeService.getStats();
    res.status(200).json({
      success: true,
      data: stats,
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    console.error('Error obteniendo estadísticas de tiempo real:', error);
    res.status(500).json({
      success: false,
      error: 'Error interno del servidor',
      timestamp: new Date().toISOString()
    });
  }
});

// SSE endpoint para fallback
app.get('/api/v1/realtime/sse', (req, res) => {
  if (realtimeService.fallbackService) {
    realtimeService.fallbackService.handleSSEConnection(req, res);
  } else {
    res.status(503).json({
      error: 'Servicio de fallback no disponible',
      timestamp: new Date().toISOString()
    });
  }
});

// Polling endpoint para fallback
app.post('/api/v1/realtime/poll', (req, res) => {
  try {
    const { userId, clientId, interval } = req.body;

    if (!userId || !clientId) {
      return res.status(400).json({
        error: 'userId y clientId son requeridos',
        timestamp: new Date().toISOString()
      });
    }

    if (realtimeService.fallbackService) {
      const pollingKey = realtimeService.fallbackService.registerPollingClient({
        userId,
        clientId,
        interval
      });

      res.status(200).json({
        success: true,
        pollingKey,
        message: 'Cliente registrado para polling',
        timestamp: new Date().toISOString()
      });
    } else {
      res.status(503).json({
        error: 'Servicio de fallback no disponible',
        timestamp: new Date().toISOString()
      });
    }
  } catch (error) {
    console.error('Error registrando cliente para polling:', error);
    res.status(500).json({
      success: false,
      error: 'Error interno del servidor',
      timestamp: new Date().toISOString()
    });
  }
});

// Eliminar cliente de polling
app.delete('/api/v1/realtime/poll/:userId/:clientId', (req, res) => {
  try {
    const { userId, clientId } = req.params;

    if (realtimeService.fallbackService) {
      realtimeService.fallbackService.unregisterPollingClient(userId, clientId);

      res.status(200).json({
        success: true,
        message: 'Cliente eliminado de polling',
        timestamp: new Date().toISOString()
      });
    } else {
      res.status(503).json({
        error: 'Servicio de fallback no disponible',
        timestamp: new Date().toISOString()
      });
    }
  } catch (error) {
    console.error('Error eliminando cliente de polling:', error);
    res.status(500).json({
      success: false,
      error: 'Error interno del servidor',
      timestamp: new Date().toISOString()
    });
  }
});

// Servir imágenes desde /images
app.use('/images', express.static(path.join(__dirname, '../uploads/images')));

// API Routes v1
app.use('/api/v1', v1Routes);

// Rutas de upload
app.use('/api/v1/upload', uploadRoutes);

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
  console.log(`[${new Date().toISOString()}] 🔄 Iniciando servidor... PID: ${process.pid}`);
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
      console.log(`[${new Date().toISOString()}] 🚀 Quiklii API Server iniciado exitosamente! PID: ${process.pid}`);
      console.log(`
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
  • POST /api/v1/upload/restaurant-image → Cargar imagen de restaurante
  • POST /api/v1/upload/product-image    → Cargar imagen de producto

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
  console.log(`[${new Date().toISOString()}] 🛑 SIGTERM recibido, cerrando servidor graciosamente... PID: ${process.pid}`);
  server.close(() => {
    console.log(`[${new Date().toISOString()}] 📴 Servidor cerrado por SIGTERM`);
    process.exit(0);
  });
});

process.on('SIGINT', () => {
  console.log(`[${new Date().toISOString()}] 🛑 SIGINT recibido, cerrando servidor graciosamente... PID: ${process.pid}`);
  server.close(() => {
    console.log(`[${new Date().toISOString()}] 📴 Servidor cerrado por SIGINT`);
    process.exit(0);
  });
});

// Iniciar servidor
startServer();

module.exports = app;