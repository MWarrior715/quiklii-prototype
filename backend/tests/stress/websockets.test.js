import { io as Client } from 'socket.io-client';
import { performance } from 'perf_hooks';

/**
 * Pruebas de estrés para el sistema de WebSockets
 * Simula múltiples conexiones concurrentes y eventos masivos
 */

class WebSocketStressTester {
  constructor(serverUrl = 'http://localhost:3000') {
    this.serverUrl = serverUrl;
    this.results = {
      totalConnections: 0,
      successfulConnections: 0,
      failedConnections: 0,
      totalEvents: 0,
      successfulEvents: 0,
      failedEvents: 0,
      connectionTimes: [],
      eventResponseTimes: [],
      errors: []
    };
    this.clients = [];
  }

  /**
   * Crear cliente WebSocket autenticado
   */
  async createAuthenticatedClient(token) {
    return new Promise((resolve, reject) => {
      const startTime = performance.now();

      const client = new Client(this.serverUrl, {
        auth: { token },
        transports: ['websocket'],
        timeout: 10000
      });

      client.on('connect', () => {
        const connectionTime = performance.now() - startTime;
        this.results.totalConnections++;
        this.results.successfulConnections++;
        this.results.connectionTimes.push(connectionTime);

        resolve(client);
      });

      client.on('connect_error', (error) => {
        const connectionTime = performance.now() - startTime;
        this.results.totalConnections++;
        this.results.failedConnections++;
        this.results.errors.push({
          type: 'connection_error',
          error: error.message,
          connectionTime
        });
        reject(error);
      });

      client.on('error', (error) => {
        this.results.errors.push({
          type: 'client_error',
          error: error.message
        });
      });
    });
  }

