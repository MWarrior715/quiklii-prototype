import jwt from 'jsonwebtoken';
import { RealtimeService } from './realtimeService.js';
import { FALLBACK_EVENTS, RECONNECTION_CONFIG } from '../utils/constants.js';

/**
 * Servicio de fallback para comunicaciones en tiempo real
 * Implementa SSE (Server-Sent Events) y Polling como alternativas a WebSockets
 */
export class FallbackService {
  constructor(realtimeService) {
    this.realtimeService = realtimeService;
    this.sseClients = new Map(); // Conexiones SSE activas
    this.pollingClients = new Map(); // Clientes en polling
    this.fallbackIntervals = new Map(); // Intervalos de polling

    this.initializeFallbackHandlers();
  }

  /**
   * Inicializa manejadores para integración con el servicio de tiempo real
   */
  initializeFallbackHandlers() {
    // Escuchar eventos del servicio de tiempo real para retransmitir vía fallback
    this.setupRealtimeEventForwarding();
  }

  /**
   * Configura el reenvío de eventos desde tiempo real hacia métodos de fallback
   */
  setupRealtimeEventForwarding() {
    // Esta configuración se hará cuando se inicialice el servicio
    // Los eventos se reenviarán automáticamente a clientes fallback
  }

  // ========== SERVER-SENT EVENTS (SSE) ==========

  /**
   * Maneja conexión SSE
   */
  handleSSEConnection(req, res) {
    try {
      const token = req.headers.authorization?.split(' ')[1] || req.query.token;

      if (!token) {
        return res.status(401).json({ error: 'Token requerido' });
      }

      // Verificar token
      const decoded = jwt.verify(token, process.env.JWT_SECRET);
      const userId = decoded.id;

      // Configurar headers SSE
      res.writeHead(200, {
        'Content-Type': 'text/event-stream',
        'Cache-Control': 'no-cache',
        'Connection': 'keep-alive',
        'Access-Control-Allow-Origin': process.env.FRONTEND_URL || "http://localhost:5173",
        'Access-Control-Allow-Headers': 'Cache-Control',
        'Access-Control-Allow-Credentials': 'true'
      });

      // Agregar cliente SSE
      const clientId = `${userId}_${Date.now()}`;
      this.sseClients.set(clientId, {
        id: clientId,
        userId,
        res,
        connectedAt: new Date(),
        lastHeartbeat: new Date()
      });

      console.log(`📡 Nueva conexión SSE: ${clientId} (Usuario: ${userId})`);

      // Enviar evento de conexión
      this.sendSSEEvent(res, 'connected', {
        message: 'Conexión SSE establecida',
        clientId,
        timestamp: new Date()
      });

      // Configurar heartbeat SSE
      const heartbeatInterval = setInterval(() => {
        this.sendSSEEvent(res, 'heartbeat', {
          timestamp: new Date(),
          message: 'Heartbeat SSE'
        });
      }, 30000);

      // Manejar cierre de conexión
      req.on('close', () => {
        this.handleSSEDisconnection(clientId, heartbeatInterval);
      });

      req.on('error', (error) => {
        console.error(`❌ Error en conexión SSE ${clientId}:`, error);
        this.handleSSEDisconnection(clientId, heartbeatInterval);
      });

    } catch (error) {
      console.error('❌ Error en conexión SSE:', error);
      res.status(401).json({ error: 'Token inválido' });
    }
  }

  /**
   * Maneja desconexión SSE
   */
  handleSSEDisconnection(clientId, heartbeatInterval) {
    clearInterval(heartbeatInterval);
    this.sseClients.delete(clientId);
    console.log(`📡 Conexión SSE cerrada: ${clientId}`);
  }

  /**
   * Envía evento SSE a un cliente específico
   */
  sendSSEEvent(res, event, data) {
    try {
      res.write(`event: ${event}\n`);
      res.write(`data: ${JSON.stringify(data)}\n\n`);
    } catch (error) {
      console.error('❌ Error enviando evento SSE:', error);
    }
  }

  /**
   * Envía evento SSE a todos los clientes conectados
   */
  broadcastSSEEvent(event, data) {
    const clientsToRemove = [];

    this.sseClients.forEach((client, clientId) => {
      try {
        this.sendSSEEvent(client.res, event, data);
        client.lastHeartbeat = new Date();
      } catch (error) {
        console.error(`❌ Error enviando SSE a ${clientId}:`, error);
        clientsToRemove.push(clientId);
      }
    });

    // Remover clientes con errores
    clientsToRemove.forEach(clientId => {
      this.sseClients.delete(clientId);
    });
  }

