# Quiklii Prototype

> Plataforma web y móvil para delivery y listado de restaurantes y comercios gastronómicos en Cundinamarca, Colombia.

## 🚀 Overview

Quiklii es un prototipo diseñado para conectar usuarios con restaurantes y comercios locales para delivery rápido y conveniente. Construido con tecnologías web modernas, este prototipo demuestra funcionalidades core como listado de restaurantes, gestión de pedidos y una experiencia de usuario optimizada.

## 🛠️ Stack Tecnológico

### Frontend
- **Framework**: React + TypeScript
- **Build Tool**: Vite 5.4.2
- **Styling**: Tailwind CSS 3.4.1
- **State Management**: React Context (AuthContext, CartContext)

### Backend
- **Runtime**: Node.js + Express.js
- **Database**: SQLite (preparado para PostgreSQL)
- **Process Manager**: PM2
- **API**: RESTful API v1

## 📦 Características

- 🍽️ Exploración de restaurantes y comercios locales
- 🛒 Carrito de compras y gestión de pedidos
- 💳 Integración con métodos de pago colombianos (mock)
- 📍 Tracking de delivery en tiempo real (simulado)
- 📱 Diseño responsive para móvil y desktop
- ⚡ Carga rápida con Vite

## 🏁 Inicio Rápido

### Prerrequisitos

- [Node.js](https://nodejs.org/) (v16 o superior)
- npm o yarn
- PowerShell (para scripts de desarrollo)

### Instalación

1. Clonar el repositorio:
   ```bash
   git clone https://github.com/MWarrior715/quiklii-prototype.git
   cd quiklii-prototype
   ```

2. Instalar dependencias:
   ```bash
   npm install
   cd backend && npm install
   cd ..
   ```

### Desarrollo

1. Iniciar backend (con PM2):
   ```bash
   .\quick-dev.ps1 start
   ```

2. Iniciar frontend (en otra terminal):
   ```bash
   npm run dev
   ```

Para más detalles sobre el desarrollo, consulta:
- [📖 DEVELOPMENT.md](DEVELOPMENT.md) - Guía detallada de desarrollo
- [🌐 PLATAFORMA_QUIKLII.md](PLATAFORMA_QUIKLII.md) - Especificación completa
- [🔧 WARP.md](WARP.md) - Contexto técnico y arquitectura

## 🌍 URLs de Desarrollo

- Frontend: http://localhost:5173
- Backend API: http://localhost:3001
- API v1: http://localhost:3001/api/v1

## 📝 Scripts Disponibles

### Frontend
```bash
npm run dev     # Desarrollo
npm run build   # Build producción
npm run preview # Preview build
```

### Backend (via quick-dev.ps1)
```bash
.\quick-dev.ps1 start    # Iniciar backend
.\quick-dev.ps1 stop     # Detener backend
.\quick-dev.ps1 logs     # Ver logs
.\quick-dev.ps1 status   # Estado servicios
```

## 📚 Documentación Adicional

- Ver [DEVELOPMENT.md](DEVELOPMENT.md) para guía detallada de desarrollo
- Ver [PLATAFORMA_QUIKLII.md](PLATAFORMA_QUIKLII.md) para especificación completa
- Ver [WARP.md](WARP.md) para contexto técnico y arquitectura

## 📄 Licencia

Este proyecto está licenciado bajo MIT License - ver el archivo [LICENSE.md](LICENSE.md) para detalles.