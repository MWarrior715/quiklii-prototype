# 🛡️ Quiklii — Fase 2: Autenticación avanzada y flujo de órdenes

## 🎯 Introducción y Objetivos Principales

Esta fase se enfoca en implementar un sistema robusto de autenticación y gestión de órdenes, fortaleciendo la seguridad y la funcionalidad del backend y frontend. Los objetivos incluyen:

- **Autenticación JWT con roles:** Implementar JWT para autenticación y autorización con roles específicos (cliente, restaurante, repartidor, admin).
- **CRUD completo de órdenes:** Gestionar órdenes con OrderItems y MenuItems, incluyendo estados y actualizaciones en tiempo real.
- **Modelo de pagos:** Definir estructura de pagos e investigar integración con Wompi/Stripe para transacciones seguras.
- **Testing exhaustivo:** Alcanzar 80% de cobertura de código usando Jest en backend.
- **Frontend seguro:** Integrar AuthContext y rutas privadas para protección de componentes.
- **Documentación completa:** Actualizar y mantener documentación técnica y de usuario.

## 📋 Prerrequisitos

Antes de iniciar la fase 2, asegúrate de tener:

- **Entorno de desarrollo configurado:** Node.js 18+, PostgreSQL/SQLite, y dependencias instaladas (ver package.json).
- **Base de datos migrada:** Todas las migraciones de Sequelize aplicadas y seeders ejecutados.
- **Conocimientos básicos:** Familiaridad con JWT, middleware de Express, y patrones de testing en Jest.
- **Herramientas de desarrollo:** VS Code con extensiones de ESLint, Prettier, y Docker si se usa.
- **Acceso a APIs externas:** Cuentas de prueba para Wompi/Stripe si se implementa integración de pagos.

## 🛠️ Herramientas Específicas

- **Backend:**
  - **Express.js** con middleware de autenticación (passport-jwt).
  - **Sequelize ORM** para gestión de modelos y migraciones.
  - **Jest** para testing unitario e integración con cobertura objetivo de 80%.
  - **Helmet** para headers de seguridad HTTP.
  - **express-rate-limit** para rate limiting.
  - **bcryptjs** para hashing de contraseñas.
  - **jsonwebtoken** para manejo de JWT.

- **Frontend:**
  - **React** con Vite para desarrollo rápido.
  - **Tailwind CSS** para styling.
  - **AuthContext** para gestión de estado de autenticación global.
  - **React Router** para rutas privadas y protección basada en roles.
  - **React Testing Library** para pruebas unitarias e integración.

- **Otros:**
  - **Postman** o **Insomnia** para testing de APIs.
  - **SQLite** para desarrollo local, con migración futura a PostgreSQL en producción.
  - **Docker** para contenedorización si es necesario.

## 🚀 CI/CD Básico

- **GitHub Actions:** Configurar workflows para tests automatizados, linter y build.
  - Ejecutar tests en cada push/PR.
  - Verificar linting con ESLint.
  - Build de frontend y backend para asegurar compatibilidad.
  - Notificaciones de fallos en builds.

## ⚠️ Riesgos y Mitigaciones

- **Riesgo: Exposición de datos sensibles durante autenticación.**
  - **Mitigación:** Usar JWT con expiración corta (15-30 minutos), implementar refresh tokens, y validar inputs para prevenir inyección SQL.

- **Riesgo: Ataques de rate limiting en endpoints públicos.**
  - **Mitigación:** Implementar express-rate-limit con límites diferenciados por endpoint y usuario autenticado.

- **Riesgo: Baja cobertura de tests afectando estabilidad.**
  - **Mitigación:** Usar Jest con configuración de cobertura mínima del 80%, integrar testing en CI/CD, y revisar métricas semanalmente.

- **Riesgo: Errores en frontend con rutas no protegidas.**
  - **Mitigación:** Usar AuthContext para verificar roles en rutas, implementar guards de ruta, y testing manual de flujos de autenticación.

- **Riesgo: Integración de pagos falla o es insegura.**
  - **Mitigación:** Investigar documentación de Wompi/Stripe, usar webhooks seguros, y probar en entorno de sandbox antes de producción.

- **Riesgo: Documentación desactualizada.**
  - **Mitigación:** Mantener documentación en Git, revisar en cada PR, y usar herramientas como Swagger para APIs.

## 📊 Recursos y Timeline

- **Recursos humanos:** 1-2 desarrolladores full-stack con experiencia en Node.js y React.
- **Recursos técnicos:** Servidor de desarrollo local, acceso a base de datos, herramientas de testing.
- **Presupuesto estimado:** $500-1000 para cuentas de testing de pagos y herramientas adicionales.
- **Tiempo total estimado:** 4-6 semanas, dividido en sprints semanales.

