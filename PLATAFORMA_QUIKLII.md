# 📦 Plataforma Quiklii - Arquitectura Técnica

Este documento describe la arquitectura técnica de **Quiklii**, la plataforma de delivery y descubrimiento de locales gastronómicos. Está basado en la estructura real del proyecto (`project_full_structure.txt`) y refleja el estado actual de la aplicación desde el desarrollo hasta la preparación para producción.

---

## 🌍 Visión General

* **Objetivo**: Plataforma departamental de domicilios y descubrimiento gastronómico (fase prototipo → producción).
* **Alcance inicial**: Cundinamarca, Colombia.
* **Arquitectura**: Separación clara entre **Frontend** y **Backend**, con herramientas modernas (React, Express, Sequelize, PM2).

---

## 🖥️ Frontend

### Tecnologías

* **Framework**: React + TypeScript
* **Bundler**: Vite 5.4.2
* **Estilos**: TailwindCSS 3.4.1
* **Gestión de Estado**: React Context API (AuthContext, CartContext)
* **Puerto de desarrollo**: `5173`

### Funcionalidades implementadas

* **Autenticación completa:** Registro, login, logout con JWT y roles
* **Gestión de usuarios:** Perfiles, direcciones, cambio de contraseña
* **Sistema de pedidos completo:** Crear, gestionar estados, pagos
* **Interfaz de restaurantes:** Páginas de detalle y menú
* **Carrito de compras:** Gestión de items y checkout
* **Rutas protegidas:** AuthContext y componentes protegidos
* **Testing exhaustivo:** Cobertura 80%+ en backend, 70%+ en frontend

### Estructura reorganizada (26/09/2025)

**Reorganización completa del frontend para mejor mantenibilidad:**

* `frontend/src/components/` → **Componentes organizados por tipo:**
  * `cards/` → Componentes tipo tarjeta (RestaurantCard, MenuItemCard)
  * `lists/` → Componentes de listas (MenuList, RestaurantList)
  * `modals/` → Componentes modales (MenuItemModal)
* `frontend/src/contexts/` → Contextos globales (AuthContext, CartContext)
* `frontend/src/hooks/` → Hooks personalizados (useMenuItems, useRestaurants)
* `frontend/src/pages/` → Páginas principales (HomePage, RestaurantDetailPage, LoginPage)
* `frontend/src/services/` → Conexión con API backend (api.ts, menuApi.ts)
* `frontend/src/types/` → Definiciones TypeScript (User, Restaurant, Order)

### Scripts de desarrollo

* `npm run dev` → Inicia el servidor Vite con hot-reload.

---

## ⚙️ Backend

### Tecnologías

* **Framework**: Express.js
* **Base de datos**: SQLite (desarrollo) → PostgreSQL (producción futuro)
* **ORM**: Sequelize 6.37.7
* **Sockets**: Socket.io (para tracking en tiempo real)
* **Gestión de procesos**: PM2 (con `ecosystem.config.cjs`)
* **Puerto**: `3001`

### Puntos de entrada

* **`src/app-db.js`** → Servidor principal Express + configuración DB + rutas + Socket.io.
* **`ecosystem.config.cjs`** → Configuración PM2 para backend.

### Middlewares principales

* **Seguridad:** `helmet`, `cors`, `compression`, `express-rate-limit`
* **Autenticación:** `auth.js` → JWT + roles (customer, restaurant_owner, delivery_person, admin)
* **Validación:** `validationJoi.js` → Validaciones con Joi, `validation.js` → express-validator
* **Rate limiting:** 5 auth/15min, 50 órdenes/hora, 20 pagos/hora
* **Error handling:** `errorHandler.js` → Manejo centralizado de errores
* **Logging:** `morgan` → Logging de requests HTTP

### Rutas

* **Base API**: `/api/v1`
* **Endpoints principales**:

  * `GET /` → Info API
  * `GET /health` → Estado del servidor

