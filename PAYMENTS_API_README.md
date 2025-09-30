# 💳 API de Pagos - Quiklii

## 📋 Introducción

La API de Pagos de Quiklii implementa un sistema completo de procesamiento de pagos con integración a proveedores externos como Wompi (Colombia) y Stripe, incluyendo manejo de webhooks, reintentos automáticos y estados de pago.

## 🏗️ Arquitectura

```
┌─────────────────┐    ┌─────────────────┐    ┌─────────────────┐
│   Frontend      │    │   Payment API   │    │   Proveedores   │
│   (Cliente)     │◄──►│   Controller    │◄──►│   (Wompi/Stripe)│
└─────────────────┘    └─────────────────┘    └─────────────────┘
         │                       │                       │
         │                       │                       │
         ▼                       ▼                       ▼
┌─────────────────┐    ┌─────────────────┐    ┌─────────────────┐
│   Payment       │    │   Payment       │    │   Webhook       │
│   Service       │    │   Retry Service │    │   Handler       │
└─────────────────┘    └─────────────────┘    └─────────────────┘
```

## 🚀 Configuración

### Variables de Entorno

```bash
# Wompi (Sandbox)
WOMPI_SANDBOX_URL=https://sandbox.wompi.co/v1
WOMPI_PUBLIC_KEY=pub_test_xxxxxxxxxxxxxxxxxxxxxxxx
WOMPI_PRIVATE_KEY=prv_test_xxxxxxxxxxxxxxxxxxxxxxxx
WOMPI_WEBHOOK_SECRET=whsec_test_xxxxxxxxxxxxxxxxxxxxxxxx

# URLs de Frontend
FRONTEND_URL=http://localhost:3000

# Configuración de Reintentos
MAX_PAYMENT_RETRIES=3
RETRY_DELAY_MINUTES=5,30,120
```

### Instalación de Dependencias

```bash
cd backend
npm install express-rate-limit
```

## 📖 Endpoints Principales

### 1. Crear Pago

**POST** `/api/v1/payments`

Crea un nuevo intento de pago para una orden específica.

**Headers:**
```
Authorization: Bearer <token>
Content-Type: application/json
```

**Body:**
```json
{
  "orderId": "123e4567-e89b-12d3-a456-426614174000",
  "paymentMethod": "card",
  "provider": "wompi"
}
```

**Respuesta Exitosa (201):**
```json
{
  "success": true,
  "data": {
    "paymentId": "123e4567-e89b-12d3-a456-426614174001",
    "transactionId": "wompi_txn_123456789",
    "redirectUrl": "https://checkout.wompi.co/l/wompi_txn_123456789",
    "status": "pending",
    "provider": "wompi"
  }
}
```

**Métodos de Pago Soportados:**
- `cash` - Pago en efectivo
- `card` - Tarjeta de crédito/débito
- `nequi` - Nequi wallet
- `daviplata` - DaviPlata
- `mercadopago` - MercadoPago
- `wompi` - Wompi gateway
- `stripe` - Stripe gateway

### 2. Obtener Pagos del Usuario

**GET** `/api/v1/payments`

Obtiene todos los pagos del usuario autenticado con paginación.

**Headers:**
```
Authorization: Bearer <token>
```

**Query Parameters:**
- `page` (opcional): Número de página (default: 1)
- `limit` (opcional): Elementos por página (default: 10, max: 100)

**Respuesta Exitosa (200):**
```json
{
  "success": true,
  "data": {
    "payments": [
      {
        "paymentId": "123e4567-e89b-12d3-a456-426614174001",
        "orderId": "123e4567-e89b-12d3-a456-426614174000",
        "amount": 25000.00,
        "currency": "COP",
        "status": "completed",
        "paymentMethod": "card",
        "provider": "wompi",
        "transactionId": "wompi_txn_123456789",
        "createdAt": "2024-01-15T10:30:00Z",
        "restaurantName": "Restaurante El Sabor"
      }
    ],
    "pagination": {
      "page": 1,
      "limit": 10,
      "total": 25,
      "pages": 3
    }
  }
}
```

