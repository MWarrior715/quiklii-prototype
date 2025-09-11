# WARP.md

This file provides guidance to WARP (warp.dev) when working with code in this repository.

## Project Overview

Quiklii is a food delivery platform prototype built as a React SPA targeting the Colombian market, specifically Cundinamarca. This is the customer-facing frontend prototype that demonstrates core functionality like restaurant discovery, ordering, and cart management.

## Development Commands

### Setup & Installation
```bash
npm install                 # Install dependencies
```

### Development
```bash
npm run dev                 # Start development server (Vite)
npm run build              # Build for production
npm run preview            # Preview production build locally
npm run lint               # Run ESLint
```

### Testing Commands
Currently no test suite is configured. Consider adding:
```bash
npm test                   # Would run tests if configured
```

## Architecture Overview

### Tech Stack
- **Frontend Framework**: React 18 with TypeScript
- **Build Tool**: Vite 5.4.2 
- **Styling**: Tailwind CSS 3.4.1
- **State Management**: React Context (AuthContext, CartContext)
- **Icons**: Lucide React
- **Routing**: Client-side navigation via state management (no React Router)

### Application Structure

**Single Page Application (SPA)**: Uses a custom navigation system in `App.tsx` with conditional page rendering based on state rather than traditional routing.

**Core Pages**:
- `HomePage` - Landing page with hero section and featured restaurants
- `RestaurantsPage` - Restaurant discovery with filters and search
- `RestaurantDetailPage` - Individual restaurant menu and ordering
- `CartPage` - Shopping cart management
- `CheckoutPage` - Order finalization with Colombian payment methods
- `LoginPage` - Authentication (mock implementation)
- `OrdersPage` - Order history and tracking

**State Management**:
- `AuthContext` - User authentication and profile management with localStorage persistence
- `CartContext` - Shopping cart state with cross-restaurant cart clearing logic

**Key Data Flow**:
1. User browses restaurants → adds items to cart
2. Cart enforces single restaurant constraint (clears when switching)
3. Authentication required for checkout
4. Mock payment integration with Colombian methods (Nequi, DaviPlata, PSE, MercadoPago)

### Critical Business Logic

**Restaurant Discovery**: Advanced filtering system supporting cuisine type, service type (delivery/dining/nightlife), price range, ratings, and delivery time constraints.

**Cart Management**: Enforces single-restaurant ordering - switching restaurants automatically clears existing cart items to prevent ordering from multiple establishments.

**Colombian Payment Integration**: Implements local payment methods including Nequi, DaviPlata, PSE, and MercadoPago alongside traditional card payments.

**Mock Data Layer**: Currently uses static data from `src/data/restaurants.ts` - this would be replaced with API calls in production.

## Data Structure

### Core Types (see `src/types/index.ts`)
- `Restaurant` - Full restaurant entity with location, hours, service types
- `MenuItem` - Menu items with modifiers and pricing
- `CartItem` - Cart entries with quantity and customizations  
- `User` - User profiles with Colombian address structure
- `Order` - Complete order entity with delivery tracking
- `PaymentMethod` - Colombian payment method types

### Colombian Localization
- Currency formatting in COP (Colombian Pesos)
- Address structure includes neighborhood (`barrio`) 
- Phone number validation for Colombian format
- Payment methods specific to Colombian market

## Development Notes

### Mock Authentication
- Demo user: `demo@quiklii.com` with any password
- Google OAuth simulation available
- Phone verification flow (code: `1234`)

### Local Storage Usage
- User sessions: `quiklii_user`
- Cart persistence: `quiklii_cart` 
- Current restaurant: `quiklii_current_restaurant`

### Mobile Responsiveness
Fully responsive design with mobile-first approach. Header includes mobile navigation drawer.

### Future Backend Integration Points
- Replace `src/data/restaurants.ts` with API calls
- Implement real authentication endpoints
- Add actual payment gateway integrations
- Replace mock order tracking with real-time data

### Deployment Configuration
- Configured for Vercel deployment (as mentioned in README)
- Static build output compatible with most hosting platforms
- No server-side requirements (pure SPA)

