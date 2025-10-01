# Script de PowerShell para descargar imágenes de alta calidad desde Unsplash
# Ejecutar en PowerShell: .\download-images-ps1.ps1

Write-Host "🚀 Iniciando descarga de imágenes de alta calidad desde Unsplash..." -ForegroundColor Green

# Crear directorios si no existen
$productsDir = ".\uploads\images\products"
$restaurantsDir = ".\uploads\images\restaurants"

if (!(Test-Path $productsDir)) {
    New-Item -ItemType Directory -Path $productsDir -Force
    Write-Host "📁 Directorio creado: $productsDir" -ForegroundColor Yellow
}

if (!(Test-Path $restaurantsDir)) {
    New-Item -ItemType Directory -Path $restaurantsDir -Force
    Write-Host "📁 Directorio creado: $restaurantsDir" -ForegroundColor Yellow
}

# URLs de imágenes específicas de alta calidad
$images = @(
    @{
        Name = "pizza-margarita-destacada"
        Url = "https://images.unsplash.com/photo-1513104890138-7c749659a591?ixlib=rb-4.0.3&auto=format&fit=crop&w=400&h=300&q=80"
        Category = "products"
        Description = "Pizza Margarita - Imagen de alta calidad"
    },
    @{
        Name = "sushi-atun-fresco"
        Url = "https://images.unsplash.com/photo-1579584425555-c3ce17fd4351?ixlib=rb-4.0.3&auto=format&fit=crop&w=400&h=300&q=80"
        Category = "products"
        Description = "Sushi de atún fresco"
    },
    @{
        Name = "hamburguesa-doble-queso"
        Url = "https://images.unsplash.com/photo-1568901346375-23c9450c58cd?ixlib=rb-4.0.3&auto=format&fit=crop&w=400&h=300&q=80"
        Category = "products"
        Description = "Hamburguesa doble con queso"
    },
    @{
        Name = "ensalada-fresca-verduras"
        Url = "https://images.unsplash.com/photo-1512621776951-a57141f2eefd?ixlib=rb-4.0.3&auto=format&fit=crop&w=400&h=300&q=80"
        Category = "products"
        Description = "Ensalada fresca con vegetales"
    },
    @{
        Name = "ramen-caliente-japones"
        Url = "https://images.unsplash.com/photo-1569718212165-3a8278d5f624?ixlib=rb-4.0.3&auto=format&fit=crop&w=400&h=300&q=80"
        Category = "products"
        Description = "Ramen japonés caliente"
    },
    @{
        Name = "wok-vegetales-salteados"
        Url = "https://images.unsplash.com/photo-1603133872878-684f208fb84b?ixlib=rb-4.0.3&auto=format&fit=crop&w=400&h=300&q=80"
        Category = "products"
        Description = "Wok con vegetales salteados"
    },
    @{
        Name = "bandeja-paisa-completa"
        Url = "https://images.unsplash.com/photo-1585937421612-70a008356fbe?ixlib=rb-4.0.3&auto=format&fit=crop&w=400&h=300&q=80"
        Category = "products"
        Description = "Bandeja paisa completa tradicional"
    },
    @{
        Name = "pasta-alfredo-cremosa"
        Url = "https://images.unsplash.com/photo-1621996346565-e3dbc646d9a9?ixlib=rb-4.0.3&auto=format&fit=crop&w=400&h=300&q=80"
        Category = "products"
        Description = "Pasta Alfredo cremosa"
    },
    @{
        Name = "mojito-cubano-autentico"
        Url = "https://images.unsplash.com/photo-1551538827-9c037cb4f32a?ixlib=rb-4.0.3&auto=format&fit=crop&w=400&h=300&q=80"
        Category = "products"
        Description = "Mojito cubano auténtico"
    },
    @{
        Name = "helado-artesanal-vainilla"
        Url = "https://images.unsplash.com/photo-1553909489-cd47e0ef937f?ixlib=rb-4.0.3&auto=format&fit=crop&w=400&h=300&q=80"
        Category = "products"
        Description = "Helado artesanal de vainilla"
    },
    @{
        Name = "tabla-quesos-variedad-artesanal"
        Url = "https://images.unsplash.com/photo-1486297678162-eb2a19b0a32d?ixlib=rb-4.0.3&auto=format&fit=crop&w=400&h=300&q=80"
        Category = "products"
        Description = "Tabla de quesos variedad artesanal"
    },
    @{
        Name = "cerveza-artesanal-rubia"
        Url = "https://images.unsplash.com/photo-1436076863939-06870fe779c2?ixlib=rb-4.0.3&auto=format&fit=crop&w=400&h=300&q=80"
        Category = "products"
        Description = "Cerveza artesanal rubia"
    }
)

$successCount = 0
$failCount = 0

Write-Host "`n🍽️ Descargando imágenes de productos...`n" -ForegroundColor Cyan

