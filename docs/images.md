# 📸 Imágenes en Quiklii

## Reglas de oro
1. **Ubicación**: todas las imágenes se sirven desde:
http://localhost:3001/images/<tipo>/<archivo>.jpg
2. **Carpetas permitidas**:
- `backend/uploads/images/restaurants/`
- `backend/uploads/images/products/`
3. **Nombres de archivo**:
- Solo minúsculas
- Guiones en lugar de espacios
- Ejemplo: `cafe-paradiso.jpg`

## Cómo cargar imágenes
1. Guardar el archivo en la carpeta correspondiente.
2. Asegurar que el nombre siga las reglas de oro.
3. Usar la URL en seeds, frontend o base de datos.

## No permitido
- ❌ Usar URLs externas (Unsplash, Pexels, etc.)  
- ❌ Guardar imágenes en otra carpeta distinta a `uploads/images/`

## Próximos pasos
- Añadir endpoint `/api/v1/uploads` para subir imágenes vía API (Fase 3).