### Timeline Detallado
- **Semana 1:** Implementación de autenticación JWT y roles en backend, seguridad básica (Helmet, rate limiting).
- **Semana 2:** CRUD de órdenes con OrderItems, integración con MenuItems, testing inicial (cobertura 50%).
- **Semana 3:** Modelo de pagos y investigación de Wompi/Stripe, rutas privadas en frontend con AuthContext.
- **Semana 4:** Aumento de cobertura de tests a 80%, documentación completa, testing de integración.

## 📝 Tareas Subdivididas

### 1. Autenticación y Autorización (Backend)
    - 1.1 Implementar middleware de JWT en rutas sensibles.
    - 1.2 Agregar campo de roles a modelo User (cliente, restaurante, repartidor, admin).
    - 1.3 Crear endpoints para login/logout con generación de JWT.
    - 1.4 Implementar refresh tokens para sesiones prolongadas (**Decisión:** Usar httpOnly cookies para mayor seguridad vs localStorage; manejar renovación automática en frontend).
    - 1.5 Añadir validación de permisos basada en roles en middleware.

### 2. Seguridad Avanzada (Backend)
   - 2.1 Configurar Helmet para headers de seguridad.
   - 2.2 Implementar rate limiting con express-rate-limit (ej. 100 requests/min por IP).
   - 2.3 Actualizar hashing de contraseñas con bcryptjs si no está implementado.
   - 2.4 Añadir validaciones de input para prevenir XSS y SQL injection.

### 3. Gestión de Órdenes (Backend)
    - 3.1 Crear modelo OrderItems y relaciones con Order y MenuItem.
    - 3.2 Implementar CRUD completo para órdenes (crear, leer, actualizar estados).
    - 3.3 Añadir endpoints para gestión de órdenes por rol (cliente: ver propias, restaurante: gestionar entregas).
    - 3.4 Implementar sockets básicos para actualizaciones en tiempo real de estados de orden (posponer características avanzadas como notificaciones push a Fase 3).
    - 3.5 Validar stock de MenuItems al crear órdenes.

### 4. Modelo de Pagos
    - 4.1 Definir modelo Payment con campos para método, estado, monto.
    - 4.2 **Decisión temprana:** Elegir entre Wompi o Stripe basado en compatibilidad con Colombia y facilidad de integración; usar mocks para desarrollo inicial.
    - 4.3 Investigar API de Wompi/Stripe para integración.
    - 4.4 Crear endpoints para iniciar y confirmar pagos.
    - 4.5 Implementar webhooks para actualizaciones de estado de pago.

### 5. Testing con Jest (Backend)
    - 5.1 Configurar Jest para cobertura de código (objetivo 80%).
    - 5.2 Crear tests unitarios para servicios de autenticación y órdenes.
    - 5.3 Implementar tests de integración para endpoints de API.
    - 5.4 Añadir tests de carga básicos para endpoints críticos.
    - 5.5 Revisar y ajustar cobertura semanalmente.

### 6. Testing con React Testing Library (Frontend)
    - 6.1 Configurar React Testing Library para pruebas unitarias e integración.
    - 6.2 Crear tests unitarios para componentes de login y gestión de órdenes.
    - 6.3 Implementar tests de integración para flujo de login (autenticación completa).
    - 6.4 Añadir tests de integración para flujo de órdenes (crear, actualizar estados).
    - 6.5 Revisar cobertura de tests frontend semanalmente.

### 7. Frontend Seguro con AuthContext
   - 6.1 Implementar AuthContext para gestión global de estado de autenticación.
   - 6.2 Crear rutas privadas con protección basada en roles.
   - 6.3 Actualizar componentes de login/logout para usar AuthContext.
   - 6.4 Añadir guards de ruta para páginas sensibles (órdenes, administración).
   - 6.5 Integrar manejo de errores de autenticación en UI.

### 8. Documentación
    - 8.1 Actualizar FASE2_DOCUMENTATION.md con endpoints y flujos.
    - 8.2 Crear documentación de API con Swagger/OpenAPI.
    - 8.3 Documentar procesos de autenticación y roles.
    - 8.4 Añadir guías de testing y cobertura.
    - 8.5 Mantener README actualizado con instrucciones de instalación.

## 📈 Métricas de Éxito

- Cobertura de tests >= 80% en backend y >= 70% en frontend.
- Todos los endpoints protegidos con JWT y roles.
- Integración funcional de pagos en sandbox con mocks.
- CI/CD configurado y ejecutándose en pushes/PR.
- Documentación completa y accesible.
- Sin vulnerabilidades de seguridad conocidas.

Esta fase establece una base sólida para la escalabilidad de Quiklii, priorizando seguridad, funcionalidad y mantenibilidad.