  /**
   * Obtener token de autenticación
   */
  async getAuthToken() {
    try {
      const http = await import('http');

      const postData = JSON.stringify({
        email: 'juan.perez@example.com',
        password: 'password123'
      });

      const options = {
        hostname: 'localhost',
        port: 3000,
        path: '/api/v1/auth/login',
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Content-Length': Buffer.byteLength(postData)
        }
      };

      return new Promise((resolve, reject) => {
        const req = http.request(options, (res) => {
          let data = '';
          res.on('data', (chunk) => data += chunk);
          res.on('end', () => {
            try {
              const response = JSON.parse(data);
              if (response.data?.token) {
                resolve(response.data.token);
              } else {
                reject(new Error('No se pudo obtener token de autenticación'));
              }
            } catch (error) {
              reject(new Error('Error parseando respuesta de login'));
            }
          });
        });

        req.on('error', reject);
        req.write(postData);
        req.end();
      });
    } catch (error) {
      console.error('Error obteniendo token de autenticación:', error.message);
      throw error;
    }
  }

  /**
   * Ejecutar prueba de estrés de conexiones
   */
  async stressTestConnections(concurrentConnections = 50) {
    console.log(`🔗 Iniciando prueba de estrés de conexiones: ${concurrentConnections} conexiones concurrentes`);

    const startTime = performance.now();
    const promises = [];

    for (let i = 0; i < concurrentConnections; i++) {
      promises.push(this.simulateConnection(i));
    }

    try {
      await Promise.all(promises);
    } catch (error) {
      console.error('Error durante prueba de conexiones:', error.message);
    }

    const totalTime = performance.now() - startTime;
    return this.generateConnectionReport('Connection Stress Test', totalTime);
  }

  /**
   * Simular una conexión individual
   */
  async simulateConnection(connectionId) {
    try {
      const token = await this.getAuthToken();
      const client = await this.createAuthenticatedClient(token);

      this.clients.push(client);

      console.log(`✅ Conexión ${connectionId} establecida`);

      // Mantener conexión activa por un tiempo
      await this.sleep(2000 + Math.random() * 3000);

      // Desconectar
      client.disconnect();
      console.log(`🔌 Conexión ${connectionId} cerrada`);

    } catch (error) {
      console.error(`❌ Conexión ${connectionId} falló:`, error.message);
    }
  }

  /**
   * Ejecutar prueba de estrés de eventos
   */
  async stressTestEvents(concurrentClients = 20, eventsPerClient = 50) {
    console.log(`📨 Iniciando prueba de estrés de eventos: ${concurrentClients} clientes, ${eventsPerClient} eventos por cliente`);

    const startTime = performance.now();
    const promises = [];

    for (let i = 0; i < concurrentClients; i++) {
      promises.push(this.simulateClientEvents(i, eventsPerClient));
    }

    try {
      await Promise.all(promises);
    } catch (error) {
      console.error('Error durante prueba de eventos:', error.message);
    }

    const totalTime = performance.now() - startTime;
    return this.generateEventReport('Event Stress Test', totalTime);
  }

  /**
   * Simular eventos de un cliente
   */
  async simulateClientEvents(clientId, eventCount) {
    try {
      const token = await this.getAuthToken();
      const client = await this.createAuthenticatedClient(token);

      this.clients.push(client);

      // Unirse a múltiples rooms
      const rooms = [
        `user_room_${clientId}`,
        `test_room_${clientId}`,
        `order_room_test_${clientId}`
      ];

      for (const room of rooms) {
        client.emit('join_room', {
          roomName: room,
          roomType: 'test'
        });
      }

      // Enviar eventos masivos
      for (let i = 0; i < eventCount; i++) {
        try {
          const eventStartTime = performance.now();

          // Enviar diferentes tipos de eventos
          const eventType = this.getRandomEventType();
          const eventData = this.generateEventData(eventType, clientId, i);

          client.emit(eventType, eventData);

          // Simular respuesta del servidor
          client.once(eventType + '_ack', () => {
            const responseTime = performance.now() - eventStartTime;
            this.results.totalEvents++;
            this.results.successfulEvents++;
            this.results.eventResponseTimes.push(responseTime);
          });

          // Timeout para eventos sin respuesta
          setTimeout(() => {
            if (!this.results.eventResponseTimes.includes(performance.now() - eventStartTime)) {
              this.results.totalEvents++;
              this.results.failedEvents++;
            }
          }, 1000);

          console.log(`📨 Cliente ${clientId} - Evento ${i + 1}/${eventCount} enviado`);

          // Pausa entre eventos
          await this.sleep(Math.random() * 200 + 50);

        } catch (error) {
          this.results.totalEvents++;
          this.results.failedEvents++;
          console.error(`❌ Cliente ${clientId} - Evento ${i + 1} falló:`, error.message);
        }
      }

      // Mantener conexión activa
      await this.sleep(1000);

      // Desconectar
      client.disconnect();

    } catch (error) {
      console.error(`❌ Cliente ${clientId} falló completamente:`, error.message);
    }
  }

  /**
   * Obtener tipo de evento aleatorio
   */
  getRandomEventType() {
    const eventTypes = [
      'update_location',
      'send_message',
      'order_status_updated',
      'payment_status_updated',
      'user_typing',
      'heartbeat'
    ];
    return eventTypes[Math.floor(Math.random() * eventTypes.length)];
  }

  /**
   * Generar datos de evento según el tipo
   */
  generateEventData(eventType, clientId, eventIndex) {
    const baseData = {
      clientId,
      timestamp: new Date().toISOString(),
      eventIndex
    };

    switch (eventType) {
      case 'update_location':
        return {
          ...baseData,
          orderId: `stress_order_${clientId}_${eventIndex}`,
          location: `Ubicación de prueba ${clientId}-${eventIndex}`,
          coordinates: {
            latitude: 4.7110 + (Math.random() - 0.5) * 0.01,
            longitude: -74.0721 + (Math.random() - 0.5) * 0.01
          }
        };

      case 'send_message':
        return {
          ...baseData,
          orderId: `stress_order_${clientId}_${eventIndex}`,
          message: `Mensaje de estrés ${clientId}-${eventIndex}`,
          type: 'text'
        };

      case 'order_status_updated':
        return {
          ...baseData,
          orderId: `stress_order_${clientId}_${eventIndex}`,
          status: ['confirmed', 'preparing', 'ready', 'picked_up'][Math.floor(Math.random() * 4)],
          estimatedTime: Math.floor(Math.random() * 60) + 10
        };

      case 'payment_status_updated':
        return {
          ...baseData,
          paymentId: `stress_payment_${clientId}_${eventIndex}`,
          status: ['processing', 'completed', 'failed'][Math.floor(Math.random() * 3)],
          amount: Math.floor(Math.random() * 50000) + 10000
        };

      case 'user_typing':
        return {
          ...baseData,
          orderId: `stress_order_${clientId}_${eventIndex}`,
          isTyping: Math.random() > 0.5
        };

      case 'heartbeat':
        return {
          ...baseData,
          uptime: Math.floor(Math.random() * 3600),
          memory: Math.floor(Math.random() * 100) + 50
        };

      default:
        return baseData;
    }
  }

  /**
   * Ejecutar prueba de estrés de rooms
   */
  async stressTestRooms(concurrentClients = 30, roomsPerClient = 5) {
    console.log(`🏠 Iniciando prueba de estrés de rooms: ${concurrentClients} clientes, ${roomsPerClient} rooms por cliente`);

    const startTime = performance.now();
    const promises = [];

    for (let i = 0; i < concurrentClients; i++) {
      promises.push(this.simulateRoomOperations(i, roomsPerClient));
    }

    try {
      await Promise.all(promises);
    } catch (error) {
      console.error('Error durante prueba de rooms:', error.message);
    }

    const totalTime = performance.now() - startTime;
    return this.generateRoomReport('Room Stress Test', totalTime);
  }

  /**
   * Simular operaciones de rooms
   */
  async simulateRoomOperations(clientId, roomCount) {
    try {
      const token = await this.getAuthToken();
      const client = await this.createAuthenticatedClient(token);

      this.clients.push(client);

      // Crear y unirse a múltiples rooms
      for (let i = 0; i < roomCount; i++) {
        const roomName = `stress_room_${clientId}_${i}`;

        client.emit('join_room', {
          roomName,
          roomType: 'stress_test'
        });

        console.log(`🏠 Cliente ${clientId} - Unido a room ${roomName}`);

        // Pequeña pausa entre joins
        await this.sleep(Math.random() * 100 + 50);
      }

      // Mantener actividad en rooms
      await this.sleep(2000);

      // Salir de rooms
      for (let i = 0; i < roomCount; i++) {
        const roomName = `stress_room_${clientId}_${i}`;

        client.emit('leave_room', {
          roomName
        });
      }

      // Desconectar
      client.disconnect();

    } catch (error) {
      console.error(`❌ Cliente ${clientId} falló en operaciones de rooms:`, error.message);
    }
  }

  /**
   * Ejecutar prueba de reconexión
   */
  async stressTestReconnection(concurrentClients = 15, reconnectionsPerClient = 3) {
    console.log(`🔄 Iniciando prueba de estrés de reconexión: ${concurrentClients} clientes, ${reconnectionsPerClient} reconexiones por cliente`);

    const startTime = performance.now();
    const promises = [];

    for (let i = 0; i < concurrentClients; i++) {
      promises.push(this.simulateReconnectionCycle(i, reconnectionsPerClient));
    }

    try {
      await Promise.all(promises);
    } catch (error) {
      console.error('Error durante prueba de reconexión:', error.message);
    }

    const totalTime = performance.now() - startTime;
    return this.generateReconnectionReport('Reconnection Stress Test', totalTime);
  }

  /**
   * Simular ciclo de reconexión
   */
  async simulateReconnectionCycle(clientId, reconnectionCount) {
    try {
      const token = await this.getAuthToken();

      for (let i = 0; i < reconnectionCount; i++) {
        const client = await this.createAuthenticatedClient(token);

        this.clients.push(client);

        console.log(`🔄 Cliente ${clientId} - Reconexión ${i + 1}/${reconnectionCount}`);

        // Mantener conexión por tiempo aleatorio
        await this.sleep(Math.random() * 2000 + 1000);

        // Desconectar y reconectar inmediatamente
        client.disconnect();

        // Pequeña pausa antes de reconectar
        await this.sleep(Math.random() * 500 + 200);
      }

    } catch (error) {
      console.error(`❌ Cliente ${clientId} falló en ciclo de reconexión:`, error.message);
    }
  }

  /**
   * Generar reporte de conexiones
   */
  generateConnectionReport(testName, totalTime) {
    const avgConnectionTime = this.results.connectionTimes.reduce((a, b) => a + b, 0) / this.results.connectionTimes.length;

    return {
      testName,
      timestamp: new Date().toISOString(),
      duration: totalTime,
      summary: {
        totalConnections: this.results.totalConnections,
        successfulConnections: this.results.successfulConnections,
        failedConnections: this.results.failedConnections,
        successRate: ((this.results.successfulConnections / this.results.totalConnections) * 100).toFixed(2) + '%'
      },
      performance: {
        averageConnectionTime: Math.round(avgConnectionTime * 100) / 100 + 'ms',
        minConnectionTime: Math.min(...this.results.connectionTimes) + 'ms',
        maxConnectionTime: Math.max(...this.results.connectionTimes) + 'ms',
        connectionsPerSecond: Math.round((this.results.totalConnections / totalTime) * 1000 * 100) / 100
      },
      errors: this.results.errors.slice(0, 10)
    };
  }

  /**
   * Generar reporte de eventos
   */
  generateEventReport(testName, totalTime) {
    const avgEventResponseTime = this.results.eventResponseTimes.length > 0 ?
      this.results.eventResponseTimes.reduce((a, b) => a + b, 0) / this.results.eventResponseTimes.length : 0;

    return {
      testName,
      timestamp: new Date().toISOString(),
      duration: totalTime,
      summary: {
        totalEvents: this.results.totalEvents,
        successfulEvents: this.results.successfulEvents,
        failedEvents: this.results.failedEvents,
        successRate: this.results.totalEvents > 0 ? ((this.results.successfulEvents / this.results.totalEvents) * 100).toFixed(2) + '%' : '0%'
      },
      performance: {
        averageEventResponseTime: this.results.eventResponseTimes.length > 0 ? Math.round(avgEventResponseTime * 100) / 100 + 'ms' : 'N/A',
        eventsPerSecond: Math.round((this.results.totalEvents / totalTime) * 1000 * 100) / 100
      },
      errors: this.results.errors.slice(0, 10)
    };
  }

  /**
   * Generar reporte de rooms
   */
  generateRoomReport(testName, totalTime) {
    return {
      testName,
      timestamp: new Date().toISOString(),
      duration: totalTime,
      summary: {
        totalConnections: this.results.totalConnections,
        successfulConnections: this.results.successfulConnections,
        failedConnections: this.results.failedConnections,
        successRate: ((this.results.successfulConnections / this.results.totalConnections) * 100).toFixed(2) + '%'
      },
      performance: {
        averageConnectionTime: Math.round(this.results.connectionTimes.reduce((a, b) => a + b, 0) / this.results.connectionTimes.length * 100) / 100 + 'ms',
        connectionsPerSecond: Math.round((this.results.totalConnections / totalTime) * 1000 * 100) / 100
      },
      errors: this.results.errors.slice(0, 10)
    };
  }

  /**
   * Generar reporte de reconexión
   */
  generateReconnectionReport(testName, totalTime) {
    return {
      testName,
      timestamp: new Date().toISOString(),
      duration: totalTime,
      summary: {
        totalConnections: this.results.totalConnections,
        successfulConnections: this.results.successfulConnections,
        failedConnections: this.results.failedConnections,
        successRate: ((this.results.successfulConnections / this.results.totalConnections) * 100).toFixed(2) + '%'
      },
      performance: {
        averageConnectionTime: Math.round(this.results.connectionTimes.reduce((a, b) => a + b, 0) / this.results.connectionTimes.length * 100) / 100 + 'ms',
        connectionsPerSecond: Math.round((this.results.totalConnections / totalTime) * 1000 * 100) / 100
      },
      errors: this.results.errors.slice(0, 10)
    };
  }

  /**
   * Limpiar todos los clientes
   */
  cleanup() {
    this.clients.forEach(client => {
      if (client.connected) {
        client.disconnect();
      }
    });
    this.clients = [];
  }

  /**
   * Utilidad para pausas
   */
  sleep(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
  }
}

