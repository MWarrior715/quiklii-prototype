// Constantes de eventos WebSocket para el sistema de tiempo real Quiklii

// Eventos de conexión y autenticación
export const CONNECTION_EVENTS = {
  CONNECT: 'connect',
  DISCONNECT: 'disconnect',
  AUTHENTICATE: 'authenticate',
  AUTHENTICATION_SUCCESS: 'authentication_success',
  AUTHENTICATION_FAILED: 'authentication_failed',
  JOIN_ROOM: 'join_room',
  LEAVE_ROOM: 'leave_room',
  ROOM_JOINED: 'room_joined',
  ROOM_LEFT: 'room_left'
};

// Eventos de pedidos
export const ORDER_EVENTS = {
  // Estados del pedido
  ORDER_PLACED: 'order_placed',
  ORDER_CONFIRMED: 'order_confirmed',
  ORDER_PREPARING: 'order_preparing',
  ORDER_READY: 'order_ready',
  ORDER_PICKED_UP: 'order_picked_up',
  ORDER_ON_WAY: 'order_on_way',
  ORDER_DELIVERED: 'order_delivered',
  ORDER_CANCELLED: 'order_cancelled',

  // Eventos específicos
  ORDER_STATUS_UPDATED: 'order_status_updated',
  ORDER_NEW: 'order_new',
  ORDER_UPDATED: 'order_updated',
  ORDER_TRACKING_UPDATE: 'order_tracking_update',

  // Eventos para restaurantes
  RESTAURANT_NEW_ORDER: 'restaurant_new_order',
  RESTAURANT_ORDER_CONFIRMED: 'restaurant_order_confirmed',
  RESTAURANT_ORDER_CANCELLED: 'restaurant_order_cancelled',

  // Eventos para repartidores
  DELIVERY_AVAILABLE: 'delivery_available',
  DELIVERY_ASSIGNED: 'delivery_assigned',
  DELIVERY_ACCEPTED: 'delivery_accepted',
  DELIVERY_REJECTED: 'delivery_rejected',
  DELIVERY_PICKED_UP: 'delivery_picked_up',
  DELIVERY_COMPLETED: 'delivery_completed',
  DELIVERY_LOCATION_UPDATE: 'delivery_location_update'
};

// Eventos de pagos
export const PAYMENT_EVENTS = {
  PAYMENT_INITIATED: 'payment_initiated',
  PAYMENT_PROCESSING: 'payment_processing',
  PAYMENT_COMPLETED: 'payment_completed',
  PAYMENT_FAILED: 'payment_failed',
  PAYMENT_CANCELLED: 'payment_cancelled',
  PAYMENT_REFUNDED: 'payment_refunded',
  PAYMENT_STATUS_UPDATED: 'payment_status_updated'
};

// Eventos de ubicación y seguimiento
export const LOCATION_EVENTS = {
  DELIVERY_LOCATION_UPDATED: 'delivery_location_updated',
  RESTAURANT_LOCATION_UPDATED: 'restaurant_location_updated',
  USER_LOCATION_UPDATED: 'user_location_updated',
  TRACKING_UPDATE: 'tracking_update'
};

// Eventos de comunicación
export const COMMUNICATION_EVENTS = {
  MESSAGE_SENT: 'message_sent',
  MESSAGE_RECEIVED: 'message_received',
  NOTIFICATION_SENT: 'notification_sent',
  NOTIFICATION_RECEIVED: 'notification_received'
};

// Eventos de sistema
export const SYSTEM_EVENTS = {
  // Mantenimiento y operaciones
  MAINTENANCE_MODE: 'maintenance_mode',
  SYSTEM_UPDATE: 'system_update',
  BROADCAST_MESSAGE: 'broadcast_message',

  // Métricas y monitoreo
  METRICS_UPDATE: 'metrics_update',
  PERFORMANCE_UPDATE: 'performance_update',

  // Eventos de error
  ERROR_OCCURRED: 'error_occurred',
  CONNECTION_ERROR: 'connection_error',
  RECONNECTION_ATTEMPT: 'reconnection_attempt',
  RECONNECTION_SUCCESS: 'reconnection_success',
  RECONNECTION_FAILED: 'reconnection_failed'
};

// Eventos de fallback (SSE/Polling)
export const FALLBACK_EVENTS = {
  SSE_CONNECTED: 'sse_connected',
  SSE_ERROR: 'sse_error',
  POLLING_STARTED: 'polling_started',
  POLLING_STOPPED: 'polling_stopped',
  FALLBACK_ACTIVATED: 'fallback_activated'
};

