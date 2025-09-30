import { EventEmitter } from 'events';
import {
  RECONNECTION_CONFIG,
  SYSTEM_EVENTS,
  CONNECTION_EVENTS,
  ERROR_CODES
} from '../utils/constants.js';

/**
 * Servicio para manejar reconexión automática de WebSockets
 * Implementa lógica de reintento con backoff exponencial
 */
export class ReconnectionService extends EventEmitter {
  constructor(io) {
    super();
    this.io = io;
    this.reconnectionAttempts = new Map(); // Intentos de reconexión por usuario
    this.failedConnections = new Map(); // Conexiones fallidas
    this.reconnectionTimers = new Map(); // Timers de reconexión
    this.connectionHistory = new Map(); // Historial de conexiones

    this.initializeReconnectionHandlers();
  }

  /**
   * Inicializa manejadores de eventos de reconexión
   */
  initializeReconnectionHandlers() {
    this.io.on('connection', (socket) => {
      this.handleNewConnection(socket);
    });

    this.io.on('disconnect', (socket) => {
      this.handleDisconnection(socket);
    });

    // Configurar limpieza periódica
    setInterval(() => {
      this.cleanupOldRecords();
    }, 300000); // Cada 5 minutos
  }

  /**
   * Maneja nueva conexión
   */
  handleNewConnection(socket) {
    const userId = socket.userId;

    if (!userId) return;

    // Registrar conexión exitosa
    this.recordConnection(userId, 'connected', socket.id);

    // Resetear contador de intentos fallidos si la conexión es exitosa
    if (this.failedConnections.has(userId)) {
      this.failedConnections.delete(userId);
    }

    // Cancelar timers de reconexión si existen
    if (this.reconnectionTimers.has(userId)) {
      clearTimeout(this.reconnectionTimers.get(userId));
      this.reconnectionTimers.delete(userId);
    }

    // Resetear contador de intentos
    this.reconnectionAttempts.set(userId, 0);

    // Emitir evento de reconexión exitosa si venía de un intento fallido
    if (this.wasReconnecting(userId)) {
      this.emit('reconnection_success', {
        userId,
        socketId: socket.id,
        timestamp: new Date()
      });

      socket.emit('reconnection_success', {
        message: 'Reconexión exitosa',
        timestamp: new Date()
      });

      console.log(`✅ Reconexión exitosa: ${userId}`);
    }
  }

  /**
   * Maneja desconexión
   */
  handleDisconnection(socket) {
    const userId = socket.userId;

    if (!userId) return;

    // Registrar desconexión
    this.recordConnection(userId, 'disconnected', socket.id);

    // Incrementar contador de intentos de reconexión
    const currentAttempts = this.reconnectionAttempts.get(userId) || 0;
    this.reconnectionAttempts.set(userId, currentAttempts + 1);

    // Si no hay timers activos, iniciar proceso de reconexión
    if (!this.reconnectionTimers.has(userId)) {
      this.scheduleReconnection(userId, socket);
    }
  }

  /**
   * Programa intento de reconexión
   */
  scheduleReconnection(userId, originalSocket) {
    const attempts = this.reconnectionAttempts.get(userId) || 0;

    // Si excedió el máximo de intentos, marcar como fallido
    if (attempts >= RECONNECTION_CONFIG.MAX_ATTEMPTS) {
      this.markConnectionAsFailed(userId, 'max_attempts_exceeded');
      return;
    }

    // Calcular delay con backoff exponencial
    const delay = this.calculateReconnectionDelay(attempts);

    console.log(`⏳ Programando reconexión para ${userId} en ${delay}ms (intento ${attempts + 1}/${RECONNECTION_CONFIG.MAX_ATTEMPTS})`);

    // Crear timer para reconexión
    const timer = setTimeout(() => {
      this.attemptReconnection(userId, attempts + 1);
    }, delay);

    this.reconnectionTimers.set(userId, timer);

    // Emitir evento de intento de reconexión
    this.emit('reconnection_attempt', {
      userId,
      attempt: attempts + 1,
      maxAttempts: RECONNECTION_CONFIG.MAX_ATTEMPTS,
      delay,
      timestamp: new Date()
    });
  }

