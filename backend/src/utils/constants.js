// Constantes del sistema Quiklii

// Estados de los pedidos
export const ORDER_STATUSES = {
  PENDING: 'pending',
  CONFIRMED: 'confirmed',
  PREPARING: 'preparing',
  READY: 'ready',
  PICKED_UP: 'picked_up',
  ON_WAY: 'on_way',
  DELIVERED: 'delivered',
  CANCELLED: 'cancelled'
};

// Traducciones de estados para mostrar al usuario
export const ORDER_STATUS_TRANSLATIONS = {
  [ORDER_STATUSES.PENDING]: 'Pendiente',
  [ORDER_STATUSES.CONFIRMED]: 'Confirmado',
  [ORDER_STATUSES.PREPARING]: 'En preparación',
  [ORDER_STATUSES.READY]: 'Listo para recoger',
  [ORDER_STATUSES.PICKED_UP]: 'Recogido',
  [ORDER_STATUSES.ON_WAY]: 'En camino',
  [ORDER_STATUSES.DELIVERED]: 'Entregado',
  [ORDER_STATUSES.CANCELLED]: 'Cancelado'
};

// Métodos de pago disponibles en Colombia
export const PAYMENT_METHODS = {
  MERCADOPAGO: 'mercadopago',
  PAYU: 'payu',
  PSE: 'pse',
  NEQUI: 'nequi',
  DAVIPLATA: 'daviplata',
  CASH: 'cash'
};

// Traducciones de métodos de pago
export const PAYMENT_METHOD_TRANSLATIONS = {
  [PAYMENT_METHODS.MERCADOPAGO]: 'MercadoPago',
  [PAYMENT_METHODS.PAYU]: 'PayU',
  [PAYMENT_METHODS.PSE]: 'PSE',
  [PAYMENT_METHODS.NEQUI]: 'Nequi',
  [PAYMENT_METHODS.DAVIPLATA]: 'DaviPlata',
  [PAYMENT_METHODS.CASH]: 'Efectivo'
};

// Estados de los pagos
export const PAYMENT_STATUSES = {
  PENDING: 'pending',
  PAID: 'paid',
  FAILED: 'failed',
  REFUNDED: 'refunded'
};

// Roles de usuario
export const USER_ROLES = {
  CUSTOMER: 'customer',
  RESTAURANT_OWNER: 'restaurant_owner',
  DELIVERY_PERSON: 'delivery_person',
  ADMIN: 'admin'
};

// Tipos de servicio
export const SERVICE_TYPES = {
  DELIVERY: 'delivery',
  DINING: 'dining',
  NIGHTLIFE: 'nightlife'
};

// Traducciones de tipos de servicio
export const SERVICE_TYPE_TRANSLATIONS = {
  [SERVICE_TYPES.DELIVERY]: 'Delivery',
  [SERVICE_TYPES.DINING]: 'Restaurante',
  [SERVICE_TYPES.NIGHTLIFE]: 'Vida Nocturna'
};

// Rangos de precio
export const PRICE_RANGES = {
  BUDGET: 1,      // $
  MODERATE: 2,    // $$
  EXPENSIVE: 3,   // $$$
  VERY_EXPENSIVE: 4 // $$$$
};

// Tipos de cocina populares en Colombia
export const CUISINE_TYPES = [
  'Colombiana',
  'Internacional',
  'Italiana',
  'Mexicana',
  'China',
  'Japonesa',
  'India',
  'Árabe',
  'Peruana',
  'Argentina',
  'Americana',
  'Francesa',
  'Mediterránea',
  'Tailandesa',
  'Coreana',
  'Vegetariana',
  'Vegana',
  'Comida Rápida',
  'Parrilla',
  'Mariscos',
  'Postres',
  'Desayunos',
  'Saludable'
];

// Estados de los repartidores
export const DELIVERY_PERSON_STATUSES = {
  OFFLINE: 'offline',
  AVAILABLE: 'available',
  BUSY: 'busy',
  ON_DELIVERY: 'on_delivery'
};

// Tipos de vehículos para delivery
export const VEHICLE_TYPES = {
  MOTORCYCLE: 'motorcycle',
  BICYCLE: 'bicycle',
  CAR: 'car',
  WALKING: 'walking'
};

// Traducciones de vehículos
export const VEHICLE_TYPE_TRANSLATIONS = {
  [VEHICLE_TYPES.MOTORCYCLE]: 'Motocicleta',
  [VEHICLE_TYPES.BICYCLE]: 'Bicicleta',
  [VEHICLE_TYPES.CAR]: 'Automóvil',
  [VEHICLE_TYPES.WALKING]: 'A pie'
};

// Tipos de notificación
export const NOTIFICATION_TYPES = {
  ORDER: 'order',
  PROMOTION: 'promotion',
  GENERAL: 'general',
  DELIVERY: 'delivery',
  PAYMENT: 'payment'
};

// Tipos de promoción
export const PROMOTION_TYPES = {
  PERCENTAGE: 'percentage',
  FIXED: 'fixed',
  FREE_DELIVERY: 'free_delivery',
  BUY_ONE_GET_ONE: 'buy_one_get_one'
};

// Días de la semana
export const WEEKDAYS = {
  MONDAY: 'monday',
  TUESDAY: 'tuesday',
  WEDNESDAY: 'wednesday',
  THURSDAY: 'thursday',
  FRIDAY: 'friday',
  SATURDAY: 'saturday',
  SUNDAY: 'sunday'
};