// Tipos de rooms/salas
export const ROOM_TYPES = {
  // Rooms por usuario
  USER_ROOM: 'user_room',           // user_{userId}
  USER_ORDERS: 'user_orders',       // user_{userId}_orders

  // Rooms por restaurante
  RESTAURANT_ROOM: 'restaurant_room',     // restaurant_{restaurantId}
  RESTAURANT_ORDERS: 'restaurant_orders', // restaurant_{restaurantId}_orders
  RESTAURANT_KITCHEN: 'restaurant_kitchen', // restaurant_{restaurantId}_kitchen

  // Rooms por repartidor
  DELIVERY_ROOM: 'delivery_room',         // delivery_persons
  DELIVERY_PERSONAL: 'delivery_personal', // delivery_{deliveryPersonId}
  DELIVERY_ACTIVE: 'delivery_active',     // delivery_active_{deliveryPersonId}

  // Rooms por pedido
  ORDER_ROOM: 'order_room',         // order_{orderId}
  ORDER_TRACKING: 'order_tracking', // order_{orderId}_tracking

  // Rooms especiales
  ADMIN_ROOM: 'admin_room',
  SYSTEM_ROOM: 'system_room',
  PUBLIC_ROOM: 'public_room',

  // Rooms por zona geográfica
  ZONE_ROOM: 'zone_room',           // zone_{zoneId}
  CITY_ROOM: 'city_room',           // city_{cityName}
  AREA_ROOM: 'area_room'            // area_{areaName}
};

// Estados de conexión
export const CONNECTION_STATES = {
  CONNECTING: 'connecting',
  CONNECTED: 'connected',
  AUTHENTICATED: 'authenticated',
  DISCONNECTING: 'disconnecting',
  DISCONNECTED: 'disconnected',
  RECONNECTING: 'reconnecting',
  ERROR: 'error',
  FALLBACK: 'fallback'
};

// Configuración de reconexión
export const RECONNECTION_CONFIG = {
  MAX_ATTEMPTS: 5,
  INITIAL_DELAY: 1000,    // 1 segundo
  MAX_DELAY: 30000,       // 30 segundos
  BACKOFF_MULTIPLIER: 2,
  JITTER: true
};

// Configuración de heartbeat
export const HEARTBEAT_CONFIG = {
  INTERVAL: 30000,        // 30 segundos
  TIMEOUT: 5000,          // 5 segundos
  MAX_MISSED: 3           // Máximo de heartbeats perdidos antes de desconectar
};

// Configuración de rooms
export const ROOM_CONFIG = {
  MAX_USERS_PER_ROOM: 1000,
  MAX_ROOMS_PER_USER: 50,
  ROOM_NAME_MAX_LENGTH: 100,
  AUTO_CLEANUP_INTERVAL: 300000, // 5 minutos
  INACTIVE_ROOM_TIMEOUT: 3600000 // 1 hora
};

// Eventos de heartbeat
export const HEARTBEAT_EVENTS = {
  PING: 'ping',
  PONG: 'pong',
  HEARTBEAT: 'heartbeat',
  HEARTBEAT_ACK: 'heartbeat_ack'
};

// Eventos de presencia (usuarios online)
export const PRESENCE_EVENTS = {
  USER_ONLINE: 'user_online',
  USER_OFFLINE: 'user_offline',
  USER_TYPING: 'user_typing',
  USER_STOPPED_TYPING: 'user_stopped_typing',
  PRESENCE_UPDATE: 'presence_update'
};

// Eventos de notificaciones push
export const PUSH_EVENTS = {
  PUSH_TOKEN_REGISTERED: 'push_token_registered',
  PUSH_NOTIFICATION_SENT: 'push_notification_sent',
  PUSH_NOTIFICATION_RECEIVED: 'push_notification_received',
  PUSH_NOTIFICATION_FAILED: 'push_notification_failed'
};

// Eventos de métricas en tiempo real
export const METRICS_EVENTS = {
  ORDER_COUNT_UPDATE: 'order_count_update',
  REVENUE_UPDATE: 'revenue_update',
  DELIVERY_TIME_UPDATE: 'delivery_time_update',
  USER_ACTIVITY_UPDATE: 'user_activity_update'
};

// Eventos de soporte y ayuda
export const SUPPORT_EVENTS = {
  SUPPORT_REQUEST: 'support_request',
  SUPPORT_MESSAGE: 'support_message',
  SUPPORT_RESOLVED: 'support_resolved',
  CHAT_STARTED: 'chat_started',
  CHAT_ENDED: 'chat_ended'
};

// Eventos de promociones en tiempo real
export const PROMOTION_EVENTS = {
  PROMOTION_ACTIVATED: 'promotion_activated',
  PROMOTION_DEACTIVATED: 'promotion_deactivated',
  PROMOTION_UPDATED: 'promotion_updated',
  FLASH_SALE_STARTED: 'flash_sale_started',
  FLASH_SALE_ENDED: 'flash_sale_ended'
};

// Eventos de inventario en tiempo real
export const INVENTORY_EVENTS = {
  INVENTORY_UPDATED: 'inventory_updated',
  ITEM_OUT_OF_STOCK: 'item_out_of_stock',
  ITEM_BACK_IN_STOCK: 'item_back_in_stock',
  PRICE_UPDATED: 'price_updated'
};