  /**
   * Intenta reconectar usuario
   */
  attemptReconnection(userId, attempt) {
    // Remover timer
    this.reconnectionTimers.delete(userId);

    // Verificar si el usuario ya se reconectó
    if (this.isUserConnected(userId)) {
      console.log(`🔄 Usuario ${userId} ya está conectado, cancelando reconexión`);
      return;
    }

    // Si alcanzó el máximo de intentos, marcar como fallido
    if (attempt > RECONNECTION_CONFIG.MAX_ATTEMPTS) {
      this.markConnectionAsFailed(userId, 'max_attempts_exceeded');
      return;
    }

    // Actualizar contador de intentos
    this.reconnectionAttempts.set(userId, attempt);

    // Aquí se podría implementar lógica adicional como:
    // - Verificar estado del servidor
    // - Verificar si el usuario sigue activo
    // - Enviar notificación push al usuario

    console.log(`🔄 Intento de reconexión ${attempt}/${RECONNECTION_CONFIG.MAX_ATTEMPTS} para usuario ${userId}`);

    // Si no es el último intento, programar siguiente
    if (attempt < RECONNECTION_CONFIG.MAX_ATTEMPTS) {
      this.scheduleReconnection(userId, null);
    } else {
      this.markConnectionAsFailed(userId, 'final_attempt_failed');
    }
  }

  /**
   * Marca conexión como fallida
   */
  markConnectionAsFailed(userId, reason) {
    this.failedConnections.set(userId, {
      reason,
      failedAt: new Date(),
      attempts: this.reconnectionAttempts.get(userId) || 0
    });

    // Limpiar datos de reconexión
    this.reconnectionAttempts.delete(userId);
    if (this.reconnectionTimers.has(userId)) {
      clearTimeout(this.reconnectionTimers.get(userId));
      this.reconnectionTimers.delete(userId);
    }

    // Emitir evento de fallo de reconexión
    this.emit('reconnection_failed', {
      userId,
      reason,
      attempts: this.failedConnections.get(userId).attempts,
      timestamp: new Date()
    });

    console.log(`❌ Reconexión fallida para usuario ${userId}: ${reason}`);
  }

  /**
   * Calcula delay para siguiente intento de reconexión
   */
  calculateReconnectionDelay(attempt) {
    let delay = RECONNECTION_CONFIG.INITIAL_DELAY * Math.pow(RECONNECTION_CONFIG.BACKOFF_MULTIPLIER, attempt);

    // Aplicar jitter para evitar thundering herd
    if (RECONNECTION_CONFIG.JITTER) {
      const jitter = Math.random() * 0.1 * delay;
      delay += jitter;
    }

    // Limitar al máximo delay
    return Math.min(delay, RECONNECTION_CONFIG.MAX_DELAY);
  }

  /**
   * Registra evento de conexión en el historial
   */
  recordConnection(userId, status, socketId) {
    if (!this.connectionHistory.has(userId)) {
      this.connectionHistory.set(userId, []);
    }

    const history = this.connectionHistory.get(userId);
    history.push({
      status,
      socketId,
      timestamp: new Date()
    });

    // Mantener solo últimos 50 eventos por usuario
    if (history.length > 50) {
      history.splice(0, history.length - 50);
    }
  }

  /**
   * Verifica si usuario está conectado actualmente
   */
  isUserConnected(userId) {
    // Esta lógica depende de cómo se gestione el estado de conexiones
    // En Socket.io, podríamos verificar si hay sockets activos para este usuario
    const connectedSockets = this.io.sockets.sockets;
    for (const [socketId, socket] of connectedSockets) {
      if (socket.userId === userId) {
        return true;
      }
    }
    return false;
  }

  /**
   * Verifica si usuario estaba intentando reconectarse
   */
  wasReconnecting(userId) {
    return this.reconnectionAttempts.has(userId) && this.reconnectionAttempts.get(userId) > 0;
  }

  /**
   * Obtiene estadísticas de reconexión
   */
  getReconnectionStats() {
    return {
      activeReconnections: this.reconnectionTimers.size,
      failedConnections: this.failedConnections.size,
      totalAttempts: Array.from(this.reconnectionAttempts.values()).reduce((sum, attempts) => sum + attempts, 0),
      usersReconnecting: Array.from(this.reconnectionAttempts.keys()),
      usersFailed: Array.from(this.failedConnections.keys())
    };
  }

  /**
   * Obtiene historial de conexiones para un usuario
   */
  getConnectionHistory(userId) {
    return this.connectionHistory.get(userId) || [];
  }

  /**
   * Obtiene usuarios con problemas de conexión
   */
  getUsersWithConnectionIssues() {
    const issues = [];

    // Usuarios con reconexiones activas
    this.reconnectionAttempts.forEach((attempts, userId) => {
      issues.push({
        userId,
        issue: 'reconnecting',
        attempts,
        since: this.getLastConnectionTime(userId)
      });
    });

    // Usuarios con conexiones fallidas
    this.failedConnections.forEach((data, userId) => {
      issues.push({
        userId,
        issue: 'failed',
        reason: data.reason,
        failedAt: data.failedAt,
        attempts: data.attempts
      });
    });

    return issues;
  }