### 3. Obtener Estado de Pago

**GET** `/api/v1/payments/{paymentId}`

Obtiene el estado detallado de un pago específico.

**Headers:**
```
Authorization: Bearer <token>
```

**Respuesta Exitosa (200):**
```json
{
  "success": true,
  "data": {
    "paymentId": "123e4567-e89b-12d3-a456-426614174001",
    "orderId": "123e4567-e89b-12d3-a456-426614174000",
    "amount": 25000.00,
    "currency": "COP",
    "status": "completed",
    "paymentMethod": "card",
    "provider": "wompi",
    "transactionId": "wompi_txn_123456789",
    "createdAt": "2024-01-15T10:30:00Z",
    "processedAt": "2024-01-15T10:35:00Z"
  }
}
```

### 4. Reintentar Pago

**POST** `/api/v1/payments/{paymentId}/retry`

Reintenta un pago que ha fallado, alternando automáticamente al siguiente proveedor disponible.

**Headers:**
```
Authorization: Bearer <token>
```

**Respuesta Exitosa (200):**
```json
{
  "success": true,
  "data": {
    "paymentId": "123e4567-e89b-12d3-a456-426614174001",
    "transactionId": "wompi_txn_987654321",
    "redirectUrl": "https://checkout.wompi.co/l/wompi_txn_987654321",
    "status": "pending"
  }
}
```

### 5. Webhook de Wompi

**POST** `/api/v1/payments/webhook/wompi`

Endpoint para recibir notificaciones de Wompi sobre cambios en el estado de transacciones.

**Headers:**
```
x-wompi-signature: <firma_hmac_sha256>
Content-Type: application/json
```

**Body (ejemplo):**
```json
{
  "transaction": {
    "id": "wompi_txn_123456789",
    "reference": "QUIKLII_123e4567_1705314600000",
    "status": "APPROVED",
    "amount_in_cents": 2500000,
    "currency": "COP",
    "payment_method": {
      "type": "CARD"
    },
    "customer_email": "cliente@example.com",
    "created_at": "2024-01-15T10:30:00Z",
    "finalized_at": "2024-01-15T10:35:00Z"
  },
  "event": "transaction.updated"
}
```

**Respuesta Exitosa (200):**
```json
{
  "success": true,
  "message": "Webhook processed successfully",
  "processingTime": "150ms",
  "transactionId": "wompi_txn_123456789",
  "event": "transaction.updated"
}
```

### 6. Estadísticas de Pagos (Admin)

**GET** `/api/v1/payments/stats`

Obtiene estadísticas generales de pagos (solo para administradores).

**Headers:**
```
Authorization: Bearer <token_admin>
```

**Respuesta Exitosa (200):**
```json
{
  "success": true,
  "data": {
    "stats": [
      {
        "status": "completed",
        "provider": "wompi",
        "paymentMethod": "card",
        "count": 150,
        "total": 3750000.00
      }
    ],
    "summary": {
      "totalPayments": 200,
      "totalRevenue": 5000000.00
    }
  }
}
```

## 🔄 Estados de Pago

| Estado | Descripción | Acción |
|--------|-------------|---------|
| `pending` | Pago iniciado, esperando confirmación | Redirigir a proveedor |
| `processing` | Pago siendo procesado por el proveedor | Esperar webhook |
| `completed` | Pago exitoso | Actualizar orden como pagada |
| `failed` | Pago rechazado o fallido | Reintentar o contactar usuario |
| `cancelled` | Pago cancelado por el usuario | No reintentar |
| `refunded` | Pago devuelto | Actualizar inventario |

## 🔁 Sistema de Reintentos

### Configuración
- **Máximo de reintentos:** 3
- **Delays entre reintentos:** 5min, 30min, 2hrs
- **Cambio de proveedor:** Automático en cada reintento

