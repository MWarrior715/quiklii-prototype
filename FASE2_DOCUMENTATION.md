# 🛡️ Quiklii — Fase 2: Autenticación avanzada y flujo de órdenes

## 🎯 Introducción y Objetivos Principales

Esta fase implementa un sistema robusto de autenticación y gestión de órdenes, fortaleciendo la seguridad y funcionalidad del backend y frontend de Quiklii.

### Objetivos principales
- **Autenticación JWT con roles:** Implementar JWT con roles específicos (cliente, restaurante, repartidor, admin)
- **CRUD completo de órdenes:** Gestionar órdenes con OrderItems y MenuItems, incluyendo estados y actualizaciones en tiempo real
- **Modelo de pagos:** Definir estructura de pagos e investigar integración con Wompi/Stripe
- **Testing exhaustivo:** Alcanzar 80% de cobertura de código usando Jest en backend
- **Frontend seguro:** Integrar AuthContext y rutas privadas para protección de componentes
- **Documentación completa:** Actualizar documentación técnica reflejando todas las funcionalidades implementadas

## 🔐 Flujo JWT Completo

### Diagrama de Secuencia de Autenticación

```
Cliente                    Servidor
   |                           |
   |  POST /api/v1/auth/register
   |  (email, password, role)  |
   |-------------------------->|
   |                           |
   |  Status: 201 Created      |
   |<--------------------------|
   |                           |
   |  POST /api/v1/auth/login   |
   |  (email, password)        |
   |-------------------------->|
   |                           |
   |  Status: 200 OK           |
   |  Set-Cookie: refreshToken |
   |  Body: {accessToken}      |
   |<--------------------------|
   |                           |
   |  GET /api/protected       |
   |  Authorization: Bearer    |
   |-------------------------->|
   |                           |
   |  Status: 200 OK           |
   |<--------------------------|
   |                           |
   |  POST /api/v1/auth/refresh|
   |  Cookie: refreshToken     |
   |-------------------------->|
   |                           |
   |  Status: 200 OK           |
   |  Body: {newAccessToken}   |
   |<--------------------------|
   |                           |
   |  POST /api/v1/auth/logout |
   |  Authorization: Bearer    |
   |-------------------------->|
   |                           |
   |  Status: 200 OK           |
   |  Clear-Cookie: refreshToken|
   |<--------------------------|
```

### Roles y Permisos

- **Cliente (customer):** Acceso a pedidos propios, perfil, pagos
- **Propietario de restaurante (restaurant_owner):** Gestión de pedidos, menú, restaurante
- **Repartidor (delivery_person):** Actualización de estados de entrega
- **Admin:** Acceso completo a todas las funcionalidades

### Seguridad Implementada

- **Rate limiting:** 5 intentos/15min para auth, 50 órdenes/hora, 20 pagos/hora
- **Helmet:** Headers de seguridad HTTP
- **bcryptjs:** Hashing de contraseñas
- **Validaciones:** Input sanitization con Joi y express-validator
- **Refresh tokens:** En httpOnly cookies para mayor seguridad

## 📡 API Endpoints

### Autenticación (`/api/v1/auth`)

#### Registro
```http
POST /api/v1/auth/register
Content-Type: application/json

{
  "email": "user@example.com",
  "password": "securePass123",
  "role": "customer",
  "firstName": "Juan",
  "lastName": "Pérez",
  "phone": "+57 300 123 4567"
}
```

**curl:**
```bash
curl -X POST http://localhost:3001/api/v1/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "email": "user@example.com",
    "password": "securePass123",
    "role": "customer",
    "firstName": "Juan",
    "lastName": "Pérez",
    "phone": "+57 300 123 4567"
  }'
```

#### Login
```http
POST /api/v1/auth/login
Content-Type: application/json

{
  "email": "user@example.com",
  "password": "securePass123"
}
```

**curl:**
```bash
curl -X POST http://localhost:3001/api/v1/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email": "user@example.com", "password": "securePass123"}'
```

#### Verificar Autenticación
```http
GET /api/v1/auth/verify
Authorization: Bearer <access_token>
```

**curl:**
```bash
curl -X GET http://localhost:3001/api/v1/auth/verify \
  -H "Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
```

#### Refresh Token
```http
POST /api/v1/auth/refresh
```

**curl (con cookie):**
```bash
curl -X POST http://localhost:3001/api/v1/auth/refresh \
  -H "Cookie: refreshToken=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
```

#### Logout
```http
POST /api/v1/auth/logout
Authorization: Bearer <access_token>
```

**curl:**
```bash
curl -X POST http://localhost:3001/api/v1/auth/logout \
  -H "Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
```

### Órdenes (`/api/v1/orders`)

