import jwt from 'jsonwebtoken';
import { RoomManager } from '../sockets/roomManager.js';
import { FallbackService } from './fallbackService.js';
import { ReconnectionService } from './reconnectionService.js';
import {
  ORDER_EVENTS,
  PAYMENT_EVENTS,
  LOCATION_EVENTS,
  SYSTEM_EVENTS,
  FALLBACK_EVENTS,
  ROOM_TYPES,
  ORDER_STATUSES,
  ERROR_CODES
} from '../utils/constants.js';

/**
 * Servicio centralizado para manejar comunicaciones en tiempo real
 * Integra WebSockets, eventos y gestión de salas
 */
export class RealtimeService {
  constructor(io) {
    this.io = io;
    this.roomManager = new RoomManager(io);
    this.fallbackService = null; // Se inicializará después
    this.reconnectionService = null; // Se inicializará después
    this.connectedUsers = new Map(); // Usuarios conectados actualmente
    this.userSockets = new Map(); // Sockets por usuario
    this.orderSubscribers = new Map(); // Suscriptores por pedido

    this.initializeEventHandlers();
  }

  /**
   * Inicializa el servicio de fallback
   */
  initializeFallbackService() {
    this.fallbackService = new FallbackService(this);
    this.fallbackService.startAutoCleanup();
    console.log('🔄 Servicio de fallback inicializado');
  }

  /**
   * Inicializa el servicio de reconexión
   */
  initializeReconnectionService() {
    this.reconnectionService = new ReconnectionService(this.io);
    console.log('🔄 Servicio de reconexión inicializado');
  }

  /**
   * Inicializa manejadores de eventos
   */
  initializeEventHandlers() {
    this.io.on('connection', (socket) => {
      this.handleConnection(socket);
    });
  }

  /**
   * Maneja nueva conexión
   */
  handleConnection(socket) {
    console.log(`🔗 Nueva conexión de tiempo real: ${socket.id}`);

    // Configurar heartbeat
    this.setupHeartbeat(socket);

    // Eventos de autenticación
    socket.on('authenticate', (data) => {
      this.handleAuthentication(socket, data);
    });

    // Eventos de suscripción a pedidos
    socket.on('subscribe_to_order', (data) => {
      this.handleOrderSubscription(socket, data);
    });

    socket.on('unsubscribe_from_order', (data) => {
      this.handleOrderUnsubscription(socket, data);
    });

    // Eventos de ubicación
    socket.on('update_location', (data) => {
      this.handleLocationUpdate(socket, data);
    });

    // Eventos de comunicación
    socket.on('send_message', (data) => {
      this.handleMessage(socket, data);
    });

    // Manejar desconexión
    socket.on('disconnect', () => {
      this.handleDisconnection(socket);
    });
  }

  /**
   * Configura heartbeat para mantener conexión
   */
  setupHeartbeat(socket) {
    socket.heartbeatInterval = setInterval(() => {
      socket.emit('ping', { timestamp: new Date() });
      socket.heartbeatTimeout = setTimeout(() => {
        console.log(`💔 Heartbeat timeout para ${socket.id}`);
        socket.disconnect();
      }, 5000);
    }, 30000);

    socket.on('pong', (data) => {
      if (socket.heartbeatTimeout) {
        clearTimeout(socket.heartbeatTimeout);
      }
    });
  }

  /**
   * Maneja autenticación de usuario
   */
  handleAuthentication(socket, data) {
    try {
      const { token } = data;

      if (!token) {
        socket.emit('authentication_failed', {
          error: 'Token requerido',
          code: ERROR_CODES.INVALID_CREDENTIALS
        });
        return;
      }

      // Verificar token JWT
      const decoded = jwt.verify(token, process.env.JWT_SECRET);

      socket.userId = decoded.id;
      socket.userRole = decoded.role;
      socket.userEmail = decoded.email;

      // Registrar usuario conectado
      this.connectedUsers.set(socket.userId, {
        userId: socket.userId,
        role: socket.userRole,
        email: socket.userEmail,
        connectedAt: new Date(),
        socketId: socket.id
      });

      // Registrar socket del usuario
      if (!this.userSockets.has(socket.userId)) {
        this.userSockets.set(socket.userId, new Set());
      }
      this.userSockets.get(socket.userId).add(socket.id);

      // Unir a salas por defecto según rol
      this.joinDefaultRooms(socket);

      socket.emit('authentication_success', {
        userId: socket.userId,
        role: socket.userRole,
        message: 'Autenticación exitosa',
        timestamp: new Date()
      });

      console.log(`✅ Usuario autenticado en tiempo real: ${socket.userId} (${socket.userRole})`);

    } catch (error) {
      console.error('❌ Error de autenticación en tiempo real:', error);
      socket.emit('authentication_failed', {
        error: 'Token inválido',
        code: ERROR_CODES.INVALID_CREDENTIALS
      });
    }
  }