### Flujo de Reintentos
1. Pago falla → Estado `failed`
2. Sistema programa reintento con delay
3. Se alterna al siguiente proveedor disponible
4. Si todos los proveedores fallan → Requiere intervención manual

### Monitoreo de Reintentos
```javascript
// Obtener estadísticas de reintentos
const stats = await paymentRetryService.getRetryStats();
console.log(stats);
// {
//   totalRetries: 45,
//   successfulRetries: 38,
//   successRate: 84.44,
//   statsByStatus: [...]
// }
```

## 🛡️ Seguridad

### Validación de Webhooks
- Verificación de firma HMAC-SHA256
- Validación de estructura de payload
- Rate limiting específico para webhooks

### Rate Limiting
- **Pagos:** 20 intentos por hora por IP
- **Webhooks:** 100 requests por minuto por IP
- **Estadísticas:** 10 consultas por hora por IP

### Autenticación
- JWT requerido para todos los endpoints
- Verificación de propiedad de recursos
- Autorización por roles para endpoints administrativos

## 🧪 Testing

### Ejecutar Tests
```bash
cd backend
npm test -- --testPathPattern=payments.test.js
```

### Tests Incluidos
- ✅ Creación de pagos
- ✅ Obtención de pagos con paginación
- ✅ Reintentos de pagos fallidos
- ✅ Procesamiento de webhooks
- ✅ Validación de autenticación
- ✅ Manejo de errores
- ✅ Rate limiting
- ✅ Flujo completo de pago

### Ejemplo de Test
```javascript
describe('POST /api/v1/payments', () => {
  it('should create a new payment', async () => {
    const response = await request(app)
      .post('/api/v1/payments')
      .set('Authorization', `Bearer ${authToken}`)
      .send({
        orderId: testOrder.id,
        paymentMethod: 'card',
        provider: 'wompi'
      })
      .expect(201);

    expect(response.body.success).toBe(true);
    expect(response.body.data).toHaveProperty('paymentId');
    expect(response.body.data).toHaveProperty('redirectUrl');
  });
});
```

## 🚨 Manejo de Erros

### Códigos de Error Comunes

| Código | Error | Descripción |
|--------|-------|-------------|
| 400 | `INVALID_PAYMENT_DATA` | Datos de pago inválidos |
| 401 | `UNAUTHORIZED` | Token inválido o expirado |
| 403 | `FORBIDDEN` | No autorizado para este recurso |
| 404 | `PAYMENT_NOT_FOUND` | Pago no encontrado |
| 404 | `ORDER_NOT_FOUND` | Orden no encontrada |
| 429 | `RATE_LIMIT_EXCEEDED` | Límite de rate excedido |
| 500 | `INTERNAL_SERVER_ERROR` | Error interno del servidor |

### Ejemplo de Respuesta de Error
```json
{
  "success": false,
  "error": "Order not found",
  "code": "ORDER_NOT_FOUND",
  "timestamp": "2024-01-15T10:30:00Z"
}
```

## 🔧 Monitoreo y Logs

### Logs Importantes
```javascript
// Crear pago
console.log(`🔄 Procesando pago ${payment.id} con ${payment.provider}`);

// Webhook recibido
console.log(`🔔 Webhook de ${provider} para transacción ${transactionId}`);

// Reintento
console.log(`🔄 Reintentando pago ${payment.id} (intento ${retryCount + 1})`);

// Error
console.error(`❌ Error procesando pago ${payment.id}:`, error);
```

### Métricas a Monitorear
- Tasa de éxito de pagos por proveedor
- Tiempo promedio de procesamiento
- Número de reintentos exitosos
- Errores por tipo de pago

## 📞 Soporte

Para problemas con la integración de pagos:

1. **Verificar logs** del servidor para errores específicos
2. **Probar con datos de sandbox** antes de producción
3. **Revisar configuración** de variables de entorno
4. **Contactar al equipo** con logs y códigos de error

**Email:** dev@quiklii.com
**Teléfono:** +57 1 234 5678

---

*Documentación generada automáticamente para Quiklii FASE3 - Semana 1*