#### Crear Orden
```http
POST /api/v1/orders
Authorization: Bearer <access_token>
Content-Type: application/json

{
  "restaurantId": "uuid-restaurant",
  "items": [
    {
      "menuItemId": "uuid-menuitem",
      "quantity": 2,
      "specialInstructions": "Sin cebolla"
    }
  ],
  "deliveryAddress": {
    "street": "Calle 123 #45-67",
    "city": "Bogotá",
    "coordinates": {
      "lat": 4.6097,
      "lng": -74.0817
    }
  }
}
```

**curl:**
```bash
curl -X POST http://localhost:3001/api/v1/orders \
  -H "Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..." \
  -H "Content-Type: application/json" \
  -d '{
    "restaurantId": "uuid-restaurant",
    "items": [
      {
        "menuItemId": "uuid-menuitem",
        "quantity": 2,
        "specialInstructions": "Sin cebolla"
      }
    ],
    "deliveryAddress": {
      "street": "Calle 123 #45-67",
      "city": "Bogotá",
      "coordinates": {"lat": 4.6097, "lng": -74.0817}
    }
  }'
```

#### Listar Órdenes del Usuario
```http
GET /api/v1/orders?page=1&limit=10
Authorization: Bearer <access_token>
```

**curl:**
```bash
curl -X GET "http://localhost:3001/api/v1/orders?page=1&limit=10" \
  -H "Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
```

#### Actualizar Estado de Orden (Restaurante/Repartidor)
```http
PUT /api/v1/orders/{orderId}/status
Authorization: Bearer <access_token>
Content-Type: application/json

{
  "status": "preparing"
}
```

**curl:**
```bash
curl -X PUT http://localhost:3001/api/v1/orders/uuid-order/status \
  -H "Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..." \
  -H "Content-Type: application/json" \
  -d '{"status": "preparing"}'
```

#### Iniciar Pago
```http
POST /api/v1/orders/{orderId}/payment/initiate
Authorization: Bearer <access_token>
Content-Type: application/json

{
  "paymentMethod": "card",
  "cardDetails": {
    "number": "4111111111111111",
    "expiryMonth": "12",
    "expiryYear": "2025",
    "cvv": "123"
  }
}
```

**curl:**
```bash
curl -X POST http://localhost:3001/api/v1/orders/uuid-order/payment/initiate \
  -H "Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..." \
  -H "Content-Type: application/json" \
  -d '{
    "paymentMethod": "card",
    "cardDetails": {
      "number": "4111111111111111",
      "expiryMonth": "12",
      "expiryYear": "2025",
      "cvv": "123"
    }
  }'
```

### Usuarios (`/api/v1/users`)

#### Obtener Perfil
```http
GET /api/v1/users/profile
Authorization: Bearer <access_token>
```

**curl:**
```bash
curl -X GET http://localhost:3001/api/v1/users/profile \
  -H "Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
```

#### Actualizar Perfil
```http
PATCH /api/v1/users/profile
Authorization: Bearer <access_token>
Content-Type: application/json

{
  "firstName": "Juan Carlos",
  "phone": "+57 300 987 6543"
}
```

**curl:**
```bash
curl -X PATCH http://localhost:3001/api/v1/users/profile \
  -H "Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..." \
  -H "Content-Type: application/json" \
  -d '{"firstName": "Juan Carlos", "phone": "+57 300 987 6543"}'
```

## 🧪 Guía de Testing Detallada

### Configuración de Tests

#### Backend (Jest)
```bash
cd backend
npm install --save-dev jest supertest @types/jest
```

**jest.config.js:**
```javascript
export default {
  testEnvironment: 'node',
  collectCoverageFrom: [
    'src/**/*.js',
    '!src/**/*.test.js',
    '!src/**/index.js'
  ],
  coverageDirectory: 'coverage',
  coverageReporters: ['text', 'lcov', 'html'],
  coverageThreshold: {
    global: {
      branches: 80,
      functions: 80,
      lines: 80,
      statements: 80
    }
  },
  setupFilesAfterEnv: ['<rootDir>/src/tests/setup.js']
};
```

#### Frontend (Vitest)
```bash
cd frontend
npm install --save-dev vitest @testing-library/react @testing-library/jest-dom jsdom
```

**vitest.config.ts:**
```typescript
import { defineConfig } from 'vitest/config';

export default defineConfig({
  test: {
    environment: 'jsdom',
    setupFiles: ['./src/test/setup.ts'],
    coverage: {
      reporter: ['text', 'html', 'lcov'],
      exclude: ['node_modules/', 'src/test/']
    }
  }
});
```

### Ejecutar Tests

