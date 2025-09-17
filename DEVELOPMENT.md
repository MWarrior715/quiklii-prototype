# 🚀 Quiklii - Guía de Desarrollo Rápido

## ⚡ Inicio Rápido (Recomendado)

### 1️⃣ Backend (siempre en segundo plano con PM2)
```bash
# Iniciar backend - queda corriendo en segundo plano
.\quick-dev.ps1 start

# Verificar estado
.\quick-dev.ps1 status

# Ver logs en tiempo real
.\quick-dev.ps1 logs
```

### 2️⃣ Frontend (solo cuando necesites UI)
```bash
# En otra terminal o cuando necesites probar UI
npm run dev
```

## 🎯 Filosofía de Desarrollo

- ✅ **Backend con PM2**: Siempre corriendo, estable, terminal libre
- ✅ **Frontend con npm run dev**: Solo cuando necesites UI
- ✅ **Terminal libre**: Puedes seguir desarrollando sin bloqueos
- ✅ **Recursos optimizados**: Frontend solo cuando lo necesites

## 📋 Comandos Esenciales

### Script de Control Rápido
```bash
.\quick-dev.ps1 start     # Iniciar backend (PM2)
.\quick-dev.ps1 stop      # Detener backend
.\quick-dev.ps1 restart   # Reiniciar backend
.\quick-dev.ps1 logs      # Ver logs del backend
.\quick-dev.ps1 status    # Estado de servicios
```

### Scripts NPM Disponibles
```bash
# Frontend
npm run dev               # Iniciar frontend (bloquea terminal)
npm run build             # Build para producción
npm run preview           # Preview del build

# Backend directo
npm run backend:start     # Iniciar backend con PM2
npm run backend:stop      # Detener backend PM2
npm run backend:logs      # Ver logs backend
npm run backend:status    # Estado PM2
```

### Comandos PM2 Directos
```bash
pm2 list                  # Ver todos los procesos
pm2 logs quiklii-backend  # Logs en tiempo real
pm2 restart quiklii-backend # Reiniciar backend
pm2 stop quiklii-backend  # Detener backend
pm2 monit                 # Monitor de recursos
```

## 🌐 URLs de Desarrollo

- **🔧 Backend API**: http://localhost:3001
- **📡 API v1**: http://localhost:3001/api/v1
- **🏥 Health Check**: http://localhost:3001/health
- **🎨 Frontend**: http://localhost:5173 (cuando esté corriendo)

## 🔄 Flujo de Desarrollo Recomendado

```bash
# 1. Iniciar backend (una vez al día)
.\quick-dev.ps1 start

# 2. Desarrollar backend - terminal libre para comandos
# El backend se recarga automáticamente con PM2 watch

# 3. Cuando necesites probar UI, en otra terminal:
npm run dev

# 4. Ver logs del backend anytime:
.\quick-dev.ps1 logs

# 5. Al final del día (opcional):
.\quick-dev.ps1 stop
```

## 🛠️ Troubleshooting

### Backend no responde
```bash
.\quick-dev.ps1 restart
```

### Ver qué está pasando en el backend
```bash
.\quick-dev.ps1 logs
```

### Puerto ocupado
```bash
# Detener todos los procesos PM2
pm2 delete all

# Reiniciar
.\quick-dev.ps1 start
```

### Verificar estado de puertos
```bash
# Verificar puerto 3001 (backend)
netstat -ano | findstr :3001

# Verificar puerto 5173 (frontend) 
netstat -ano | findstr :5173
```

## 📊 Características de la Configuración

### Backend (PM2)
- ✅ **Auto-restart** en caso de crash
- ✅ **Watch mode** - recarga automática al cambiar código
- ✅ **Logs separados** - error y output
- ✅ **Memory limit** - reinicio si excede 1GB
- ✅ **SQLite** - base de datos integrada

### Frontend (Vite)
- ✅ **Hot-reload** - cambios instantáneos
- ✅ **Proxy automático** - `/api` redirige al backend
- ✅ **Puerto fijo** - siempre 5173
- ✅ **TypeScript** - tipado completo

---

**¡Esta configuración te permite desarrollar sin interrupciones con la terminal siempre libre! 🎉**
