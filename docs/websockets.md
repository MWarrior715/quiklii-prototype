# 🔌 WebSockets en Quiklii

## Librería
- [Socket.io v4](https://socket.io/)

## Uso actual
- Tracking de órdenes en tiempo real
- Notificaciones push para restaurantes y couriers

## Eventos principales
- `orderCreated`: cuando un cliente genera una orden
- `orderUpdated`: cuando cambia el estado de la orden
- `courierAssigned`: cuando un repartidor toma un pedido
- `notification`: mensajes genéricos (ej. promociones)

## Flujo ejemplo
Cliente → crea orden
Backend → emite orderCreated
Restaurante → recibe y acepta → emite orderUpdated
Courier → asignado → emite courierAssigned
Cliente → ve actualización en tiempo real

## Reglas
- Solo usar WebSocket para **eventos en tiempo real**.  
- ❌ No enviar grandes payloads (usar solo IDs y estados).  

## Próximos pasos
- Implementar rooms por restaurante y courier.
- Autenticación socket con JWT.