/**
 * Función principal para ejecutar todas las pruebas de WebSocket
 */
async function runAllWebSocketStressTests() {
  const tester = new WebSocketStressTester();

  try {
    console.log('🚀 Iniciando suite completa de pruebas de estrés para WebSockets...\n');

    // Prueba 1: Conexiones masivas
    const connectionReport = await tester.stressTestConnections(30);

    // Reset para nueva prueba
    tester.results = {
      totalConnections: 0,
      successfulConnections: 0,
      failedConnections: 0,
      totalEvents: 0,
      successfulEvents: 0,
      failedEvents: 0,
      connectionTimes: [],
      eventResponseTimes: [],
      errors: []
    };

    // Prueba 2: Eventos masivos
    const eventReport = await tester.stressTestEvents(15, 30);

    // Reset para nueva prueba
    tester.results = {
      totalConnections: 0,
      successfulConnections: 0,
      failedConnections: 0,
      totalEvents: 0,
      successfulEvents: 0,
      failedEvents: 0,
      connectionTimes: [],
      eventResponseTimes: [],
      errors: []
    };

    // Prueba 3: Operaciones de rooms
    const roomReport = await tester.stressTestRooms(20, 4);

    // Prueba 4: Reconexiones
    const reconnectionReport = await tester.stressTestReconnection(10, 3);

    // Reporte consolidado
    const consolidatedReport = {
      timestamp: new Date().toISOString(),
      tests: {
        connections: connectionReport,
        events: eventReport,
        rooms: roomReport,
        reconnections: reconnectionReport
      },
      overall: {
        totalConnections: connectionReport.summary.totalConnections + roomReport.summary.totalConnections + reconnectionReport.summary.totalConnections,
        totalSuccessful: connectionReport.summary.successfulConnections + roomReport.summary.successfulConnections + reconnectionReport.summary.successfulConnections,
        totalFailed: connectionReport.summary.failedConnections + roomReport.summary.failedConnections + reconnectionReport.summary.failedConnections,
        totalEvents: eventReport.summary.totalEvents,
        totalSuccessfulEvents: eventReport.summary.successfulEvents,
        totalFailedEvents: eventReport.summary.failedEvents,
        overallConnectionSuccessRate: (((connectionReport.summary.successfulConnections + roomReport.summary.successfulConnections + reconnectionReport.summary.successfulConnections) /
          (connectionReport.summary.totalConnections + roomReport.summary.totalConnections + reconnectionReport.summary.totalConnections)) * 100).toFixed(2) + '%',
        overallEventSuccessRate: eventReport.summary.totalEvents > 0 ? ((eventReport.summary.successfulEvents / eventReport.summary.totalEvents) * 100).toFixed(2) + '%' : '0%'
      }
    };

    console.log('\n🏆 REPORTE CONSOLIDADO DE WEBSOCKETS');
    console.log('='.repeat(70));
    console.log(`🔗 Tests ejecutados: 4`);
    console.log(`📊 Conexiones totales: ${consolidatedReport.overall.totalConnections}`);
    console.log(`✅ Conexiones exitosas: ${consolidatedReport.overall.totalSuccessful}`);
    console.log(`❌ Conexiones fallidas: ${consolidatedReport.overall.totalFailed}`);
    console.log(`📨 Eventos totales: ${consolidatedReport.overall.totalEvents}`);
    console.log(`✅ Eventos exitosos: ${consolidatedReport.overall.totalSuccessfulEvents}`);
    console.log(`🎯 Tasa de éxito conexiones: ${consolidatedReport.overall.overallConnectionSuccessRate}`);
    console.log(`🎯 Tasa de éxito eventos: ${consolidatedReport.overall.overallEventSuccessRate}`);
    console.log('='.repeat(70));

    return consolidatedReport;

  } catch (error) {
    console.error('❌ Error ejecutando pruebas de estrés de WebSockets:', error);
    throw error;
  } finally {
    tester.cleanup();
  }
}

/**
 * Ejecutar si es llamado directamente
 */
if (import.meta.url === `file://${process.argv[1]}`) {
  runAllWebSocketStressTests()
    .then((report) => {
      console.log('✅ Pruebas de estrés de WebSockets completadas');
      process.exit(0);
    })
    .catch((error) => {
      console.error('❌ Error en pruebas de estrés de WebSockets:', error);
      process.exit(1);
    });
}

export default WebSocketStressTester;
export { runAllWebSocketStressTests };