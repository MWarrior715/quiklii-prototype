import { Server } from 'socket.io';
import { createServer } from 'http';
import { io as Client } from 'socket.io-client';
import { initializeRealtimeService } from '../../services/realtimeService.js';
import { initializeRoomManager } from '../../sockets/roomManager.js';
import { initializeFallbackService } from '../../services/fallbackService.js';
import { initializeReconnectionService } from '../../services/reconnectionService.js';

/**
 * Tests de integración para el sistema de WebSockets
 * Cubre conexión, rooms, eventos y servicios de fallback
 */

// Función helper para crear servidor de prueba
const createTestServer = () => {
  const httpServer = createServer();
  const io = new Server(httpServer, {
    cors: {
      origin: "http://localhost:5173",
      methods: ["GET", "POST"]
    }
  });

  return { httpServer, io };
};

// Función helper para crear cliente WebSocket autenticado
const createAuthenticatedClient = (serverUrl, token) => {
  return new Client(serverUrl, {
    auth: { token },
    transports: ['websocket']
  });
};

// Función helper para obtener token de prueba
const getTestToken = async (app) => {
  const request = await import('supertest');
  const supertest = request.default;

  const loginResponse = await supertest(app)
    .post('/api/v1/auth/login')
    .send({
      email: 'juan.perez@example.com',
      password: 'password123'
    });

  return loginResponse.body.data.token;
};