#### Backend
```bash
# Ejecutar todos los tests
npm test

# Ejecutar con cobertura
npm run test:coverage

# Ejecutar tests específicos
npm test -- authController.test.js

# Ejecutar tests de integración
npm test -- --testPathPattern=integration
```

#### Frontend
```bash
# Ejecutar todos los tests
npm test

# Ejecutar con cobertura
npm run test:coverage

# Ejecutar en modo watch
npm run test:watch
```

### Interpretar Cobertura

La cobertura se mide en cuatro métricas:

- **Statements:** Porcentaje de declaraciones ejecutadas
- **Branches:** Porcentaje de ramas condicionales cubiertas
- **Functions:** Porcentaje de funciones llamadas
- **Lines:** Porcentaje de líneas ejecutadas

**Ejemplo de reporte:**
```
-------------------|---------|----------|---------|---------|-------------------
File               | % Stmts | % Branch | % Funcs | % Lines | Uncovered Line #s
-------------------|---------|----------|---------|---------|-------------------
All files          |     85  |     78   |     92  |     84  |
 src/controllers/  |     90  |     85   |     95  |     88  |
  authController.js|     92  |     88   |     100 |     90  | 45-47
  orderController.js|    85  |     75   |     90  |     82  | 120-125, 200
-------------------|---------|----------|---------|---------|-------------------
```

**Objetivos de cobertura:**
- Backend: 80% mínimo en todas las métricas
- Frontend: 70% mínimo en statements y functions

### Estrategias para Mejorar Cobertura

1. **Tests unitarios:** Probar funciones individuales con mocks
2. **Tests de integración:** Probar flujos completos de API
3. **Tests de error:** Cubrir casos de error y edge cases
4. **Tests de autenticación:** Verificar middleware y permisos

## 🔄 CI/CD Pipeline

### GitHub Actions Workflows

#### Backend Tests (`.github/workflows/backend-tests.yml`)
```yaml
name: Backend Tests and Lint

on:
  push:
    branches: [ main ]
  pull_request:
    branches: [ main ]

jobs:
  test:
    runs-on: ubuntu-latest
    steps:
    - name: Checkout code
      uses: actions/checkout@v4

    - name: Setup Node.js
      uses: actions/setup-node@v4
      with:
        node-version: '18'
        cache: 'npm'
        cache-dependency-path: backend/package-lock.json

    - name: Install dependencies
      run: npm install
      working-directory: backend

    - name: Run ESLint
      run: npx eslint src/
      working-directory: backend

    - name: Run tests with coverage
      run: npm run test:coverage
      working-directory: backend

    - name: Upload coverage reports
      uses: codecov/codecov-action@v3
      with:
        directory: ./backend/coverage
        fail_ci_if_error: false
```

#### Frontend Build (`.github/workflows/frontend-build.yml`)
```yaml
name: Frontend Build

on:
  push:
    branches: [ main ]
  pull_request:
    branches: [ main ]

jobs:
  build:
    runs-on: ubuntu-latest
    steps:
    - name: Checkout code
      uses: actions/checkout@v4

    - name: Setup Node.js
      uses: actions/setup-node@v4
      with:
        node-version: '18'
        cache: 'npm'
        cache-dependency-path: frontend/package-lock.json

    - name: Install dependencies
      run: npm install
      working-directory: frontend

    - name: Run lint
      run: npm run lint
      working-directory: frontend

    - name: Run tests with coverage
      run: npm run test:coverage
      working-directory: frontend

    - name: Build
      run: npm run build
      working-directory: frontend

    - name: Upload coverage reports
      uses: codecov/codecov-action@v3
      with:
        directory: ./frontend/coverage
        fail_ci_if_error: false
```

### Proceso de CI/CD

1. **Push/PR Trigger:** Se ejecuta en push o PR a main
2. **Setup:** Instalar Node.js 18 y cache de npm
3. **Install:** Instalar dependencias
4. **Lint:** Ejecutar ESLint para verificar código
5. **Test:** Ejecutar tests con cobertura
6. **Build:** Construir aplicación (frontend)
7. **Upload:** Subir reportes de cobertura a Codecov

### Monitoreo y Alertas

- **Codecov:** Reportes de cobertura automática
- **GitHub Checks:** Estado de CI en PRs
- **Notificaciones:** Alertas en fallos de build
- **Dashboards:** Métricas de cobertura y calidad de código

## 📊 Modelos de Datos

### User
```javascript
{
  id: UUID,
  email: String (unique),
  password: String (hashed),
  firstName: String,
  lastName: String,
  phone: String,
  role: Enum('customer', 'restaurant_owner', 'delivery_person', 'admin'),
  addresses: Array,
  createdAt: Date,
  updatedAt: Date
}
```