  /**
   * Une usuario a salas por defecto según su rol
   */
  joinDefaultRooms(socket) {
    const { userId, userRole } = socket;

    // Todos los usuarios se unen a su sala personal
    this.roomManager.emitToRoom(`user_${userId}`, 'user_joined', {
      userId,
      role: userRole,
      timestamp: new Date()
    });

    // Unir a salas específicas según rol
    switch (userRole) {
      case 'customer':
        // Los clientes pueden recibir notificaciones generales
        socket.join('customers');
        break;

      case 'restaurant_owner':
        // Los restaurantes reciben pedidos y notificaciones
        socket.join('restaurants');
        break;

      case 'delivery_person':
        // Los repartidores reciben pedidos disponibles
        socket.join('delivery_persons');
        socket.join(`delivery_${userId}`);
        break;

      case 'admin':
        // Los administradores reciben todas las notificaciones
        socket.join('admin');
        socket.join('system');
        break;
    }
  }

  /**
   * Maneja suscripción a un pedido específico
   */
  handleOrderSubscription(socket, data) {
    try {
      const { orderId } = data;
      const { userId, userRole } = socket;

      if (!orderId) {
        socket.emit('error', { message: 'ID de pedido requerido' });
        return;
      }

      // Crear salas del pedido si no existen
      const orderRooms = this.roomManager.createOrderRooms(orderId);

      // Unir usuario a las salas del pedido
      orderRooms.forEach(roomName => {
        socket.join(roomName);
      });

      // Registrar suscriptor
      if (!this.orderSubscribers.has(orderId)) {
        this.orderSubscribers.set(orderId, new Set());
      }
      this.orderSubscribers.get(orderId).add(userId);

      socket.emit('subscription_success', {
        orderId,
        rooms: orderRooms,
        message: `Suscrito al pedido ${orderId}`,
        timestamp: new Date()
      });

      console.log(`📋 Usuario ${userId} suscrito al pedido ${orderId}`);

    } catch (error) {
      console.error('❌ Error en suscripción a pedido:', error);
      socket.emit('error', { message: 'Error al suscribirse al pedido' });
    }
  }

  /**
   * Maneja desuscripción de un pedido
   */
  handleOrderUnsubscription(socket, data) {
    try {
      const { orderId } = data;
      const { userId } = socket;

      if (!orderId) {
        socket.emit('error', { message: 'ID de pedido requerido' });
        return;
      }

      // Abandonar salas del pedido
      const orderRooms = [`order_${orderId}`, `order_${orderId}_tracking`];
      orderRooms.forEach(roomName => {
        socket.leave(roomName);
      });

      // Remover suscriptor
      if (this.orderSubscribers.has(orderId)) {
        this.orderSubscribers.get(orderId).delete(userId);
      }

      socket.emit('unsubscription_success', {
        orderId,
        message: `Desuscrito del pedido ${orderId}`,
        timestamp: new Date()
      });

      console.log(`📋 Usuario ${userId} desuscrito del pedido ${orderId}`);

    } catch (error) {
      console.error('❌ Error en desuscripción de pedido:', error);
      socket.emit('error', { message: 'Error al desuscribirse del pedido' });
    }
  }

  /**
   * Maneja actualización de ubicación
   */
  handleLocationUpdate(socket, data) {
    try {
      const { orderId, location, coordinates } = data;
      const { userId, userRole } = socket;

      if (!location || !coordinates) {
        socket.emit('error', { message: 'Ubicación y coordenadas requeridas' });
        return;
      }

      // Crear datos de ubicación
      const locationData = {
        userId,
        role: userRole,
        location,
        coordinates,
        timestamp: new Date()
      };

      // Emitir a salas relevantes
      if (orderId) {
        // Actualización específica de pedido
        this.roomManager.emitToRoom(`order_${orderId}`, LOCATION_EVENTS.DELIVERY_LOCATION_UPDATED, locationData);
        this.roomManager.emitToRoom(`order_${orderId}_tracking`, LOCATION_EVENTS.TRACKING_UPDATE, locationData);
      }

      // Emitir a sala personal del usuario
      this.roomManager.emitToRoom(`user_${userId}`, LOCATION_EVENTS.USER_LOCATION_UPDATED, locationData);

      // Si es repartidor, emitir a sala de delivery
      if (userRole === 'delivery_person') {
        this.roomManager.emitToRoom('delivery_persons', LOCATION_EVENTS.DELIVERY_LOCATION_UPDATED, locationData);
      }

      console.log(`📍 Ubicación actualizada: ${userId} en ${location}`);

    } catch (error) {
      console.error('❌ Error en actualización de ubicación:', error);
      socket.emit('error', { message: 'Error al actualizar ubicación' });
    }
  }