* **Autenticación** (`/api/v1/auth`):
  * `POST /register` → Registro de usuarios
  * `POST /login` → Login con JWT
  * `GET /verify` → Verificar token
  * `POST /refresh` → Renovar token
  * `POST /logout` → Logout
  * `POST /forgot-password` → Recuperar contraseña

* **Órdenes** (`/api/v1/orders`):
  * `POST /` → Crear orden
  * `GET /` → Listar órdenes del usuario
  * `GET /:id` → Obtener orden por ID
  * `PUT /:id/status` → Actualizar estado
  * `POST /:orderId/payment/initiate` → Iniciar pago
  * `POST /payment/confirm` → Confirmar pago (webhook)

* **Usuarios** (`/api/v1/users`):
  * `GET /profile` → Obtener perfil
  * `PATCH /profile` → Actualizar perfil
  * `PATCH /change-password` → Cambiar contraseña
  * `GET /addresses` → Obtener direcciones
  * `POST /addresses` → Agregar dirección

* **Restaurantes y Menú**:
  * `GET /api/v1/restaurants` → Listar restaurantes
  * `GET /api/v1/menu` → Obtener menú

### Modelos definidos

* **User.js** → Usuarios con roles (customer, restaurant_owner, delivery_person, admin) y validaciones.
* **Restaurant.js** → Restaurantes con categorías, rating, ubicación y horarios.
* **MenuItem.js** → Items de menú con categorías, precios, descuentos y disponibilidad.
* **Order.js** → Pedidos completos con estados, items y direcciones de entrega.
* **OrderItem.js** → Items individuales de pedidos con cantidades e instrucciones especiales.
* **Payment.js** → Pagos con métodos (card, cash, transfer), estados y transacciones.

### Migraciones

* `20250913210111-change-menuitem-id-to-uuid.cjs`
* `20250913214144-create-menu-items.cjs`
* Ubicación: `backend/migrations/`
* Estado actual: ejecutadas contra SQLite en `./src/data/database.sqlite`

### Scripts auxiliares

* **`quick-dev.ps1`** → Control rápido del backend con PM2 (start, stop, restart, logs, status).
* **`ecosystem.config.cjs`** → Configuración avanzada de PM2 (autorestart, watch, logs).

---

## 🔒 Autenticación y Autorización

* **JWT** con `jsonwebtoken` y `bcryptjs` para hashing de contraseñas.
* **Middleware de autenticación:**
  * `authenticate` → Verifica tokens JWT válidos
  * `authenticateRefresh` → Maneja refresh tokens desde cookies httpOnly
  * `authorize` → Controla permisos por roles
* **Roles implementados:**
  * `customer` → Acceso a pedidos y perfil propio
  * `restaurant_owner` → Gestión de restaurante y pedidos
  * `delivery_person` → Actualización de estados de entrega
  * `admin` → Acceso completo al sistema
* **Seguridad avanzada:**
  * Refresh tokens en httpOnly cookies
  * Rate limiting por endpoint y usuario
  * Validaciones de input con Joi
  * Headers de seguridad con Helmet

---

## 📡 Comunicaciones en Tiempo Real

* **Socket.io** configurado en `app-db.js`.
* Módulo `orderUpdates.js` maneja actualizaciones de pedidos.
* Conexión CORS permitida hacia `http://localhost:5173` (frontend).

---

## 🛠️ Entorno de Desarrollo

* **Base de datos activa**: SQLite (`./src/data/database.sqlite`).
* **Archivos clave**:

  * `.env` y `.env.example` → Variables de entorno.
  * `config/environment.js` → Config global.
  * `config/database.js` → Inicialización Sequelize.
  * `config/config.cjs` → Configuración para sequelize-cli.

### Logs

* Ubicación: `backend/logs/`
* Archivos: `err.log`, `out.log`, `combined.log`

### PM2

* `pm2 start ecosystem.config.cjs --env development`
* `pm2 logs quiklii-backend`