### Extension Points for Full Platform
This prototype represents the customer app. The full platform (per `PLATAFORMA_QUIKLII.md`) will include:
- Restaurant management dashboard
- Delivery driver mobile app  
- Real-time order tracking
- Backend services (Express.js + PostgreSQL planned)
- IA-powered features (recommendations, ETA calculation)


# WARP.md — Proyecto Quiklii

## 1. Visión de Quiklii

**Quiklii** es una plataforma de delivery y listado de negocios estilo FoodPanda, Swiggy y Rappi.

### Objetivo General
Ofrecer búsqueda de restaurantes y comercios, pedidos en línea, pagos, tracking en tiempo real, paneles para restaurantes y app de repartidores.

### Stack Tecnológico (visión completa)
- **Web**: PERN (Postgres, Express, React, Node)
- **Móvil**: React Native + Expo
- **Tiempo real**: Socket.io
- **Cache / colas**: Redis
- **IA/ML futuro**: FastAPI (recomendaciones, ETA, pricing dinámico)
- **Infra inicial**: Monolito modular desplegado en PaaS (Railway/Render/Vercel)
- **Migración futura**: microservicios + Kubernetes solo si el tráfico/equipo lo justifica

### Funcionalidades clave
- **Cliente**: búsqueda avanzada, registro/login, carrito persistente, pagos múltiples (PSE, Nequi, Daviplata, MercadoPago, tarjetas, COD), tracking, historial, calificaciones, notificaciones push, suscripciones (fase 2).
- **Restaurante**: gestión de perfil y menú, pedidos en tiempo real, promociones y cupones, reportes de ventas.
- **Repartidor**: pedidos asignados, navegación con Google Maps, estados de entrega, historial de ingresos, incentivos (fase 2).
- **Admin**: dashboard con KPIs, gestión de usuarios/comercios, configuración de tarifas y pasarelas, roles y permisos, auditoría y logs.

---

## 2. Estado actual del repositorio (según indexación de Warp)

### Tech Stack actual
- **Frontend**: React (Vite + Tailwind CSS)
- **UI**: Componentes responsivos, estructura de landing de restaurantes
- **Estado**: Uso de Context API para manejo de estado global
- **Datos**: Mock data para menús, restaurantes y órdenes
- **Despliegue**: Preparado para Vercel/Netlify
- **Arquitectura**: SPA con estructura modular de componentes

### Estructura principal del repo
- `/src/components` → componentes de UI (navbar, cards, menús, etc.)
- `/src/context` → contexts de autenticación y carrito
- `/src/data` → mock data de restaurantes y órdenes
- `/src/pages` → vistas principales (home, login, checkout)
- `/src/App.jsx` → root app con rutas
- `/tailwind.config.js` → configuración de Tailwind
- `vite.config.js` → configuración de Vite

### Flujo actual del cliente (mock)
1. Usuario navega restaurantes en home (mock data)
2. Agrega productos al carrito
3. Pasa al checkout (aún sin backend real)
4. Se simula confirmación de pedido

---

## 3. Próximos pasos inmediatos

1. **Backend real (Express + Postgres)**
   - Crear API REST para usuarios, restaurantes, órdenes
   - Conectar frontend al backend → reemplazar mock data

2. **Módulo de promociones**
   - Crear modelo `promotions` en BD
   - Integrar con restaurantes y checkout

3. **Autenticación real**
   - Implementar JWT + bcrypt en backend
   - Conectar login/register del frontend

4. **Tiempo real**
   - Integrar Socket.io para tracking de pedidos
   - Notificaciones en tiempo real al cliente y restaurante

5. **CI/CD**
   - Configurar GitHub Actions para build/test
   - Deploy en Vercel (frontend) + Render/Railway (backend)

---

## 4. Uso de este archivo con Warp

Este archivo combina **visión estratégica de Quiklii** + **estado actual del código indexado**.  
Warp AI lo usará como referencia para:  
- Entender el propósito del proyecto  
- Saber en qué estado está el código ahora  
- Guiar los siguientes pasos de desarrollo (backend, real-time, CI/CD, etc.)

---
