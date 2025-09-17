# 📦 Plataforma Quiklii - Arquitectura Técnica

Este documento describe la arquitectura técnica de **Quiklii**, la plataforma de delivery y descubrimiento de locales gastronómicos. Está basado en la estructura real del proyecto (`project_structure.txt`) y refleja el estado actual de la aplicación desde el desarrollo hasta la preparación para producción.

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

* Página de inicio con listado de restaurantes
* Páginas de detalle de restaurante
* Carrito de compras
* Autenticación mock
* Checkout básico

### Estructura relevante

* `frontend/src/contexts` → Contextos globales (Auth, Cart).
* `frontend/src/pages` → Páginas principales (Home, Restaurante, Checkout).
* `frontend/src/components` → Componentes reutilizables.
* `frontend/src/services` → Conexión con API backend.

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

* `helmet`, `cors`, `compression`, `morgan`, `express-rate-limit` → seguridad, logging y rendimiento.
* `errorHandler.js` → Manejo centralizado de errores.
* `auth.js` → Autenticación JWT + roles.
* `validation.js` → Validaciones con express-validator.

### Rutas

* **Base API**: `/api/v1`
* **Endpoints principales**:

  * `GET /` → Info API
  * `GET /health` → Estado del servidor
  * `POST /api/v1/auth/register` → Registro
  * `POST /api/v1/auth/login` → Login
  * `GET /api/v1/restaurants` → Restaurantes
  * `GET /api/v1/menu` → Menú

### Modelos definidos

* **User.js** → Usuarios con roles y validaciones.
* **Restaurant.js** → Restaurantes (categorías, rating, etc.).
* **MenuItem.js** → Items de menú con categorías, precios, descuentos.
* **Order.js** → Pedidos (en desarrollo).

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

* **JWT** con `jsonwebtoken`.
* Middleware `authenticate` para proteger rutas.
* Middleware `authorize` para roles (`customer`, `restaurant_owner`, `delivery_person`, `admin`).

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

## 🚀 Estado Actual del Proyecto

* **Frontend**: estable, funcionando en `npm run dev`, consume API mock/backend.
* **Backend**: configurado con Express y Sequelize, corriendo en SQLite vía PM2.
* **Migraciones**: aplicadas parcialmente (estructura básica de `menu_items`).
* **Endpoints activos**: API v1, auth básico, menú, restaurantes.

---

## 📋 Próximos Pasos

1. Completar integración Frontend ↔ Backend (autenticación real + pedidos).
2. Implementar pagos locales (Nequi, PSE, Daviplata).
3. Panel de administración para restaurantes.
4. Tracking en tiempo real de pedidos.
5. Migrar base de datos de SQLite → PostgreSQL en producción.

---

## 🗂️ Observaciones finales

La arquitectura actual permite un flujo de trabajo ágil:

* **Desarrollo**: SQLite + Vite + PM2.
* **Producción**: PostgreSQL + PM2 con logging + despliegue escalable.

Este documento reemplaza al anterior **PLATAFORMA\_QUIKLII.md** y está alineado con la estructura real del proyecto (`project_structure.txt`).
