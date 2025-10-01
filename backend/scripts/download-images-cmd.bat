@echo off
REM Script CMD para descargar imágenes de alta calidad desde Unsplash
REM Ejecutar: download-images-cmd.bat

echo 🚀 Iniciando descarga de imágenes de alta calidad desde Unsplash...

REM Crear directorio si no existe
if not exist "uploads\images\products" mkdir "uploads\images\products"

echo.
echo 🍽️ Descargando imágenes de productos...
echo.

REM Descargar cada imagen con curl
echo 📸 Descargando: pizza-margarita-real.jpg
curl -L -s -o "uploads\images\products\pizza-margarita-real.jpg" "https://images.unsplash.com/photo-1513104890138-7c749659a591?ixlib=rb-4.0.3&auto=format&fit=crop&w=400&h=300&q=80"
if exist "uploads\images\products\pizza-margarita-real.jpg" echo ✅ Descargado: pizza-margarita-real.jpg

echo 📸 Descargando: sushi-atun-fresco.jpg
curl -L -s -o "uploads\images\products\sushi-atun-fresco.jpg" "https://images.unsplash.com/photo-1579584425555-c3ce17fd4351?ixlib=rb-4.0.3&auto=format&fit=crop&w=400&h=300&q=80"
if exist "uploads\images\products\sushi-atun-fresco.jpg" echo ✅ Descargado: sushi-atun-fresco.jpg

echo 📸 Descargando: hamburguesa-doble-queso.jpg
curl -L -s -o "uploads\images\products\hamburguesa-doble-queso.jpg" "https://images.unsplash.com/photo-1568901346375-23c9450c58cd?ixlib=rb-4.0.3&auto=format&fit=crop&w=400&h=300&q=80"
if exist "uploads\images\products\hamburguesa-doble-queso.jpg" echo ✅ Descargado: hamburguesa-doble-queso.jpg

echo 📸 Descargando: ensalada-fresca-verduras.jpg
curl -L -s -o "uploads\images\products\ensalada-fresca-verduras.jpg" "https://images.unsplash.com/photo-1512621776951-a57141f2eefd?ixlib=rb-4.0.3&auto=format&fit=crop&w=400&h=300&q=80"
if exist "uploads\images\products\ensalada-fresca-verduras.jpg" echo ✅ Descargado: ensalada-fresca-verduras.jpg

echo 📸 Descargando: ramen-caliente-japones.jpg
curl -L -s -o "uploads\images\products\ramen-caliente-japones.jpg" "https://images.unsplash.com/photo-1569718212165-3a8278d5f624?ixlib=rb-4.0.3&auto=format&fit=crop&w=400&h=300&q=80"
if exist "uploads\images\products\ramen-caliente-japones.jpg" echo ✅ Descargado: ramen-caliente-japones.jpg

echo 📸 Descargando: wok-vegetales-salteados.jpg
curl -L -s -o "uploads\images\products\wok-vegetales-salteados.jpg" "https://images.unsplash.com/photo-1603133872878-684f208fb84b?ixlib=rb-4.0.3&auto=format&fit=crop&w=400&h=300&q=80"
if exist "uploads\images\products\wok-vegetales-salteados.jpg" echo ✅ Descargado: wok-vegetales-salteados.jpg

echo 📸 Descargando: bandeja-paisa-completa.jpg
curl -L -s -o "uploads\images\products\bandeja-paisa-completa.jpg" "https://images.unsplash.com/photo-1585937421612-70a008356fbe?ixlib=rb-4.0.3&auto=format&fit=crop&w=400&h=300&q=80"
if exist "uploads\images\products\bandeja-paisa-completa.jpg" echo ✅ Descargado: bandeja-paisa-completa.jpg

echo 📸 Descargando: pasta-alfredo-cremosa.jpg
curl -L -s -o "uploads\images\products\pasta-alfredo-cremosa.jpg" "https://images.unsplash.com/photo-1621996346565-e3dbc646d9a9?ixlib=rb-4.0.3&auto=format&fit=crop&w=400&h=300&q=80"
if exist "uploads\images\products\pasta-alfredo-cremosa.jpg" echo ✅ Descargado: pasta-alfredo-cremosa.jpg

echo 📸 Descargando: mojito-cubano-autentico.jpg
curl -L -s -o "uploads\images\products\mojito-cubano-autentico.jpg" "https://images.unsplash.com/photo-1551538827-9c037cb4f32a?ixlib=rb-4.0.3&auto=format&fit=crop&w=400&h=300&q=80"
if exist "uploads\images\products\mojito-cubano-autentico.jpg" echo ✅ Descargado: mojito-cubano-autentico.jpg

echo 📸 Descargando: helado-artesanal-vainilla.jpg
curl -L -s -o "uploads\images\products\helado-artesanal-vainilla.jpg" "https://images.unsplash.com/photo-1553909489-cd47e0ef937f?ixlib=rb-4.0.3&auto=format&fit=crop&w=400&h=300&q=80"
if exist "uploads\images\products\helado-artesanal-vainilla.jpg" echo ✅ Descargado: helado-artesanal-vainilla.jpg

echo 📸 Descargando: tabla-quesos-variedad-artesanal.jpg
curl -L -s -o "uploads\images\products\tabla-quesos-variedad-artesanal.jpg" "https://images.unsplash.com/photo-1486297678162-eb2a19b0a32d?ixlib=rb-4.0.3&auto=format&fit=crop&w=400&h=300&q=80"
if exist "uploads\images\products\tabla-quesos-variedad-artesanal.jpg" echo ✅ Descargado: tabla-quesos-variedad-artesanal.jpg

echo 📸 Descargando: cerveza-artesanal-rubia.jpg
curl -L -s -o "uploads\images\products\cerveza-artesanal-rubia.jpg" "https://images.unsplash.com/photo-1436076863939-06870fe779c2?ixlib=rb-4.0.3&auto=format&fit=crop&w=400&h=300&q=80"
if exist "uploads\images\products\cerveza-artesanal-rubia.jpg" echo ✅ Descargado: cerveza-artesanal-rubia.jpg

echo.
echo 📊 Verificando archivos descargados...
dir "uploads\images\products\*.jpg" /b 2>nul | find /c ".jpg"
set /a count=0
for %%f in (uploads\images\products\*.jpg) do set /a count+=1

echo.
echo ✅ Proceso completado.
echo 📸 Total de imágenes .jpg descargadas: %count%
echo 📍 Ubicación: uploads\images\products\
echo.
echo 💡 Las imágenes están listas para usar en la aplicación.
echo 🌐 Las URLs incluyen parámetros de optimización (w=400, h=300, q=80)
echo 📦 Tamaño optimizado para web: ~20-50 KB por imagen

pause