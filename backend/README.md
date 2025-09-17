# 🚀 Quiklii Backend API

Backend API para la plataforma de delivery Quiklii, enfocada en el mercado colombiano.

## 🛠️ Stack Tecnológico

- **Framework**: Express.js + Node.js
- **Base de Datos**: PostgreSQL + Sequelize ORM
- **Autenticación**: JWT
- **Cache**: Redis
- **Real-time**: Socket.io
- **Documentación**: Swagger/OpenAPI
- **Testing**: Jest + Supertest
- **Contenerización**: Docker + Docker Compose

## 🏁 Inicio Rápido

### 1. Clonar e Instalar

```bash
# Navegar al directorio backend
cd backend

# Instalar dependencias
npm install

# Copiar variables de entorno
cp .env.example .env
```

### 2. Configurar Base de Datos

**Opción A: SQLite (Desarrollo rápido)**
```bash
# No requiere configuración adicional
# SQLite se crea automáticamente en src/data/database.sqlite
```

**Opción B: Docker + PostgreSQL (Producción)**
```bash
# Iniciar servicios con Docker
docker-compose up -d

# Verificar que los servicios estén corriendo
docker-compose ps
```

### 3. Iniciar el Servidor

**Opción Recomendada: PM2 (Producción/Desarrollo estable)**
```bash
# Instalar PM2 globalmente (una sola vez)
npm install -g pm2

# Iniciar el backend con PM2
pm2 start src/app-db.js --name quiklii-backend

# Ver logs en tiempo real
pm2 logs quiklii-backend

# Ver estado de procesos
pm2 list
```

**Opción alternativa: Desarrollo con hot-reload**
```bash
# Modo desarrollo (con nodemon)
npm run dev
```

## 🐳 Docker Services

El proyecto incluye los siguientes servicios:

- **PostgreSQL** (puerto 5432): Base de datos principal
- **pgAdmin** (puerto 5050): Interface web para PostgreSQL
  - Email: admin@quiklii.com
  - Password: admin123
- **Redis** (puerto 6379): Cache y sesiones

## 📋 Scripts Disponibles

### Scripts básicos
```bash
npm run dev          # Desarrollo con nodemon
npm start           # Producción
npm test            # Ejecutar tests
npm run test:watch  # Tests en modo watch
npm run test:coverage # Coverage de tests
npm run db:migrate  # Ejecutar migraciones
npm run db:seed     # Ejecutar seeders
npm run db:reset    # Reset completo de DB
```

### Scripts de PM2
```bash
npm run pm2:start   # Iniciar con PM2
npm run pm2:stop    # Detener proceso PM2
npm run pm2:restart # Reiniciar proceso PM2
npm run pm2:reload  # Recarga en caliente PM2
npm run pm2:delete  # Eliminar proceso de PM2
npm run pm2:logs    # Ver logs de PM2
npm run pm2:monit   # Monitor de procesos PM2
```

## 🔧 Gestión con PM2

PM2 es el gestor de procesos recomendado para producción y desarrollo estable.

### Comandos básicos de PM2

```bash
# Iniciar el backend
pm2 start src/app-db.js --name quiklii-backend

# Detener el backend
pm2 stop quiklii-backend

# Reiniciar el backend
pm2 restart quiklii-backend

# Ver logs en tiempo real
pm2 logs quiklii-backend

# Ver todos los procesos
pm2 list

# Ver información detallada
pm2 describe quiklii-backend

# Monitor de recursos
pm2 monit

# Eliminar proceso de PM2
pm2 delete quiklii-backend
```

### Características de la configuración PM2

- ✅ **Auto-restart**: Reinicio automático en caso de crash
- ✅ **Watch mode**: Reinicio automático al detectar cambios
- ✅ **Logs**: Separación de logs de error y salida estándar
- ✅ **Memory limit**: Reinicio automático si excede 1GB de RAM
- ✅ **Environment**: Variables de entorno configuradas
- ✅ **SQLite**: Configurado para usar SQLite por defecto