  /**
   * Envía evento SSE a clientes específicos por usuario
   */
  sendSSEToUser(userId, event, data) {
    const clientsToRemove = [];

    this.sseClients.forEach((client, clientId) => {
      if (client.userId === userId) {
        try {
          this.sendSSEEvent(client.res, event, data);
          client.lastHeartbeat = new Date();
        } catch (error) {
          console.error(`❌ Error enviando SSE a usuario ${userId}:`, error);
          clientsToRemove.push(clientId);
        }
      }
    });

    // Remover clientes con errores
    clientsToRemove.forEach(clientId => {
      this.sseClients.delete(clientId);
    });
  }

  // ========== POLLING ==========

  /**
   * Registra cliente para polling
   */
  registerPollingClient(clientData) {
    const { userId, clientId, interval = 5000 } = clientData;

    const pollingKey = `${userId}_${clientId}`;

    // Si ya existe un intervalo para este cliente, limpiarlo
    if (this.fallbackIntervals.has(pollingKey)) {
      clearInterval(this.fallbackIntervals.get(pollingKey));
    }

    // Crear nuevo intervalo de polling
    const pollingInterval = setInterval(() => {
      this.handlePollingRequest(userId, clientId);
    }, interval);

    // Registrar cliente
    this.pollingClients.set(pollingKey, {
      userId,
      clientId,
      interval,
      registeredAt: new Date(),
      lastPoll: new Date()
    });

    this.fallbackIntervals.set(pollingKey, pollingInterval);

    console.log(`📊 Cliente registrado para polling: ${pollingKey} (${interval}ms)`);

    return pollingKey;
  }

  /**
   * Elimina cliente de polling
   */
  unregisterPollingClient(userId, clientId) {
    const pollingKey = `${userId}_${clientId}`;

    if (this.fallbackIntervals.has(pollingKey)) {
      clearInterval(this.fallbackIntervals.get(pollingKey));
      this.fallbackIntervals.delete(pollingKey);
    }

    if (this.pollingClients.has(pollingKey)) {
      this.pollingClients.delete(pollingKey);
    }

    console.log(`📊 Cliente eliminado de polling: ${pollingKey}`);
  }

  /**
   * Maneja solicitud de polling
   */
  handlePollingRequest(userId, clientId) {
    try {
      const pollingKey = `${userId}_${clientId}`;
      const client = this.pollingClients.get(pollingKey);

      if (!client) {
        return;
      }

      // Actualizar timestamp de último poll
      client.lastPoll = new Date();

      // Aquí se podría implementar lógica para enviar eventos pendientes
      // Por ahora, solo confirmamos que el servicio está activo

      console.log(`📊 Poll recibido de: ${pollingKey}`);

    } catch (error) {
      console.error(`❌ Error en polling para ${userId}_${clientId}:`, error);
    }
  }

  /**
   * Obtiene eventos pendientes para un cliente (simulado)
   */
  getPendingEvents(userId) {
    // Esta función podría consultar una base de datos o cache
    // para obtener eventos pendientes cuando WebSockets no está disponible
    return {
      events: [],
      timestamp: new Date(),
      fallback: true
    };
  }

  // ========== INTEGRACIÓN CON TIEMPO REAL ==========

  /**
   * Reenvía eventos de tiempo real a métodos de fallback
   */
  forwardRealtimeEvent(event, data, targetUsers = null) {
    // Reenviar a SSE
    if (targetUsers) {
      // Enviar a usuarios específicos
      targetUsers.forEach(userId => {
        this.sendSSEToUser(userId, event, data);
      });
    } else {
      // Broadcast a todos los clientes SSE
      this.broadcastSSEEvent(event, data);
    }

    // Aquí se podría implementar lógica para almacenar eventos
    // en una cola para polling cuando sea necesario
  }

  /**
   * Activa modo fallback para un usuario específico
   */
  activateFallbackForUser(userId, reason = 'websocket_unavailable') {
    console.log(`🔄 Activando modo fallback para usuario ${userId}: ${reason}`);

    // Notificar al usuario sobre el cambio a fallback
    this.sendSSEToUser(userId, FALLBACK_EVENTS.FALLBACK_ACTIVATED, {
      reason,
      timestamp: new Date(),
      message: 'Cambiando a modo fallback'
    });
  }

  /**
   * Desactiva modo fallback para un usuario
   */
  deactivateFallbackForUser(userId) {
    console.log(`✅ Desactivando modo fallback para usuario ${userId}`);

    this.sendSSEToUser(userId, 'fallback_deactivated', {
      timestamp: new Date(),
      message: 'Modo normal restaurado'
    });
  }