  /**
   * Maneja envío de mensajes
   */
  handleMessage(socket, data) {
    try {
      const { orderId, message, type = 'text' } = data;
      const { userId, userRole, userEmail } = socket;

      if (!message) {
        socket.emit('error', { message: 'Mensaje requerido' });
        return;
      }

      // Crear datos del mensaje
      const messageData = {
        userId,
        userRole,
        userEmail,
        message,
        type,
        timestamp: new Date()
      };

      // Emitir a salas relevantes
      if (orderId) {
        // Mensaje específico de pedido
        this.roomManager.emitToRoom(`order_${orderId}`, 'message_received', messageData);
      }

      // Emitir a sala personal del usuario
      this.roomManager.emitToRoom(`user_${userId}`, 'message_sent', messageData);

      console.log(`💬 Mensaje enviado: ${userId} - ${message.substring(0, 50)}...`);

    } catch (error) {
      console.error('❌ Error al enviar mensaje:', error);
      socket.emit('error', { message: 'Error al enviar mensaje' });
    }
  }

  /**
   * Maneja desconexión de usuario
   */
  handleDisconnection(socket) {
    console.log(`🔌 Desconexión de tiempo real: ${socket.id}`);

    if (socket.userId) {
      // Remover socket del usuario
      if (this.userSockets.has(socket.userId)) {
        this.userSockets.get(socket.userId).delete(socket.id);

        // Si el usuario no tiene más sockets activos, remover de conectados
        if (this.userSockets.get(socket.userId).size === 0) {
          this.connectedUsers.delete(socket.userId);
          this.userSockets.delete(socket.userId);

          // Notificar que el usuario se desconectó
          this.roomManager.emitToRoom(`user_${socket.userId}`, 'user_offline', {
            userId: socket.userId,
            timestamp: new Date()
          });
        }
      }
    }

    // Limpiar heartbeat
    if (socket.heartbeatInterval) {
      clearInterval(socket.heartbeatInterval);
    }
  }

  // ========== MÉTODOS PÚBLICOS PARA EMITIR EVENTOS ==========

  /**
   * Notifica nuevo pedido a restaurante
   */
  notifyNewOrder(restaurantId, orderData) {
    const restaurantRooms = this.roomManager.createRestaurantRooms(restaurantId);

    restaurantRooms.forEach(roomName => {
      this.roomManager.emitToRoom(roomName, ORDER_EVENTS.RESTAURANT_NEW_ORDER, {
        restaurantId,
        order: orderData,
        timestamp: new Date()
      });
    });

    console.log(`🔔 Nuevo pedido notificado al restaurante ${restaurantId}: ${orderData.id}`);
  }

  /**
   * Notifica cambio de estado de pedido
   */
  notifyOrderStatusChange(orderId, userId, orderData) {
    // Notificar al usuario
    this.roomManager.emitToRoom(`user_${userId}`, ORDER_EVENTS.ORDER_STATUS_UPDATED, {
      orderId,
      order: orderData,
      timestamp: new Date()
    });

    // Notificar a todos los suscriptores del pedido
    if (this.orderSubscribers.has(orderId)) {
      this.orderSubscribers.get(orderId).forEach(subscriberId => {
        if (subscriberId !== userId) {
          this.roomManager.emitToRoom(`user_${subscriberId}`, ORDER_EVENTS.ORDER_STATUS_UPDATED, {
            orderId,
            order: orderData,
            timestamp: new Date()
          });
        }
      });
    }

    // Notificar en sala del pedido
    this.roomManager.emitToRoom(`order_${orderId}`, ORDER_EVENTS.ORDER_STATUS_UPDATED, {
      orderId,
      order: orderData,
      timestamp: new Date()
    });

    console.log(`📱 Estado de pedido actualizado: ${orderId} -> ${orderData.status}`);
  }

  /**
   * Notifica pedido disponible para repartidores
   */
  notifyDeliveryAvailable(orderData) {
    this.roomManager.emitToRoom('delivery_persons', ORDER_EVENTS.DELIVERY_AVAILABLE, {
      order: orderData,
      timestamp: new Date()
    });

    console.log(`🚚 Pedido disponible para repartidores: ${orderData.id}`);
  }