## 📡 Endpoints Principales

### 🏠 General
- `GET /` - Información de la API
- `GET /health` - Health check

### 🔐 Autenticación
- `POST /api/v1/auth/register` - Registro de usuario
- `POST /api/v1/auth/login` - Login
- `POST /api/v1/auth/logout` - Logout
- `POST /api/v1/auth/refresh` - Renovar token

### 🍽️ Restaurantes
- `GET /api/v1/restaurants` - Listar restaurantes
- `GET /api/v1/restaurants/:id` - Detalle de restaurante
- `GET /api/v1/restaurants/:id/menu` - Menú de restaurante

### 📦 Pedidos
- `POST /api/v1/orders` - Crear pedido
- `GET /api/v1/orders` - Listar pedidos del usuario
- `GET /api/v1/orders/:id` - Detalle de pedido
- `PATCH /api/v1/orders/:id/status` - Actualizar estado

### 👤 Usuarios
- `GET /api/v1/users/profile` - Perfil del usuario
- `PATCH /api/v1/users/profile` - Actualizar perfil

## 🗄️ Estructura de la Base de Datos

### Modelos Principales:
- **User**: Usuarios del sistema (clientes, restaurantes, repartidores)
- **Restaurant**: Información de restaurantes
- **MenuItem**: Items del menú
- **MenuModifier**: Modificadores de items (ingredientes extra, etc.)
- **Order**: Pedidos
- **OrderItem**: Items individuales de cada pedido
- **DeliveryPerson**: Repartidores
- **Promotion**: Promociones y descuentos

## 🔧 Configuración de Desarrollo

### Variables de Entorno Importantes:

```env
NODE_ENV=development
PORT=3001
DB_NAME=quiklii_db
DB_USERNAME=quiklii_user
DB_PASSWORD=quiklii_password
JWT_SECRET=your_jwt_secret
FRONTEND_URL=http://localhost:5173
```

## 🧪 Testing

```bash
# Ejecutar todos los tests
npm test

# Tests unitarios solamente
npm run test:unit

# Tests de integración
npm run test:integration

# Con coverage
npm run test:coverage
```

## 📊 Monitoring

### Health Check
- **URL**: `GET /health`
- **Respuesta**: Status del servidor, uptime, memoria

### Logs
- Desarrollo: Logs detallados en consola
- Producción: Logs estructurados (JSON)

## 🔐 Seguridad

- Rate limiting configurado
- Helmet.js para headers de seguridad
- CORS configurado para el frontend
- Validación de datos con express-validator
- Autenticación JWT

## 🚀 Deployment

### Producción
```bash
# Build para producción
npm run build

# Iniciar en producción
NODE_ENV=production npm start
```

### Docker Production
```bash
# Build imagen
docker build -t quiklii-backend .

# Ejecutar contenedor
docker run -p 3001:3001 quiklii-backend
```

## 🤝 Contribución

1. Fork del proyecto
2. Crear feature branch (`git checkout -b feature/nueva-feature`)
3. Commit cambios (`git commit -am 'Agregar nueva feature'`)
4. Push al branch (`git push origin feature/nueva-feature`)
5. Crear Pull Request

## 📝 Notas de Desarrollo

- El servidor se recarga automáticamente en modo desarrollo
- Los logs incluyen información detallada de requests y errores
- La base de datos se sincroniza automáticamente en desarrollo
- Socket.io está configurado para actualizaciones en tiempo real

## 🆘 Troubleshooting

### Base de datos no conecta
```bash
# Verificar que Docker esté corriendo
docker-compose ps

# Ver logs de PostgreSQL
docker-compose logs postgres
```

### Puertos ocupados
- API: Puerto 3001
- PostgreSQL: Puerto 5432
- pgAdmin: Puerto 5050
- Redis: Puerto 6379

---

**Desarrollado con ❤️ para Quiklii Colombia 🇨🇴**
