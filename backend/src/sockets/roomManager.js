import jwt from 'jsonwebtoken';
import {
  ROOM_TYPES,
  ROOM_CONFIG,
  CONNECTION_EVENTS,
  SYSTEM_EVENTS,
  ERROR_CODES
} from '../utils/constants.js';

/**
 * Sistema avanzado de gestión de salas (rooms) para WebSockets
 * Maneja creación, limpieza automática, límites y monitoreo de salas
 */
export class RoomManager {
  constructor(io) {
    this.io = io;
    this.rooms = new Map(); // Almacena información de las salas
    this.userRooms = new Map(); // Almacena salas por usuario
    this.roomUsers = new Map(); // Almacena usuarios por sala
    this.cleanupInterval = null;

    this.initializeCleanup();
    this.setupEventHandlers();
  }

  /**
   * Inicializa el sistema de limpieza automática de salas
   */
  initializeCleanup() {
    this.cleanupInterval = setInterval(() => {
      this.cleanupInactiveRooms();
    }, ROOM_CONFIG.AUTO_CLEANUP_INTERVAL);
  }

  /**
   * Configura manejadores de eventos para monitoreo
   */
  setupEventHandlers() {
    this.io.on(CONNECTION_EVENTS.CONNECT, (socket) => {
      this.handleSocketConnection(socket);
    });

    this.io.on(CONNECTION_EVENTS.DISCONNECT, (socket) => {
      this.handleSocketDisconnection(socket);
    });
  }

  /**
   * Maneja nueva conexión de socket
   */
  handleSocketConnection(socket) {
    console.log(`🔗 Nueva conexión: ${socket.id}`);

    // Configurar heartbeat para esta conexión
    this.setupHeartbeat(socket);

    // Manejar eventos de autenticación
    socket.on(CONNECTION_EVENTS.AUTHENTICATE, (data) => {
      this.handleAuthentication(socket, data);
    });

    // Manejar unión a salas
    socket.on(CONNECTION_EVENTS.JOIN_ROOM, (data) => {
      this.handleJoinRoom(socket, data);
    });

    // Manejar salida de salas
    socket.on(CONNECTION_EVENTS.LEAVE_ROOM, (data) => {
      this.handleLeaveRoom(socket, data);
    });
  }

  /**
   * Maneja desconexión de socket
   */
  handleSocketDisconnection(socket) {
    console.log(`🔌 Desconexión: ${socket.id}`);

    // Remover usuario de todas sus salas
    if (socket.userId) {
      this.removeUserFromAllRooms(socket.userId, socket.id);
    }

    // Limpiar heartbeat
    if (socket.heartbeatInterval) {
      clearInterval(socket.heartbeatInterval);
    }
  }

  /**
   * Configura heartbeat para mantener conexión activa
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
        socket.emit(CONNECTION_EVENTS.AUTHENTICATION_FAILED, {
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

      // Inicializar mapa de salas para el usuario
      if (!this.userRooms.has(socket.userId)) {
        this.userRooms.set(socket.userId, new Set());
      }

      socket.emit(CONNECTION_EVENTS.AUTHENTICATION_SUCCESS, {
        userId: socket.userId,
        role: socket.userRole,
        message: 'Autenticación exitosa'
      });

      console.log(`✅ Usuario autenticado: ${socket.userId} (${socket.userRole})`);

    } catch (error) {
      console.error('❌ Error de autenticación:', error);
      socket.emit(CONNECTION_EVENTS.AUTHENTICATION_FAILED, {
        error: 'Token inválido',
        code: ERROR_CODES.INVALID_CREDENTIALS
      });
    }
  }

  /**
   * Maneja unión a una sala
   */
  handleJoinRoom(socket, data) {
    try {
      const { roomName, roomType } = data;

      if (!roomName) {
        socket.emit('error', { message: 'Nombre de sala requerido' });
        return;
      }

      // Validar autenticación
      if (!socket.userId) {
        socket.emit('error', { message: 'Usuario no autenticado' });
        return;
      }

      // Unirse a la sala
      socket.join(roomName);

      // Registrar en el sistema de gestión
      this.addUserToRoom(socket.userId, socket.id, roomName, roomType);

      socket.emit(CONNECTION_EVENTS.ROOM_JOINED, {
        roomName,
        roomType,
        message: `Unido a sala: ${roomName}`
      });

      console.log(`👤 Usuario ${socket.userId} se unió a sala: ${roomName}`);

    } catch (error) {
      console.error('❌ Error al unir a sala:', error);
      socket.emit('error', { message: 'Error al unir a sala' });
    }
  }