// Eventos de calificaciones y reseñas
export const RATING_EVENTS = {
  RATING_SUBMITTED: 'rating_submitted',
  RATING_UPDATED: 'rating_updated',
  REVIEW_SUBMITTED: 'review_submitted',
  RESTAURANT_RATING_UPDATED: 'restaurant_rating_updated'
};

// Eventos de configuración y administración
export const ADMIN_EVENTS = {
  SETTINGS_UPDATED: 'settings_updated',
  FEATURE_TOGGLED: 'feature_toggled',
  USER_BANNED: 'user_banned',
  USER_UNBANNED: 'user_unbanned',
  RESTAURANT_SUSPENDED: 'restaurant_suspended',
  RESTAURANT_ACTIVATED: 'restaurant_activated'
};

// Eventos de integración con terceros
export const INTEGRATION_EVENTS = {
  EXTERNAL_API_UPDATE: 'external_api_update',
  WEBHOOK_RECEIVED: 'webhook_received',
  THIRD_PARTY_STATUS: 'third_party_status',
  API_RATE_LIMIT: 'api_rate_limit'
};

// Eventos de debugging y desarrollo
export const DEBUG_EVENTS = {
  DEBUG_MESSAGE: 'debug_message',
  LOG_MESSAGE: 'log_message',
  PERFORMANCE_METRIC: 'performance_metric',
  MEMORY_USAGE: 'memory_usage'
};

// Función auxiliar para obtener todos los eventos como array
export const getAllEvents = () => {
  return [
    ...Object.values(CONNECTION_EVENTS),
    ...Object.values(ORDER_EVENTS),
    ...Object.values(PAYMENT_EVENTS),
    ...Object.values(LOCATION_EVENTS),
    ...Object.values(COMMUNICATION_EVENTS),
    ...Object.values(SYSTEM_EVENTS),
    ...Object.values(FALLBACK_EVENTS),
    ...Object.values(HEARTBEAT_EVENTS),
    ...Object.values(PRESENCE_EVENTS),
    ...Object.values(PUSH_EVENTS),
    ...Object.values(METRICS_EVENTS),
    ...Object.values(SUPPORT_EVENTS),
    ...Object.values(PROMOTION_EVENTS),
    ...Object.values(INVENTORY_EVENTS),
    ...Object.values(RATING_EVENTS),
    ...Object.values(ADMIN_EVENTS),
    ...Object.values(INTEGRATION_EVENTS),
    ...Object.values(DEBUG_EVENTS)
  ];
};

// Función auxiliar para validar si un evento es válido
export const isValidEvent = (event) => {
  return getAllEvents().includes(event);
};

// Función auxiliar para obtener el tipo de evento
export const getEventCategory = (event) => {
  if (Object.values(CONNECTION_EVENTS).includes(event)) return 'CONNECTION_EVENTS';
  if (Object.values(ORDER_EVENTS).includes(event)) return 'ORDER_EVENTS';
  if (Object.values(PAYMENT_EVENTS).includes(event)) return 'PAYMENT_EVENTS';
  if (Object.values(LOCATION_EVENTS).includes(event)) return 'LOCATION_EVENTS';
  if (Object.values(COMMUNICATION_EVENTS).includes(event)) return 'COMMUNICATION_EVENTS';
  if (Object.values(SYSTEM_EVENTS).includes(event)) return 'SYSTEM_EVENTS';
  if (Object.values(FALLBACK_EVENTS).includes(event)) return 'FALLBACK_EVENTS';
  if (Object.values(HEARTBEAT_EVENTS).includes(event)) return 'HEARTBEAT_EVENTS';
  if (Object.values(PRESENCE_EVENTS).includes(event)) return 'PRESENCE_EVENTS';
  if (Object.values(PUSH_EVENTS).includes(event)) return 'PUSH_EVENTS';
  if (Object.values(METRICS_EVENTS).includes(event)) return 'METRICS_EVENTS';
  if (Object.values(SUPPORT_EVENTS).includes(event)) return 'SUPPORT_EVENTS';
  if (Object.values(PROMOTION_EVENTS).includes(event)) return 'PROMOTION_EVENTS';
  if (Object.values(INVENTORY_EVENTS).includes(event)) return 'INVENTORY_EVENTS';
  if (Object.values(RATING_EVENTS).includes(event)) return 'RATING_EVENTS';
  if (Object.values(ADMIN_EVENTS).includes(event)) return 'ADMIN_EVENTS';
  if (Object.values(INTEGRATION_EVENTS).includes(event)) return 'INTEGRATION_EVENTS';
  if (Object.values(DEBUG_EVENTS).includes(event)) return 'DEBUG_EVENTS';
  return 'UNKNOWN';
};