### Order
```javascript
{
  id: UUID,
  userId: UUID,
  restaurantId: UUID,
  status: Enum('pending', 'confirmed', 'preparing', 'ready', 'delivered', 'cancelled'),
  totalAmount: Decimal,
  deliveryAddress: Object,
  items: Array<OrderItem>,
  createdAt: Date,
  updatedAt: Date
}
```

### Payment
```javascript
{
  id: UUID,
  orderId: UUID,
  amount: Decimal,
  method: Enum('card', 'cash', 'transfer'),
  status: Enum('pending', 'completed', 'failed', 'refunded'),
  transactionId: String,
  createdAt: Date
}
```

## ⚡ Optimizaciones Frontend y Correcciones Técnicas

### Mejoras en Hook useRestaurants (20/09/2025)

Se han implementado importantes optimizaciones en el hook [`useRestaurants.ts`](frontend/src/hooks/useRestaurants.ts:1) para resolver problemas de linting y mejorar el rendimiento:

#### 🐛 Problema Principal Resuelto - Error ESLint en useMemo

**Problema identificado:**
- Error de ESLint por dependencia faltante en [`useMemo`](frontend/src/hooks/useRestaurants.ts:37)
- El [`useMemo`](frontend/src/hooks/useRestaurants.ts:37) retornaba directamente el objeto `params` pero las dependencias eran las propiedades individuales
- Esto causaba inconsistencias entre el valor memoizado y las dependencias declaradas

**Solución implementada:**
```typescript
// Antes (problemático):
const memoizedParams = useMemo(() => params, [
  params.category, params.minRating, // etc.
]);

// Después (corregido):
const memoizedParams = useMemo(() => ({
  category: params.category,
  minRating: params.minRating,
  search: params.search,
  sortBy: params.sortBy,
  order: params.order,
  limit: params.limit,
  page: params.page
}), [
  params.category,
  params.minRating,
  params.search,
  params.sortBy,
  params.order,
  params.limit,
  params.page
]);
```

#### ⚡ Optimizaciones Adicionales Implementadas

**1. Eliminación de `useMemo` innecesarios para valores primitivos**

En [`useTopRatedRestaurants`](frontend/src/hooks/useRestaurants.ts:110):
```typescript
// Antes:
const memoizedLimit = useMemo(() => limit, [limit]);

// Después (simplificado):
const memoizedLimit = limit; // No necesario memoizar primitivos
```

En [`useRestaurantsByCategory`](frontend/src/hooks/useRestaurants.ts:151):
```typescript
// Antes:
const memoizedCategory = useMemo(() => category, [category]);
const memoizedLimit = useMemo(() => limit, [limit]);

// Después (simplificado):
const memoizedCategory = category;
const memoizedLimit = limit;
```

#### 📈 Impacto Positivo de las Mejoras

**Cumplimiento de Estándares:**
- ✅ Eliminación de errores de ESLint
- ✅ Código más limpio y mantenible
- ✅ Mejores prácticas de React Hooks

**Rendimiento:**
- 🚀 Reducción de cálculos innecesarios en valores primitivos
- 🚀 Memoización correcta de objetos complejos
- 🚀 Prevención de re-renders innecesarios

**Mantenibilidad:**
- 📝 Código más legible y simple
- 📝 Menor complejidad cognitiva
- 📝 Mejor debugging y seguimiento de dependencias

#### 🔧 Detalles Técnicos de la Implementación

**Archivos modificados:**
- [`frontend/src/hooks/useRestaurants.ts`](frontend/src/hooks/useRestaurants.ts:1)

**Funciones optimizadas:**
- [`useRestaurants`](frontend/src/hooks/useRestaurants.ts:25) - Corrección principal del `useMemo`
- [`useTopRatedRestaurants`](frontend/src/hooks/useRestaurants.ts:110) - Simplificación de memoización
- [`useRestaurantsByCategory`](frontend/src/hooks/useRestaurants.ts:151) - Simplificación de memoización

**Métricas de mejora:**
- Líneas de código reducidas: ~6 líneas menos
- Errores de linting: 0 (previamente 1 error crítico)
- Complejidad ciclomática: Reducida en funciones helper

## 🚀 Próximos Pasos

1. Integración completa con Wompi/Stripe para pagos
2. Implementación de WebSockets para actualizaciones en tiempo real
3. Panel de administración para restaurantes
4. Optimización de rendimiento y caching
5. Migración a PostgreSQL en producción
6. Implementación de logging avanzado y monitoreo

Esta documentación refleja el estado actual de la implementación de Fase 2, proporcionando una guía completa para desarrollo, testing y despliegue de las funcionalidades de autenticación y gestión de órdenes.