  /**
   * Maneja salida de una sala
   */
  handleLeaveRoom(socket, data) {
    try {
      const { roomName } = data;

      if (!roomName) {
        socket.emit('error', { message: 'Nombre de sala requerido' });
        return;
      }

      // Salir de la sala
      socket.leave(roomName);

      // Remover del sistema de gestión
      this.removeUserFromRoom(socket.userId, socket.id, roomName);

      socket.emit(CONNECTION_EVENTS.ROOM_LEFT, {
        roomName,
        message: `Abandonada sala: ${roomName}`
      });

      console.log(`👤 Usuario ${socket.userId} abandonó sala: ${roomName}`);

    } catch (error) {
      console.error('❌ Error al abandonar sala:', error);
      socket.emit('error', { message: 'Error al abandonar sala' });
    }
  }

  /**
   * Agrega usuario a una sala
   */
  addUserToRoom(userId, socketId, roomName, roomType = null) {
    // Inicializar sala si no existe
    if (!this.rooms.has(roomName)) {
      this.rooms.set(roomName, {
        name: roomName,
        type: roomType,
        users: new Set(),
        createdAt: new Date(),
        lastActivity: new Date()
      });
    }

    // Agregar usuario a la sala
    const room = this.rooms.get(roomName);
    room.users.add(socketId);
    room.lastActivity = new Date();

    // Agregar sala al usuario
    if (!this.userRooms.has(userId)) {
      this.userRooms.set(userId, new Set());
    }
    this.userRooms.get(userId).add(roomName);

    // Inicializar usuarios en sala si no existe
    if (!this.roomUsers.has(roomName)) {
      this.roomUsers.set(roomName, new Set());
    }
    this.roomUsers.get(roomName).add(userId);

    // Verificar límites
    this.checkRoomLimits(roomName);
  }

  /**
   * Remueve usuario de una sala
   */
  removeUserFromRoom(userId, socketId, roomName) {
    // Remover de la sala
    if (this.rooms.has(roomName)) {
      const room = this.rooms.get(roomName);
      room.users.delete(socketId);
      room.lastActivity = new Date();

      // Si la sala está vacía, marcar para limpieza
      if (room.users.size === 0) {
        room.emptySince = new Date();
      }
    }

    // Remover sala del usuario
    if (this.userRooms.has(userId)) {
      this.userRooms.get(userId).delete(roomName);
    }

    // Remover usuario de la sala
    if (this.roomUsers.has(roomName)) {
      this.roomUsers.get(roomName).delete(userId);
    }
  }

  /**
   * Remueve usuario de todas sus salas
   */
  removeUserFromAllRooms(userId, socketId) {
    if (this.userRooms.has(userId)) {
      const userRoomList = Array.from(this.userRooms.get(userId));
      userRoomList.forEach(roomName => {
        this.removeUserFromRoom(userId, socketId, roomName);
      });
      this.userRooms.delete(userId);
    }
  }

  /**
   * Verifica límites de usuarios por sala
   */
  checkRoomLimits(roomName) {
    const room = this.rooms.get(roomName);
    if (room && room.users.size > ROOM_CONFIG.MAX_USERS_PER_ROOM) {
      console.warn(`⚠️ Sala ${roomName} alcanzó límite máximo de usuarios`);
      // Podría implementar lógica de rechazo aquí
    }
  }

  /**
   * Limpia salas inactivas
   */
  cleanupInactiveRooms() {
    const now = new Date();
    const roomsToDelete = [];

    for (const [roomName, room] of this.rooms.entries()) {
      // Si la sala está vacía por más del tiempo límite
      if (room.users.size === 0 && room.emptySince) {
        const emptyTime = now - room.emptySince;
        if (emptyTime > ROOM_CONFIG.INACTIVE_ROOM_TIMEOUT) {
          roomsToDelete.push(roomName);
        }
      }
    }

    // Eliminar salas inactivas
    roomsToDelete.forEach(roomName => {
      this.rooms.delete(roomName);
      this.roomUsers.delete(roomName);
      console.log(`🧹 Sala inactiva eliminada: ${roomName}`);
    });

    if (roomsToDelete.length > 0) {
      console.log(`🧹 Limpieza completada: ${roomsToDelete.length} salas eliminadas`);
    }
  }