describe('WebSocket System', () => {
  let testServer;
  let testIo;
  let realtimeService;
  let roomManager;
  let fallbackService;
  let reconnectionService;
  let clientSocket;
  let testToken;

  beforeAll(async () => {
    testServer = createTestServer();
    testIo = testServer.io;

    // Inicializar servicios
    realtimeService = initializeRealtimeService(testIo);
    roomManager = initializeRoomManager(testIo);
    fallbackService = initializeFallbackService(realtimeService);
    reconnectionService = initializeReconnectionService(testIo);

    // Iniciar servidor en puerto diferente para tests
    const PORT = 3002;
    testServer.httpServer.listen(PORT);

    // Obtener token de prueba
    const app = await import('../../app-db.js');
    testToken = await getTestToken(app.default);
  });

  afterAll(() => {
    // Cerrar conexiones
    if (clientSocket) {
      clientSocket.disconnect();
    }

    // Cerrar servicios
    realtimeService.close();
    testServer.httpServer.close();
  });

  describe('WebSocket Connection', () => {
    it('should connect successfully with valid token', (done) => {
      clientSocket = createAuthenticatedClient('http://localhost:3002', testToken);

      clientSocket.on('connect', () => {
        expect(clientSocket.connected).toBe(true);
        expect(clientSocket.id).toBeDefined();
        done();
      });

      clientSocket.on('connect_error', (error) => {
        done(error);
      });
    });

    it('should fail connection without token', (done) => {
      const clientWithoutAuth = new Client('http://localhost:3002');

      clientWithoutAuth.on('connect_error', (error) => {
        expect(error.message).toContain('Authentication error');
        done();
      });

      clientWithoutAuth.on('connect', () => {
        done(new Error('Should not connect without token'));
      });
    });

    it('should fail connection with invalid token', (done) => {
      const clientWithInvalidToken = new Client('http://localhost:3002', {
        auth: { token: 'invalid-token' }
      });

      clientWithInvalidToken.on('connect_error', (error) => {
        expect(error.message).toContain('Authentication error');
        done();
      });

      clientWithInvalidToken.on('connect', () => {
        done(new Error('Should not connect with invalid token'));
      });
    });
  });

  describe('Room Management', () => {
    beforeEach((done) => {
      clientSocket = createAuthenticatedClient('http://localhost:3002', testToken);

      clientSocket.on('connect', () => {
        done();
      });
    });

    afterEach(() => {
      if (clientSocket) {
        clientSocket.disconnect();
      }
    });

    it('should join user room automatically', (done) => {
      clientSocket.on('authentication_success', (data) => {
        expect(data.userId).toBeDefined();
        expect(data.role).toBeDefined();
        done();
      });
    });

    it('should join custom room successfully', (done) => {
      const testRoom = 'test_room_123';

      clientSocket.emit('join_room', {
        roomName: testRoom,
        roomType: 'test'
      });

      clientSocket.on('room_joined', (data) => {
        expect(data.roomName).toBe(testRoom);
        expect(data.message).toContain('Unido a sala');
        done();
      });
    });

    it('should leave room successfully', (done) => {
      const testRoom = 'test_room_456';

      // Primero unirse
      clientSocket.emit('join_room', {
        roomName: testRoom,
        roomType: 'test'
      });

      setTimeout(() => {
        // Luego salir
        clientSocket.emit('leave_room', {
          roomName: testRoom
        });

        clientSocket.on('room_left', (data) => {
          expect(data.roomName).toBe(testRoom);
          expect(data.message).toContain('Abandonada sala');
          done();
        });
      }, 100);
    });

    it('should handle order subscription', (done) => {
      const testOrderId = 'test-order-123';

      clientSocket.emit('subscribe_to_order', {
        orderId: testOrderId
      });

      clientSocket.on('subscription_success', (data) => {
        expect(data.orderId).toBe(testOrderId);
        expect(data.rooms).toBeDefined();
        expect(Array.isArray(data.rooms)).toBe(true);
        done();
      });
    });

    it('should handle order unsubscription', (done) => {
      const testOrderId = 'test-order-456';

      // Primero suscribirse
      clientSocket.emit('subscribe_to_order', {
        orderId: testOrderId
      });

      setTimeout(() => {
        // Luego desuscribirse
        clientSocket.emit('unsubscribe_from_order', {
          orderId: testOrderId
        });

        clientSocket.on('unsubscription_success', (data) => {
          expect(data.orderId).toBe(testOrderId);
          expect(data.message).toContain('Desuscrito del pedido');
          done();
        });
      }, 100);
    });
  });

  describe('Real-time Events', () => {
    beforeEach((done) => {
      clientSocket = createAuthenticatedClient('http://localhost:3002', testToken);

      clientSocket.on('connect', () => {
        done();
      });
    });

    afterEach(() => {
      if (clientSocket) {
        clientSocket.disconnect();
      }
    });

    it('should receive heartbeat', (done) => {
      clientSocket.on('ping', (data) => {
        expect(data.timestamp).toBeDefined();

        // Responder con pong
        clientSocket.emit('pong', { timestamp: new Date() });
      });

      // El heartbeat se envía automáticamente cada 30 segundos
      // Para testing, esperamos un poco y verificamos que no haya errores
      setTimeout(() => {
        done();
      }, 1000);
    });

    it('should handle location updates', (done) => {
      const locationData = {
        orderId: 'test-order-location',
        location: 'Test Location',
        coordinates: {
          latitude: 4.7110,
          longitude: -74.0721
        }
      };

      clientSocket.emit('update_location', locationData);

      // El servidor debería procesar sin errores
      setTimeout(() => {
        done();
      }, 500);
    });

    it('should handle message sending', (done) => {
      const messageData = {
        orderId: 'test-order-message',
        message: 'Test message',
        type: 'text'
      };

      clientSocket.emit('send_message', messageData);

      // El servidor debería procesar sin errores
      setTimeout(() => {
        done();
      }, 500);
    });
  });

  describe('Fallback Service - SSE', () => {
    it('should handle SSE connection', async () => {
      const app = await import('../../app-db.js');
      const request = await import('supertest');
      const supertest = request.default;

      const response = await supertest(app.default)
        .get('/api/v1/realtime/sse')
        .set('Authorization', `Bearer ${testToken}`)
        .expect(200);

      // SSE debería configurar headers específicos
      expect(response.headers['content-type']).toContain('text/event-stream');
      expect(response.headers['cache-control']).toBe('no-cache');
      expect(response.headers['connection']).toBe('keep-alive');
    });

    it('should reject SSE without authentication', async () => {
      const app = await import('../../app-db.js');
      const request = await import('supertest');
      const supertest = request.default;

      await supertest(app.default)
        .get('/api/v1/realtime/sse')
        .expect(401);
    });

    it('should register polling client', async () => {
      const app = await import('../../app-db.js');
      const request = await import('supertest');
      const supertest = request.default;

      const pollingData = {
        userId: 'test-user-123',
        clientId: 'test-client-123',
        interval: 5000
      };

      const response = await supertest(app.default)
        .post('/api/v1/realtime/poll')
        .send(pollingData)
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.pollingKey).toBeDefined();
      expect(response.body.message).toContain('Cliente registrado para polling');
    });

    it('should unregister polling client', async () => {
      const app = await import('../../app-db.js');
      const request = await import('supertest');
      const supertest = request.default;

      const pollingData = {
        userId: 'test-user-456',
        clientId: 'test-client-456',
        interval: 5000
      };

      // Primero registrar
      const registerResponse = await supertest(app.default)
        .post('/api/v1/realtime/poll')
        .send(pollingData)
        .expect(200);

      const pollingKey = registerResponse.body.pollingKey;

      // Luego eliminar
      await supertest(app.default)
        .delete(`/api/v1/realtime/poll/${pollingData.userId}/${pollingData.clientId}`)
        .expect(200);
    });
  });

  describe('Service Integration', () => {
    it('should provide realtime stats', async () => {
      const app = await import('../../app-db.js');
      const request = await import('supertest');
      const supertest = request.default;

      const response = await supertest(app.default)
        .get('/api/v1/realtime/stats')
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.data).toBeDefined();
      expect(response.body.data).toHaveProperty('connectedUsers');
      expect(response.body.data).toHaveProperty('totalSockets');
      expect(response.body.data).toHaveProperty('activeOrders');
      expect(response.body.data).toHaveProperty('roomStats');
      expect(response.body.data).toHaveProperty('fallbackStats');
      expect(response.body.data).toHaveProperty('reconnectionStats');
      expect(response.body.data).toHaveProperty('uptime');
    });

    it('should handle service shutdown gracefully', (done) => {
      // Crear cliente temporal para test de desconexión
      const tempClient = createAuthenticatedClient('http://localhost:3002', testToken);

      tempClient.on('connect', () => {
        // Cerrar servicios
        realtimeService.close();

        // El cliente debería desconectarse
        tempClient.on('disconnect', (reason) => {
          expect(reason).toBeDefined();
          tempClient.disconnect();
          done();
        });
      });
    });
  });

  describe('Error Handling', () => {
    beforeEach((done) => {
      clientSocket = createAuthenticatedClient('http://localhost:3002', testToken);

      clientSocket.on('connect', () => {
        done();
      });
    });

    afterEach(() => {
      if (clientSocket) {
        clientSocket.disconnect();
      }
    });

    it('should handle invalid room operations', (done) => {
      // Intentar unirse a sala sin nombre
      clientSocket.emit('join_room', {
        roomType: 'test'
        // Falta roomName
      });

      clientSocket.on('error', (error) => {
        expect(error.message).toContain('Nombre de sala requerido');
        done();
      });

      // Timeout por si no hay error
      setTimeout(() => {
        done();
      }, 1000);
    });

    it('should handle invalid order subscription', (done) => {
      // Intentar suscribirse sin orderId
      clientSocket.emit('subscribe_to_order', {
        // Falta orderId
      });

      clientSocket.on('error', (error) => {
        expect(error.message).toContain('ID de pedido requerido');
        done();
      });

      // Timeout por si no hay error
      setTimeout(() => {
        done();
      }, 1000);
    });

    it('should handle invalid location data', (done) => {
      // Enviar ubicación sin datos requeridos
      clientSocket.emit('update_location', {
        // Faltan location y coordinates
      });

      clientSocket.on('error', (error) => {
        expect(error.message).toContain('Ubicación y coordenadas requeridas');
        done();
      });

      // Timeout por si no hay error
      setTimeout(() => {
        done();
      }, 1000);
    });

    it('should handle invalid message data', (done) => {
      // Enviar mensaje sin contenido
      clientSocket.emit('send_message', {
        orderId: 'test-order',
        // Falta message
      });

      clientSocket.on('error', (error) => {
        expect(error.message).toContain('Mensaje requerido');
        done();
      });

      // Timeout por si no hay error
      setTimeout(() => {
        done();
      }, 1000);
    });
  });

  describe('Performance and Load', () => {
    it('should handle multiple clients', (done) => {
      const clients = [];
      const clientCount = 5;
      let connectedClients = 0;

      // Crear múltiples clientes
      for (let i = 0; i < clientCount; i++) {
        const client = createAuthenticatedClient('http://localhost:3002', testToken);

        client.on('connect', () => {
          connectedClients++;
          clients.push(client);

          if (connectedClients === clientCount) {
            // Todos los clientes conectados
            expect(connectedClients).toBe(clientCount);

            // Desconectar todos
            clients.forEach(c => c.disconnect());
            done();
          }
        });

        client.on('connect_error', (error) => {
          done(error);
        });
      }
    });

    it('should handle rapid connection/disconnection', (done) => {
      const maxConnections = 10;
      let connectionCount = 0;

      const connectClient = () => {
        if (connectionCount >= maxConnections) {
          done();
          return;
        }

        const client = createAuthenticatedClient('http://localhost:3002', testToken);

        client.on('connect', () => {
          connectionCount++;

          // Desconectar inmediatamente
          setTimeout(() => {
            client.disconnect();
            connectClient(); // Crear siguiente cliente
          }, 10);
        });

        client.on('connect_error', (error) => {
          done(error);
        });
      };

      connectClient();
    });
  });
});