foreach ($image in $images) {
    $filename = "$($image.Name).jpg"
    
    if ($image.Category -eq "products") {
        $filepath = Join-Path $productsDir $filename
    } else {
        $filepath = Join-Path $restaurantsDir $filename
    }
    
    # Verificar si ya existe
    if (Test-Path $filepath) {
        Write-Host "⏭️ Saltando: $($image.Name) (ya existe)" -ForegroundColor Gray
        $successCount++
        continue
    }
    
    Write-Host "`n📸 Descargando: $($image.Name)" -ForegroundColor Yellow
    Write-Host "   📝 $($image.Description)" -ForegroundColor Gray
    Write-Host "   🔗 $($image.Url)" -ForegroundColor DarkGray
    
    try {
        # Intentar descarga con Invoke-WebRequest (PowerShell nativo)
        Invoke-WebRequest -Uri $image.Url -OutFile $filepath -UserAgent "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36"
        
        # Verificar que se descargó algo
        if (Test-Path $filepath) {
            $fileSize = (Get-Item $filepath).Length / 1KB
            Write-Host "✅ Descargado: $filename ($([math]::Round($fileSize, 1)) KB)" -ForegroundColor Green
            
            # Verificar que es una imagen válida
            try {
                $img = [System.Drawing.Image]::FromFile($filepath)
                Write-Host "   📐 Tamaño: $($img.Width)x$($img.Height) píxeles" -ForegroundColor DarkGreen
                $img.Dispose()
            } catch {
                Write-Host "⚠️  Advertencia: El archivo puede no ser una imagen válida" -ForegroundColor Yellow
            }
            
            $successCount++
        } else {
            throw "El archivo no se creó"
        }
        
    } catch {
        Write-Host "❌ Error descargando $($image.Name): $($_.Exception.Message)" -ForegroundColor Red
        $failCount++
        
        # Crear archivo de instrucciones manuales
        $instructionFile = Join-Path $productsDir "MANUAL_DOWNLOAD_$($image.Name).txt"
        $instructions = @"
INSTRUCCIONES MANUALES PARA DESCARGAR LA IMAGEN
==============================================

Nombre: $($image.Name)
Descripción: $($image.Description)
URL: $($image.Url)

PASOS PARA DESCARGAR MANUALMENTE:
1. Abre la URL en tu navegador web
2. Haz clic derecho sobre la imagen
3. Selecciona "Guardar imagen como..."
4. Guarda el archivo como: $filename
5. Colócalo en la carpeta: $productsDir

ALTERNATIVA - COMANDOS PARA TERMINAL:
# PowerShell:
Invoke-WebRequest -Uri "$($image.Url)" -OutFile "$filepath"

# CMD (Windows):
curl -L -o "$filepath" "$($image.Url)"

# Linux/Mac:
wget -O "$filepath" "$($image.Url)"

¡La imagen debe tener aproximadamente 20-50 KB y ser de 400x300 píxeles!
"@
        Set-Content -Path $instructionFile -Value $instructions
        Write-Host "📝 Instrucciones manuales creadas: $(Split-Path $instructionFile -Leaf)" -ForegroundColor Magenta
    }
    
    # Pequeña pausa para no sobrecargar el servidor
    Start-Sleep -Milliseconds 500
}

# Verificación final
$productFiles = Get-ChildItem -Path $productsDir -Filter "*.jpg" | Where-Object { $_.Name -notlike "DOWNLOAD_*" }
$instructionFiles = Get-ChildItem -Path $productsDir -Filter "MANUAL_DOWNLOAD_*.txt"

Write-Host "`n📊 Resumen final:" -ForegroundColor Cyan
Write-Host "✅ Imágenes descargadas exitosamente: $successCount" -ForegroundColor Green
Write-Host "❌ Imágenes fallidas: $failCount" -ForegroundColor Red
Write-Host "📸 Archivos .jpg en products: $($productFiles.Count)" -ForegroundColor Yellow
Write-Host "📋 Archivos de instrucción: $($instructionFiles.Count)" -ForegroundColor Magenta

if ($productFiles.Count -gt 0) {
    Write-Host "`n📋 Productos descargados:" -ForegroundColor Green
    $productFiles | ForEach-Object { Write-Host "   📸 $($_.Name)" -ForegroundColor White }
}

if ($instructionFiles.Count -gt 0) {
    Write-Host "`n📋 Archivos de instrucciones (sigue estos para descargar manualmente):" -ForegroundColor Yellow
    $instructionFiles | ForEach-Object { Write-Host "   📝 $($_.Name)" -ForegroundColor White }
}

Write-Host "`n✅ Proceso completado." -ForegroundColor Green
Write-Host "💡 Si hay archivos de instrucción, ábrelos y sigue los pasos para descargar las imágenes manualmente." -ForegroundColor Gray
Write-Host "📍 Las imágenes deben colocarse en: $productsDir" -ForegroundColor Cyan

# Si hay fallas, mostrar comando alternativo
if ($failCount -gt 0) {
    Write-Host "`n🔄 ALTERNATIVA RÁPIDA:" -ForegroundColor Yellow
    Write-Host "Puedes copiar y pegar estos comandos directamente en PowerShell:" -ForegroundColor White
    
    $failedImages = $images | Where-Object { 
        $filename = "$($_.Name).jpg"
        $filepath = Join-Path $productsDir $filename
        return !(Test-Path $filepath)
    }
    
    Write-Host "`n# Comandos para descargar las imágenes fallidas:" -ForegroundColor Cyan
    $failedImages | ForEach-Object {
        $filepath = Join-Path $productsDir "$($_.Name).jpg"
        Write-Host "Invoke-WebRequest -Uri `"$($_.Url)`" -OutFile `"$filepath`"" -ForegroundColor White
    }
}