  /**
   * Crea salas específicas para un pedido
   */
  createOrderRooms(orderId) {
    const rooms = [
      `order_${orderId}`,
      `order_${orderId}_tracking`
    ];

    rooms.forEach(roomName => {
      if (!this.rooms.has(roomName)) {
        this.rooms.set(roomName, {
          name: roomName,
          type: ROOM_TYPES.ORDER_ROOM,
          users: new Set(),
          createdAt: new Date(),
          lastActivity: new Date()
        });
      }
    });

    return rooms;
  }

  /**
   * Crea salas específicas para un restaurante
   */
  createRestaurantRooms(restaurantId) {
    const rooms = [
      `restaurant_${restaurantId}`,
      `restaurant_${restaurantId}_orders`,
      `restaurant_${restaurantId}_kitchen`
    ];

    rooms.forEach(roomName => {
      if (!this.rooms.has(roomName)) {
        this.rooms.set(roomName, {
          name: roomName,
          type: ROOM_TYPES.RESTAURANT_ROOM,
          users: new Set(),
          createdAt: new Date(),
          lastActivity: new Date()
        });
      }
    });

    return rooms;
  }

  /**
   * Crea salas específicas para un repartidor
   */
  createDeliveryRooms(deliveryPersonId) {
    const rooms = [
      `delivery_${deliveryPersonId}`,
      `delivery_active_${deliveryPersonId}`
    ];

    rooms.forEach(roomName => {
      if (!this.rooms.has(roomName)) {
        this.rooms.set(roomName, {
          name: roomName,
          type: ROOM_TYPES.DELIVERY_PERSONAL,
          users: new Set(),
          createdAt: new Date(),
          lastActivity: new Date()
        });
      }
    });

    return rooms;
  }

  /**
   * Obtiene información de una sala
   */
  getRoomInfo(roomName) {
    return this.rooms.get(roomName) || null;
  }

  /**
   * Obtiene todas las salas de un usuario
   */
  getUserRooms(userId) {
    return Array.from(this.userRooms.get(userId) || []);
  }

  /**
   * Obtiene usuarios en una sala
   */
  getRoomUsers(roomName) {
    return Array.from(this.roomUsers.get(roomName) || []);
  }

  /**
   * Obtiene estadísticas del sistema de salas
   */
  getStats() {
    return {
      totalRooms: this.rooms.size,
      totalUsers: this.userRooms.size,
      roomsByType: this.getRoomsByType(),
      memoryUsage: {
        rooms: this.rooms.size * 100, // Aproximado en bytes
        userRooms: this.userRooms.size * 50,
        roomUsers: this.roomUsers.size * 50
      }
    };
  }

  /**
   * Obtiene salas agrupadas por tipo
   */
  getRoomsByType() {
    const stats = {};

    for (const [roomName, room] of this.rooms.entries()) {
      const type = room.type || 'unknown';
      if (!stats[type]) {
        stats[type] = 0;
      }
      stats[type]++;
    }

    return stats;
  }

  /**
   * Emite evento a una sala específica
   */
  emitToRoom(roomName, event, data) {
    this.io.to(roomName).emit(event, {
      ...data,
      timestamp: new Date(),
      room: roomName
    });

    // Actualizar actividad de la sala
    if (this.rooms.has(roomName)) {
      this.rooms.get(roomName).lastActivity = new Date();
    }
  }

  /**
   * Emite evento a múltiples salas
   */
  emitToRooms(roomNames, event, data) {
    roomNames.forEach(roomName => {
      this.emitToRoom(roomName, event, data);
    });
  }

  /**
   * Emite evento a todas las salas de un usuario
   */
  emitToUserRooms(userId, event, data) {
    const userRoomList = this.getUserRooms(userId);
    this.emitToRooms(userRoomList, event, data);
  }

  /**
   * Obtiene salas activas (con usuarios)
   */
  getActiveRooms() {
    const activeRooms = [];

    for (const [roomName, room] of this.rooms.entries()) {
      if (room.users.size > 0) {
        activeRooms.push({
          name: roomName,
          type: room.type,
          userCount: room.users.size,
          createdAt: room.createdAt,
          lastActivity: room.lastActivity
        });
      }
    }

    return activeRooms;
  }

  /**
   * Cierra el sistema de gestión de salas
   */
  close() {
    if (this.cleanupInterval) {
      clearInterval(this.cleanupInterval);
    }

    // Limpiar todas las estructuras de datos
    this.rooms.clear();
    this.userRooms.clear();
    this.roomUsers.clear();

    console.log('🔄 RoomManager cerrado');
  }
}

// Función para inicializar el RoomManager
export const initializeRoomManager = (io) => {
  return new RoomManager(io);
};