// Traducciones de días
export const WEEKDAY_TRANSLATIONS = {
  [WEEKDAYS.MONDAY]: 'Lunes',
  [WEEKDAYS.TUESDAY]: 'Martes',
  [WEEKDAYS.WEDNESDAY]: 'Miércoles',
  [WEEKDAYS.THURSDAY]: 'Jueves',
  [WEEKDAYS.FRIDAY]: 'Viernes',
  [WEEKDAYS.SATURDAY]: 'Sábado',
  [WEEKDAYS.SUNDAY]: 'Domingo'
};

// Límites del sistema
export const SYSTEM_LIMITS = {
  MAX_CART_ITEMS: 50,
  MAX_IMAGE_SIZE: 5 * 1024 * 1024, // 5MB
  MAX_MENU_ITEMS_PER_RESTAURANT: 500,
  MAX_MODIFIERS_PER_ITEM: 20,
  MAX_ORDER_ITEMS: 30,
  MIN_ORDER_VALUE: 10000, // $10.000 COP
  MAX_DELIVERY_DISTANCE: 15, // 15km
  DEFAULT_PAGINATION_LIMIT: 20,
  MAX_PAGINATION_LIMIT: 100
};

// Códigos de error personalizados
export const ERROR_CODES = {
  USER_NOT_FOUND: 'USER_NOT_FOUND',
  INVALID_CREDENTIALS: 'INVALID_CREDENTIALS',
  EMAIL_ALREADY_EXISTS: 'EMAIL_ALREADY_EXISTS',
  PHONE_ALREADY_EXISTS: 'PHONE_ALREADY_EXISTS',
  RESTAURANT_NOT_FOUND: 'RESTAURANT_NOT_FOUND',
  RESTAURANT_CLOSED: 'RESTAURANT_CLOSED',
  MENU_ITEM_NOT_FOUND: 'MENU_ITEM_NOT_FOUND',
  MENU_ITEM_UNAVAILABLE: 'MENU_ITEM_UNAVAILABLE',
  ORDER_NOT_FOUND: 'ORDER_NOT_FOUND',
  INSUFFICIENT_PERMISSIONS: 'INSUFFICIENT_PERMISSIONS',
  PAYMENT_FAILED: 'PAYMENT_FAILED',
  DELIVERY_AREA_NOT_COVERED: 'DELIVERY_AREA_NOT_COVERED',
  ORDER_MINIMUM_NOT_REACHED: 'ORDER_MINIMUM_NOT_REACHED'
};

// Configuraciones por defecto
export const DEFAULT_CONFIG = {
  DELIVERY_FEE: 3000, // $3.000 COP
  MIN_ORDER_VALUE: 15000, // $15.000 COP
  MAX_DELIVERY_TIME: 60, // 60 minutos
  DEFAULT_RESTAURANT_RATING: 4.0,
  COMMISSION_RATE: 0.15, // 15% comisión para Quiklii
  VAT_RATE: 0.19 // 19% IVA Colombia
};

// Configuraciones de archivos
export const FILE_CONFIG = {
  ALLOWED_IMAGE_TYPES: ['image/jpeg', 'image/png', 'image/webp'],
  MAX_IMAGE_SIZE: 5 * 1024 * 1024, // 5MB
  UPLOAD_PATHS: {
    RESTAURANTS: 'uploads/restaurants/',
    MENU_ITEMS: 'uploads/menu-items/',
    USERS: 'uploads/users/',
    PROMOTIONS: 'uploads/promotions/'
  }
};

// Configuraciones de cache (Redis)
export const CACHE_CONFIG = {
  KEYS: {
    RESTAURANT_LIST: 'restaurants:list',
    RESTAURANT_DETAIL: 'restaurant:',
    MENU_ITEMS: 'menu:restaurant:',
    USER_ORDERS: 'orders:user:',
    ACTIVE_PROMOTIONS: 'promotions:active'
  },
  TTL: {
    SHORT: 300,    // 5 minutos
    MEDIUM: 1800,  // 30 minutos
    LONG: 3600,    // 1 hora
    VERY_LONG: 86400 // 24 horas
  }
};

// Patrones de validación
export const VALIDATION_PATTERNS = {
  COLOMBIAN_PHONE: /^(\+57|57)?[1-9]\d{9}$/,
  EMAIL: /^[^\s@]+@[^\s@]+\.[^\s@]+$/,
  PASSWORD: /^(?=.*[a-zA-Z])(?=.*\d)(?=.*[!@#$%^&*])[a-zA-Z\d!@#$%^&*]/,
  POSTAL_CODE_COLOMBIA: /^\d{6}$/
};

// Re-exportar constantes de eventos de socket desde el archivo correcto
export {
  CONNECTION_EVENTS,
  ROOM_TYPES,
  ROOM_CONFIG,
  SYSTEM_EVENTS,
  FALLBACK_EVENTS,
  RECONNECTION_CONFIG,
  HEARTBEAT_CONFIG,
  HEARTBEAT_EVENTS,
  CONNECTION_STATES,
  LOCATION_EVENTS,
  ORDER_EVENTS,
  PAYMENT_EVENTS,
  COMMUNICATION_EVENTS,
  PRESENCE_EVENTS,
  PUSH_EVENTS,
  METRICS_EVENTS,
  SUPPORT_EVENTS,
  PROMOTION_EVENTS,
  INVENTORY_EVENTS,
  RATING_EVENTS,
  ADMIN_EVENTS,
  INTEGRATION_EVENTS,
  DEBUG_EVENTS
} from '../constants/socketEvents.js';
