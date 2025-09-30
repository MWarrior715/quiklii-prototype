# 🚀 Sistema de WebSockets - Quiklii

## 📋 Tabla de Contenidos
- [Introducción](#introducción)
- [Arquitectura](#arquitectura)
- [Eventos Disponibles](#eventos-disponibles)
- [Sistema de Rooms](#sistema-de-rooms)
- [Autenticación y Seguridad](#autenticación-y-seguridad)
- [Sistema de Fallback](#sistema-de-fallback)
- [Manejo de Reconexión](#manejo-de-reconexión)
- [Ejemplos de Uso](#ejemplos-de-uso)
- [Configuración](#configuración)
- [Monitoreo y Debugging](#monitoreo-y-debugging)
- [Tests](#tests)

## 🎯 Introducción

El sistema de WebSockets de Quiklii proporciona comunicaciones en tiempo real para la plataforma de delivery, permitiendo actualizaciones instantáneas de pedidos, ubicaciones, pagos y notificaciones.

### Características Principales
- ✅ **WebSockets con Socket.io** - Comunicación bidireccional en tiempo real
- ✅ **Sistema avanzado de rooms** - Organización eficiente de canales
- ✅ **Autenticación JWT integrada** - Seguridad robusta
- ✅ **Sistema de fallback SSE/Polling** - Respaldo para conectividad inestable
- ✅ **Reconexión automática** - Manejo inteligente de desconexiones
- ✅ **Monitoreo y métricas** - Estadísticas detalladas del sistema

## 🏗️ Arquitectura

### Componentes Principales

```
┌─────────────────────────────────────────────────────────┐
│                    WebSockets Layer                     │
├─────────────────────────────────────────────────────────┤
│  ┌─────────────┐  ┌─────────────┐  ┌─────────────┐     │
│  │   Socket    │  │    Room     │  │  Fallback   │     │
│  │   Events    │  │  Manager    │  │  Service    │     │
│  └─────────────┘  └─────────────┘  └─────────────┘     │
├─────────────────────────────────────────────────────────┤
│  ┌─────────────┐  ┌─────────────┐  ┌─────────────┐     │
│  │ Realtime    │  │ Reconnection│  │   Auth &    │     │
│  │  Service    │  │  Service    │  │  Security   │     │
│  └─────────────┘  └─────────────┘  └─────────────┘     │
├─────────────────────────────────────────────────────────┤
│                 Application Layer                       │
└─────────────────────────────────────────────────────────┘
```

### Servicios Implementados

1. **RealtimeService** - Servicio central de comunicaciones en tiempo real
2. **RoomManager** - Gestión avanzada de salas y canales
3. **FallbackService** - Sistema de respaldo SSE/Polling
4. **ReconnectionService** - Manejo inteligente de reconexiones

## 📡 Eventos Disponibles

### Eventos de Conexión
```javascript
// Cliente → Servidor
socket.emit('authenticate', { token: 'jwt-token' });
socket.emit('join_room', { roomName: 'order_123', roomType: 'order' });
socket.emit('leave_room', { roomName: 'order_123' });

// Servidor → Cliente
socket.on('authentication_success', (data) => { /* ... */ });
socket.on('authentication_failed', (error) => { /* ... */ });
socket.on('room_joined', (data) => { /* ... */ });
socket.on('room_left', (data) => { /* ... */ });
```

### Eventos de Pedidos
```javascript
// Eventos de estado de pedidos
socket.on('order_placed', (data) => { /* Nuevo pedido */ });
socket.on('order_confirmed', (data) => { /* Pedido confirmado */ });
socket.on('order_preparing', (data) => { /* En preparación */ });
socket.on('order_ready', (data) => { /* Listo para recoger */ });
socket.on('order_picked_up', (data) => { /* Recogido */ });
socket.on('order_on_way', (data) => { /* En camino */ });
socket.on('order_delivered', (data) => { /* Entregado */ });
socket.on('order_cancelled', (data) => { /* Cancelado */ });

// Suscripción a pedidos específicos
socket.emit('subscribe_to_order', { orderId: 'order-123' });
socket.emit('unsubscribe_from_order', { orderId: 'order-123' });
```

### Eventos de Pagos
```javascript
socket.on('payment_initiated', (data) => { /* Pago iniciado */ });
socket.on('payment_processing', (data) => { /* Procesando */ });
socket.on('payment_completed', (data) => { /* Completado */ });
socket.on('payment_failed', (data) => { /* Fallido */ });
socket.on('payment_cancelled', (data) => { /* Cancelado */ });
```

### Eventos de Ubicación
```javascript
// Actualizar ubicación
socket.emit('update_location', {
  orderId: 'order-123',
  location: 'Restaurante XYZ',
  coordinates: { latitude: 4.7110, longitude: -74.0721 }
});

// Recibir actualizaciones de ubicación
socket.on('delivery_location_updated', (data) => { /* ... */ });
socket.on('tracking_update', (data) => { /* ... */ });
```

### Eventos de Comunicación
```javascript
// Enviar mensaje
socket.emit('send_message', {
  orderId: 'order-123',
  message: '¿Dónde está mi pedido?',
  type: 'text'
});

// Recibir mensajes
socket.on('message_received', (data) => { /* ... */ });
```

## 🏠 Sistema de Rooms

### Tipos de Rooms Disponibles

| Tipo | Patrón | Descripción |
|------|--------|-------------|
| Usuario | `user_{userId}` | Sala personal del usuario |
| Pedido | `order_{orderId}` | Sala específica del pedido |
| Restaurante | `restaurant_{restaurantId}` | Sala del restaurante |
| Repartidor | `delivery_{deliveryPersonId}` | Sala personal del repartidor |
| Seguimiento | `order_{orderId}_tracking` | Seguimiento en tiempo real |

### Gestión de Rooms

```javascript
// Unirse a sala de pedido
socket.emit('join_room', {
  roomName: 'order_123',
  roomType: 'order_room'
});

// Unirse a sala de restaurante
socket.emit('join_room', {
  roomName: 'restaurant_456',
  roomType: 'restaurant_room'
});

// Salir de sala
socket.emit('leave_room', {
  roomName: 'order_123'
});
```

### Auto-unión por Rol

El sistema automáticamente une a los usuarios a salas según su rol:

- **Clientes**: `customers`, `user_{userId}`
- **Restaurantes**: `restaurants`, `user_{userId}`
- **Repartidores**: `delivery_persons`, `delivery_{userId}`, `user_{userId}`
- **Administradores**: `admin`, `system`, `user_{userId}`

## 🔐 Autenticación y Seguridad

### Autenticación JWT

Todos los clientes WebSocket deben autenticarse con un token JWT válido:

```javascript
const socket = io('http://localhost:3001', {
  auth: {
    token: 'your-jwt-token-here'
  }
});
```

### Configuración de Seguridad

- ✅ **Validación de origen** - Solo permite conexiones desde dominios autorizados
- ✅ **Timeouts configurables** - Límites de tiempo para conexiones y operaciones
- ✅ **Rate limiting** - Protección contra abuso
- ✅ **Limpieza automática** - Eliminación de conexiones inactivas

## 🔄 Sistema de Fallback

### Server-Sent Events (SSE)

Para clientes que no pueden mantener conexiones WebSocket persistentes:

```javascript
// Endpoint SSE
const eventSource = new EventSource('/api/v1/realtime/sse', {
  headers: {
    'Authorization': 'Bearer ' + token
  }
});

eventSource.onmessage = (event) => {
  const data = JSON.parse(event.data);
  console.log('Evento SSE:', data);
};
```

### Polling

Para situaciones donde ni WebSocket ni SSE están disponibles:

```javascript
// Registrar cliente para polling
const response = await fetch('/api/v1/realtime/poll', {
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
    'Authorization': 'Bearer ' + token
  },
  body: JSON.stringify({
    userId: 'user-123',
    clientId: 'client-456',
    interval: 5000 // 5 segundos
  })
});

// Polling manual
setInterval(async () => {
  const events = await fetch('/api/v1/realtime/events?userId=user-123');
  const data = await events.json();
  // Procesar eventos
}, 5000);
```

## 🔁 Manejo de Reconexión

### Configuración de Reconexión

El sistema implementa reconexión automática con backoff exponencial:

```javascript
const socket = io('http://localhost:3001', {
  auth: { token: 'jwt-token' },
  reconnection: true,
  reconnectionAttempts: 5,
  reconnectionDelay: 1000,
  reconnectionDelayMax: 30000,
  randomizationFactor: 0.5
});
```

### Eventos de Reconexión

```javascript
socket.on('reconnect_attempt', (attempt) => {
  console.log(`Intento de reconexión ${attempt}`);
});

socket.on('reconnect_success', () => {
  console.log('Reconexión exitosa');
});

socket.on('reconnect_failed', () => {
  console.log('Reconexión fallida, usando fallback');
});
```

## 💻 Ejemplos de Uso

### Ejemplo Básico - Cliente

```javascript
import { io } from 'socket.io-client';

class QuikliiRealtimeClient {
  constructor(token) {
    this.socket = io('http://localhost:3001', {
      auth: { token },
      transports: ['websocket', 'polling']
    });

    this.setupEventHandlers();
  }

  setupEventHandlers() {
    // Conexión
    this.socket.on('connect', () => {
      console.log('Conectado a Quiklii Real-time');
    });

    // Autenticación
    this.socket.on('authentication_success', (data) => {
      console.log('Usuario autenticado:', data.userId);
      this.subscribeToUserOrders();
    });

    // Eventos de pedidos
    this.socket.on('order_status_updated', (data) => {
      this.handleOrderUpdate(data);
    });

    // Ubicación de entrega
    this.socket.on('delivery_location_updated', (data) => {
      this.updateDeliveryLocation(data);
    });

    // Manejo de errores
    this.socket.on('connect_error', (error) => {
      console.error('Error de conexión:', error);
      this.handleFallback();
    });
  }

  // Suscribirse a pedidos del usuario
  subscribeToUserOrders() {
    this.socket.emit('join_room', {
      roomName: `user_${this.getCurrentUserId()}`,
      roomType: 'user_room'
    });
  }

  // Suscribirse a pedido específico
  subscribeToOrder(orderId) {
    this.socket.emit('subscribe_to_order', { orderId });
  }

  // Actualizar ubicación
  updateLocation(orderId, location, coordinates) {
    this.socket.emit('update_location', {
      orderId,
      location,
      coordinates
    });
  }

  // Enviar mensaje
  sendMessage(orderId, message) {
    this.socket.emit('send_message', {
      orderId,
      message,
      type: 'text'
    });
  }

  // Manejar fallback
  handleFallback() {
    // Cambiar a SSE o polling
    this.initializeSSE();
  }

  initializeSSE() {
    this.eventSource = new EventSource('/api/v1/realtime/sse', {
      headers: { 'Authorization': `Bearer ${this.token}` }
    });

    this.eventSource.onmessage = (event) => {
      const data = JSON.parse(event.data);
      this.handleRealtimeEvent(data);
    };
  }
}
```

### Ejemplo - Restaurante

```javascript
class RestaurantRealtimeClient extends QuikliiRealtimeClient {
  constructor(token, restaurantId) {
    super(token);
    this.restaurantId = restaurantId;
  }

  setupEventHandlers() {
    super.setupEventHandlers();

    // Eventos específicos de restaurante
    this.socket.on('restaurant_new_order', (data) => {
      this.handleNewOrder(data);
    });

    // Unirse a sala de restaurante
    this.socket.emit('join_room', {
      roomName: `restaurant_${this.restaurantId}`,
      roomType: 'restaurant_room'
    });
  }

  // Confirmar pedido
  confirmOrder(orderId) {
    this.socket.emit('order_confirmed', { orderId });
  }

  // Actualizar estado del pedido
  updateOrderStatus(orderId, status) {
    this.socket.emit('order_status_update', {
      orderId,
      status
    });
  }
}
```

## ⚙️ Configuración

### Variables de Entorno

```bash
# WebSocket Configuration
WEBSOCKET_CORS_ORIGIN=http://localhost:5173
WEBSOCKET_PING_TIMEOUT=60000
WEBSOCKET_PING_INTERVAL=25000
WEBSOCKET_MAX_BUFFER_SIZE=100000000

# JWT Configuration
JWT_SECRET=your-jwt-secret
JWT_EXPIRES_IN=24h

# Fallback Configuration
FALLBACK_SSE_ENABLED=true
FALLBACK_POLLING_ENABLED=true
FALLBACK_CLEANUP_INTERVAL=60000

# Reconnection Configuration
RECONNECTION_MAX_ATTEMPTS=5
RECONNECTION_INITIAL_DELAY=1000
RECONNECTION_MAX_DELAY=30000
```

### Configuración de Socket.io

```javascript
const io = new Server(server, {
  cors: {
    origin: process.env.WEBSOCKET_CORS_ORIGIN,
    methods: ["GET", "POST"],
    credentials: true
  },
  pingTimeout: parseInt(process.env.WEBSOCKET_PING_TIMEOUT),
  pingInterval: parseInt(process.env.WEBSOCKET_PING_INTERVAL),
  maxHttpBufferSize: parseInt(process.env.WEBSOCKET_MAX_BUFFER_SIZE)
});
```

## 📊 Monitoreo y Debugging

### Endpoints de Estadísticas

```bash
# Estadísticas generales del sistema
GET /api/v1/realtime/stats

# Respuesta:
{
  "success": true,
  "data": {
    "connectedUsers": 150,
    "totalSockets": 180,
    "activeOrders": 45,
    "roomStats": {
      "totalRooms": 200,
      "roomsByType": {
        "user_room": 150,
        "order_room": 45,
        "restaurant_room": 5
      }
    },
    "fallbackStats": {
      "sseClients": 10,
      "pollingClients": 5
    },
    "reconnectionStats": {
      "activeReconnections": 3,
      "failedConnections": 1
    }
  }
}
```

### Logging

El sistema incluye logging detallado para debugging:

```javascript
// Habilitar logging detallado
process.env.DEBUG = 'socket.io:*';

// Logs incluyen:
// - Conexiones y desconexiones
// - Unión/salida de rooms
// - Eventos enviados/recibidos
// - Errores de autenticación
// - Estadísticas de rendimiento
```

### Métricas de Performance

```javascript
// Tiempo de respuesta promedio
const avgResponseTime = realtimeService.getAverageResponseTime();

// Uso de memoria
const memoryUsage = process.memoryUsage();

// Conexiones por minuto
const connectionsPerMinute = realtimeService.getConnectionRate();
```

## 🧪 Tests

### Ejecutar Tests

```bash
# Tests de integración WebSocket
npm test -- --testPathPattern=websockets.test.js

# Tests con cobertura
npm test -- --coverage --testPathPattern=websockets
```

### Tests Incluidos

- ✅ **Conexión y autenticación** - Validación de tokens JWT
- ✅ **Gestión de rooms** - Unión, salida y permisos
- ✅ **Eventos en tiempo real** - Pedidos, pagos, ubicaciones
- ✅ **Sistema de fallback** - SSE y polling
- ✅ **Manejo de reconexión** - Backoff exponencial
- ✅ **Manejo de errores** - Casos límite y recuperación
- ✅ **Performance** - Múltiples clientes y carga

## 🚨 Solución de Problemas

### Problemas Comunes

**1. Error de autenticación**
```javascript
// Verificar token JWT
const token = localStorage.getItem('quiklii-token');
if (!token) {
  // Redirigir a login
  window.location.href = '/login';
}
```

**2. Conexión rechazada**
```javascript
// Verificar configuración CORS
const socket = io({
  auth: { token },
  transports: ['websocket', 'polling'] // Incluir polling como fallback
});
```

**3. Eventos no recibidos**
```javascript
// Verificar suscripción a rooms
socket.emit('join_room', {
  roomName: `user_${userId}`,
  roomType: 'user_room'
});
```

**4. Problemas de rendimiento**
```javascript
// Limitar suscripciones
// No suscribirse a todos los pedidos, solo a los relevantes
socket.emit('subscribe_to_order', { orderId: currentOrderId });
```

## 📚 Recursos Adicionales

- [Socket.io Documentation](https://socket.io/docs/)
- [JWT Authentication Guide](https://jwt.io/introduction/)
- [Server-Sent Events Guide](https://developer.mozilla.org/en-US/docs/Web/API/Server-sent_events)
- [WebSocket Security Best Practices](https://owasp.org/www-community/attacks/WebSocket)

## 🤝 Contribución

Para contribuir al sistema de WebSockets:

1. **Agregar nuevos eventos** en `constants/socketEvents.js`
2. **Crear manejadores** en `realtimeService.js`
3. **Agregar tests** en `tests/integration/websockets.test.js`
4. **Actualizar documentación** en este README

## 📞 Soporte

Para soporte técnico o reportar problemas:

- 📧 **Email**: soporte@quiklii.com
- 💬 **Chat**: Integrado en la plataforma
- 📋 **Issues**: GitHub Issues
- 📚 **Documentación**: Centro de ayuda

---

**Quiklii** - Plataforma de delivery más rápida de Colombia 🚀