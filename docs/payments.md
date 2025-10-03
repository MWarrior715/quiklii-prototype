# 💳 Pagos en Quiklii

## Integración
- **Proveedor principal (Colombia):** Wompi
- **Alternativa global:** Stripe (sandbox)

## Flujo de pago
1. Cliente confirma el carrito → `POST /orders`
2. Se genera un intento de pago → `POST /payments/initiate`
3. Wompi procesa el pago
4. Webhook `/payments/webhook` recibe confirmación
5. Orden actualiza estado a:
   - `pending` → `paid` → `confirmed`

## Estados de pago
- `pending`: creado, sin procesar
- `paid`: pagado, confirmado por Wompi
- `failed`: error o cancelado

## Reglas
- Todos los pagos se validan por **webhook** (no confiar en frontend).
- Orden no pasa a `confirmed` hasta recibir confirmación oficial.

## Próximos pasos
- Implementar reintentos automáticos de webhook.
- Añadir soporte para Stripe en entorno internacional.