  /**
   * Notifica asignación de repartidor
   */
  notifyDeliveryAssigned(orderId, userId, deliveryData) {
    this.roomManager.emitToRoom(`user_${userId}`, ORDER_EVENTS.DELIVERY_ASSIGNED, {
      orderId,
      delivery: deliveryData,
      timestamp: new Date()
    });

    // Notificar en sala del pedido
    this.roomManager.emitToRoom(`order_${orderId}`, ORDER_EVENTS.DELIVERY_ASSIGNED, {
      orderId,
      delivery: deliveryData,
      timestamp: new Date()
    });

    console.log(`🎯 Repartidor asignado al usuario ${userId} para pedido ${orderId}`);
  }

  /**
   * Notifica actualización de ubicación de entrega
   */
  notifyDeliveryLocationUpdate(orderId, deliveryPersonId, locationData) {
    this.roomManager.emitToRoom(`order_${orderId}`, LOCATION_EVENTS.DELIVERY_LOCATION_UPDATED, {
      orderId,
      deliveryPersonId,
      location: locationData,
      timestamp: new Date()
    });

    this.roomManager.emitToRoom(`order_${orderId}_tracking`, LOCATION_EVENTS.TRACKING_UPDATE, {
      orderId,
      deliveryPersonId,
      location: locationData,
      timestamp: new Date()
    });

    console.log(`📍 Ubicación de entrega actualizada: ${orderId}`);
  }

  /**
   * Notifica pago completado
   */
  notifyPaymentCompleted(orderId, userId, paymentData) {
    this.roomManager.emitToRoom(`user_${userId}`, PAYMENT_EVENTS.PAYMENT_COMPLETED, {
      orderId,
      payment: paymentData,
      timestamp: new Date()
    });

    // Notificar en sala del pedido
    this.roomManager.emitToRoom(`order_${orderId}`, PAYMENT_EVENTS.PAYMENT_COMPLETED, {
      orderId,
      payment: paymentData,
      timestamp: new Date()
    });

    console.log(`💳 Pago completado notificado: ${orderId}`);
  }

  /**
   * Notifica evento de pago fallido
   */
  notifyPaymentFailed(orderId, userId, error) {
    this.roomManager.emitToRoom(`user_${userId}`, PAYMENT_EVENTS.PAYMENT_FAILED, {
      orderId,
      error,
      timestamp: new Date()
    });

    console.log(`❌ Pago fallido notificado: ${orderId}`);
  }

  /**
   * Envía notificación push a usuario
   */
  sendNotification(userId, notificationData) {
    this.roomManager.emitToRoom(`user_${userId}`, 'notification_received', {
      ...notificationData,
      timestamp: new Date()
    });

    console.log(`🔔 Notificación enviada al usuario ${userId}`);
  }

  /**
   * Envía broadcast a todos los usuarios conectados
   */
  broadcast(event, data) {
    this.io.emit(event, {
      ...data,
      timestamp: new Date()
    });

    console.log(`📢 Broadcast enviado: ${event}`);
  }

  /**
   * Envía evento a usuarios por rol
   */
  broadcastToRole(role, event, data) {
    let roomName;

    switch (role) {
      case 'customer':
        roomName = 'customers';
        break;
      case 'restaurant_owner':
        roomName = 'restaurants';
        break;
      case 'delivery_person':
        roomName = 'delivery_persons';
        break;
      case 'admin':
        roomName = 'admin';
        break;
      default:
        return;
    }

    this.roomManager.emitToRoom(roomName, event, data);
    console.log(`📢 Broadcast a rol ${role}: ${event}`);
  }

  /**
   * Obtiene estadísticas del servicio
   */
  getStats() {
    return {
      connectedUsers: this.connectedUsers.size,
      totalSockets: Array.from(this.userSockets.values()).reduce((total, sockets) => total + sockets.size, 0),
      activeOrders: this.orderSubscribers.size,
      roomStats: this.roomManager.getStats(),
      fallbackStats: this.fallbackService ? this.fallbackService.getStats() : null,
      reconnectionStats: this.reconnectionService ? this.reconnectionService.getReconnectionStats() : null,
      uptime: process.uptime()
    };
  }

  /**
   * Obtiene usuarios conectados
   */
  getConnectedUsers() {
    return Array.from(this.connectedUsers.values());
  }

  /**
   * Obtiene suscriptores de un pedido
   */
  getOrderSubscribers(orderId) {
    return Array.from(this.orderSubscribers.get(orderId) || []);
  }

  /**
   * Cierra el servicio
   */
  close() {
    if (this.fallbackService) {
      this.fallbackService.close();
    }

    if (this.reconnectionService) {
      this.reconnectionService.close();
    }

    this.roomManager.close();

    // Limpiar todas las estructuras de datos
    this.connectedUsers.clear();
    this.userSockets.clear();
    this.orderSubscribers.clear();

    console.log('🔄 RealtimeService cerrado');
  }
}

// Función para inicializar el servicio de tiempo real
export const initializeRealtimeService = (io) => {
  return new RealtimeService(io);
};