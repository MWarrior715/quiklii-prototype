# 🚀 Deploy Quiklii

## Local (desarrollo)
- `docker-compose.yml` levanta:
  - Backend en `localhost:3001`
  - Frontend en `localhost:5173`
  - Base de datos: SQLite

## Producción (meta Fase 3)
- Backend: Node 18 con **PM2 (modo fork)**
- Frontend: Build estático en Nginx
- Base de datos: PostgreSQL (RDS/Aurora en AWS o equivalente)
- Imágenes: S3 bucket o almacenamiento local con backup

## CI/CD (GitHub Actions)
- Backend:
  - Instala dependencias
  - Corre `npm test` (Jest + Supertest)
- Frontend:
  - Build de Vite
  - Tests con Vitest + React Testing Library
- Falla si no pasan tests o lint

## Seguridad mínima
- Variables de entorno en `.env` (no en repo)
- JWT_SECRET único por entorno
- CORS restringido a dominios válidos
- HTTPS obligatorio en producción

## Próximos pasos
- Definir infraestructura cloud (AWS Lightsail / Railway / Vercel).
- Pipeline de staging → producción.