  /**
   * Obtiene timestamp de última conexión para un usuario
   */
  getLastConnectionTime(userId) {
    const history = this.connectionHistory.get(userId);
    if (!history || history.length === 0) return null;

    // Buscar última conexión exitosa
    for (let i = history.length - 1; i >= 0; i--) {
      if (history[i].status === 'connected') {
        return history[i].timestamp;
      }
    }

    return null;
  }

  /**
   * Fuerza reconexión para un usuario
   */
  forceReconnection(userId) {
    console.log(`🔄 Forzando reconexión para usuario ${userId}`);

    // Cancelar procesos de reconexión existentes
    if (this.reconnectionTimers.has(userId)) {
      clearTimeout(this.reconnectionTimers.get(userId));
      this.reconnectionTimers.delete(userId);
    }

    // Resetear contador de intentos
    this.reconnectionAttempts.set(userId, 0);

    // Iniciar nuevo proceso de reconexión
    this.scheduleReconnection(userId, null);

    return {
      success: true,
      message: 'Reconexión forzada iniciada',
      timestamp: new Date()
    };
  }

  /**
   * Cancela proceso de reconexión para un usuario
   */
  cancelReconnection(userId) {
    console.log(`🛑 Cancelando reconexión para usuario ${userId}`);

    if (this.reconnectionTimers.has(userId)) {
      clearTimeout(this.reconnectionTimers.get(userId));
      this.reconnectionTimers.delete(userId);
    }

    this.reconnectionAttempts.delete(userId);

    return {
      success: true,
      message: 'Reconexión cancelada',
      timestamp: new Date()
    };
  }

  /**
   * Limpia registros antiguos
   */
  cleanupOldRecords() {
    const cutoffTime = new Date(Date.now() - 24 * 60 * 60 * 1000); // 24 horas

    // Limpiar historial antiguo
    this.connectionHistory.forEach((history, userId) => {
      const recentHistory = history.filter(event => event.timestamp > cutoffTime);
      if (recentHistory.length === 0) {
        this.connectionHistory.delete(userId);
      } else {
        this.connectionHistory.set(userId, recentHistory);
      }
    });

    // Limpiar conexiones fallidas antiguas
    this.failedConnections.forEach((data, userId) => {
      if (data.failedAt < cutoffTime) {
        this.failedConnections.delete(userId);
      }
    });

    console.log('🧹 Limpieza de registros de reconexión completada');
  }

  /**
   * Obtiene métricas de conexión
   */
  getConnectionMetrics() {
    const now = new Date();
    const lastHour = new Date(now.getTime() - 60 * 60 * 1000);
    const last24Hours = new Date(now.getTime() - 24 * 60 * 60 * 1000);

    let connectionsLastHour = 0;
    let disconnectionsLastHour = 0;
    let connectionsLast24Hours = 0;
    let disconnectionsLast24Hours = 0;

    this.connectionHistory.forEach((history) => {
      history.forEach(event => {
        if (event.timestamp > last24Hours) {
          if (event.status === 'connected') {
            connectionsLast24Hours++;
            if (event.timestamp > lastHour) {
              connectionsLastHour++;
            }
          } else if (event.status === 'disconnected') {
            disconnectionsLast24Hours++;
            if (event.timestamp > lastHour) {
              disconnectionsLastHour++;
            }
          }
        }
      });
    });

    return {
      period: {
        lastHour: {
          connections: connectionsLastHour,
          disconnections: disconnectionsLastHour,
          netConnections: connectionsLastHour - disconnectionsLastHour
        },
        last24Hours: {
          connections: connectionsLast24Hours,
          disconnections: disconnectionsLast24Hours,
          netConnections: connectionsLast24Hours - disconnectionsLast24Hours
        }
      },
      current: {
        activeReconnections: this.reconnectionTimers.size,
        failedConnections: this.failedConnections.size,
        totalAttempts: Array.from(this.reconnectionAttempts.values()).reduce((sum, attempts) => sum + attempts, 0)
      },
      timestamp: now
    };
  }

  /**
   * Cierra el servicio de reconexión
   */
  close() {
    // Cancelar todos los timers de reconexión
    this.reconnectionTimers.forEach((timer) => {
      clearTimeout(timer);
    });

    // Limpiar todas las estructuras de datos
    this.reconnectionAttempts.clear();
    this.failedConnections.clear();
    this.reconnectionTimers.clear();
    this.connectionHistory.clear();

    console.log('🔄 ReconnectionService cerrado');
  }
}

// Función para inicializar el servicio de reconexión
export const initializeReconnectionService = (io) => {
  return new ReconnectionService(io);
};