  // ========== MÉTODOS DE NOTIFICACIÓN ==========

  /**
   * Notifica nuevo pedido vía fallback
   */
  notifyNewOrderFallback(restaurantId, orderData) {
    this.forwardRealtimeEvent('order_new', {
      restaurantId,
      order: orderData,
      fallback: true,
      timestamp: new Date()
    });
  }

  /**
   * Notifica cambio de estado vía fallback
   */
  notifyOrderStatusChangeFallback(orderId, userId, orderData) {
    this.sendSSEToUser(userId, 'order_status_updated', {
      orderId,
      order: orderData,
      fallback: true,
      timestamp: new Date()
    });
  }

  /**
   * Notifica ubicación de entrega vía fallback
   */
  notifyDeliveryLocationFallback(orderId, userId, locationData) {
    this.sendSSEToUser(userId, 'delivery_location_updated', {
      orderId,
      location: locationData,
      fallback: true,
      timestamp: new Date()
    });
  }

  /**
   * Notifica pago completado vía fallback
   */
  notifyPaymentCompletedFallback(orderId, userId, paymentData) {
    this.sendSSEToUser(userId, 'payment_completed', {
      orderId,
      payment: paymentData,
      fallback: true,
      timestamp: new Date()
    });
  }

  // ========== ESTADÍSTICAS Y MONITOREO ==========

  /**
   * Obtiene estadísticas del servicio de fallback
   */
  getStats() {
    return {
      sseClients: this.sseClients.size,
      pollingClients: this.pollingClients.size,
      activeIntervals: this.fallbackIntervals.size,
      clientsByUser: this.getClientsByUser()
    };
  }

  /**
   * Obtiene clientes agrupados por usuario
   */
  getClientsByUser() {
    const stats = {};

    this.sseClients.forEach((client) => {
      if (!stats[client.userId]) {
        stats[client.userId] = { sse: 0, polling: 0 };
      }
      stats[client.userId].sse++;
    });

    this.pollingClients.forEach((client) => {
      if (!stats[client.userId]) {
        stats[client.userId] = { sse: 0, polling: 0 };
      }
      stats[client.userId].polling++;
    });

    return stats;
  }

  /**
   * Limpia conexiones inactivas
   */
  cleanupInactiveConnections() {
    const now = new Date();
    const clientsToRemove = [];

    // Limpiar clientes SSE inactivos (más de 5 minutos sin heartbeat)
    this.sseClients.forEach((client, clientId) => {
      const inactiveTime = now - client.lastHeartbeat;
      if (inactiveTime > 300000) { // 5 minutos
        clientsToRemove.push({ type: 'sse', clientId });
      }
    });

    // Limpiar clientes polling inactivos (más de 10 minutos sin poll)
    this.pollingClients.forEach((client, pollingKey) => {
      const inactiveTime = now - client.lastPoll;
      if (inactiveTime > 600000) { // 10 minutos
        clientsToRemove.push({ type: 'polling', pollingKey });
      }
    });

    // Remover clientes inactivos
    clientsToRemove.forEach(({ type, clientId, pollingKey }) => {
      if (type === 'sse') {
        this.sseClients.delete(clientId);
      } else if (type === 'polling') {
        if (this.fallbackIntervals.has(pollingKey)) {
          clearInterval(this.fallbackIntervals.get(pollingKey));
          this.fallbackIntervals.delete(pollingKey);
        }
        this.pollingClients.delete(pollingKey);
      }
    });

    if (clientsToRemove.length > 0) {
      console.log(`🧹 Limpieza de fallback completada: ${clientsToRemove.length} conexiones eliminadas`);
    }
  }

  /**
   * Inicia limpieza automática de conexiones
   */
  startAutoCleanup() {
    setInterval(() => {
      this.cleanupInactiveConnections();
    }, 60000); // Cada minuto

    console.log('🔄 Auto-limpieza de conexiones fallback iniciada');
  }

  /**
   * Cierra el servicio de fallback
   */
  close() {
    // Cerrar todas las conexiones SSE
    this.sseClients.forEach((client) => {
      try {
        client.res.end();
      } catch (error) {
        console.error('Error cerrando conexión SSE:', error);
      }
    });

    // Limpiar todos los intervalos de polling
    this.fallbackIntervals.forEach((interval) => {
      clearInterval(interval);
    });

    // Limpiar estructuras de datos
    this.sseClients.clear();
    this.pollingClients.clear();
    this.fallbackIntervals.clear();

    console.log('🔄 FallbackService cerrado');
  }
}

// Función para inicializar el servicio de fallback
export const initializeFallbackService = (realtimeService) => {
  return new FallbackService(realtimeService);
};