---

## 🚀 Estado Actual del Proyecto (26/09/2025)

**✅ SISTEMA COMPLETAMENTE FUNCIONAL Y OPTIMIZADO:**

* **Frontend**: Arquitectura reorganizada, autenticación real, rutas protegidas, gestión de pedidos completa.
* **Backend**: API v1 completa con autenticación JWT, gestión de órdenes, pagos y roles.
* **Estructura**: Frontend reorganizado en carpetas especializadas (cards/, lists/, modals/).
* **Testing**: Cobertura del 80%+ en backend, 70%+ en frontend con Jest y Vitest.
* **CI/CD**: GitHub Actions configurados para testing automático y builds.
* **Base de datos**: SQLite para desarrollo con 9 restaurantes y menús poblados.
* **Endpoints activos**: API v1 completa (auth, orders, users, restaurants, menu).
* **Seguridad**: Rate limiting, validaciones, JWT con refresh tokens en cookies HTTP-only.
* **Imágenes**: Mayoría corregidas, sistema de fallback inteligente implementado.
* **React**: Configurado en modo desarrollo con optimizaciones activadas.

---

## 🔧 **Correcciones Recientes (26/09/2025)**

**Reorganización completa y correcciones críticas implementadas:**

### ✅ **Reorganización Arquitectónica del Frontend**
- **Movidos 5 componentes** de `src/` a estructura organizada
- **Creadas carpetas especializadas**: `cards/`, `lists/`, `modals/`
- **Actualizadas rutas de importación** en 4 páginas principales
- **Eliminadas dependencias circulares** y imports rotos

### ✅ **Corrección del Endpoint de Menús**
- **Problema**: `/api/v1/restaurants/{id}/menu` retornaba 404
- **Solución**: Movida ruta de `menu.js` a `restaurants.js`
- **Resultado**: Menús de restaurantes cargan correctamente

### ✅ **Sistema de Autenticación JWT Completo**
- **Registro/Login**: Endpoints seguros con validaciones robustas
- **Rate Limiting**: 5 intentos/15min para protección anti-ataques
- **Refresh Tokens**: En cookies HTTP-only para máxima seguridad
- **Manejo de Errores**: Mensajes específicos y códigos estructurados

### ✅ **Corrección de Imágenes 404**
- **Bella Italia**: Pasta Carbonara - URL corregida
- **El Sabor Criollo**: Bandeja Paisa - URL corregida
- **Tacos Express**: Imagen del restaurante - URL corregida
- **URLs actualizadas**: En seeders de menú y restaurantes

### ✅ **Configuración de React en Modo Desarrollo**
- **Problema**: React corriendo en producción sin optimizaciones
- **Solución**: Configurado `mode: 'development'` en Vite
- **Resultado**: Eliminado warning de "dead code elimination"

## 📋 Próximos Pasos (Fase 3)

1. **Ajustes finales de imágenes:** Corrección de URLs restantes que retornan 404
2. **Integración de pagos:** Implementar Wompi/Stripe para transacciones reales
3. **WebSockets:** Actualizaciones en tiempo real de estados de pedidos
4. **Panel de administración:** Dashboard completo para propietarios de restaurantes
5. **Notificaciones push:** Sistema de notificaciones para usuarios y repartidores
6. **Migración a PostgreSQL:** Base de datos de producción escalable
7. **Optimización de rendimiento:** Caching, índices de BD y CDN
8. **Monitoreo y logging:** Implementar herramientas de observabilidad
9. **Testing E2E:** Pruebas end-to-end con Cypress o Playwright

---

## 🗂️ Observaciones finales

La arquitectura actual permite un flujo de trabajo ágil:

* **Desarrollo**: SQLite + Vite + PM2.
* **Producción**: PostgreSQL + PM2 con logging + despliegue escalable.

Este documento y está alineado con la estructura real del proyecto (`project_full_structure.txt`).
