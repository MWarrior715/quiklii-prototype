# Script simple de PowerShell para descargar imágenes de alta calidad
# Ejecutar en PowerShell: .\download-images-simple.ps1

Write-Host "🚀 Iniciando descarga de imágenes de alta calidad desde Unsplash..." -ForegroundColor Green

# Crear directorios si no existen
$productsDir = ".\uploads\images\products"

if (!(Test-Path $productsDir)) {
    New-Item -ItemType Directory -Path $productsDir -Force
    Write-Host "📁 Directorio creado: $productsDir" -ForegroundColor Yellow
}

# URLs de imágenes específicas de alta calidad
$images = @(
    @{ Name = "pizza-margarita-real"; Url = "https://images.unsplash.com/photo-1513104890138-7c749659a591?ixlib=rb-4.0.3&auto=format&fit=crop&w=400&h=300&q=80"; Description = "Pizza Margarita - Imagen de alta calidad" },
    @{ Name = "sushi-atun-fresco"; Url = "https://images.unsplash.com/photo-1579584425555-c3ce17fd4351?ixlib=rb-4.0.3&auto=format&fit=crop&w=400&h=300&q=80"; Description = "Sushi de atún fresco" },
    @{ Name = "hamburguesa-doble-queso"; Url = "https://images.unsplash.com/photo-1568901346375-23c9450c58cd?ixlib=rb-4.0.3&auto=format&fit=crop&w=400&h=300&q=80"; Description = "Hamburguesa doble con queso" },
    @{ Name = "ensalada-fresca-verduras"; Url = "https://images.unsplash.com/photo-1512621776951-a57141f2eefd?ixlib=rb-4.0.3&auto=format&fit=crop&w=400&h=300&q=80"; Description = "Ensalada fresca con vegetales" },
    @{ Name = "ramen-caliente-japones"; Url = "https://images.unsplash.com/photo-1569718212165-3a8278d5f624?ixlib=rb-4.0.3&auto=format&fit=crop&w=400&h=300&q=80"; Description = "Ramen japonés caliente" },
    @{ Name = "wok-vegetales-salteados"; Url = "https://images.unsplash.com/photo-1603133872878-684f208fb84b?ixlib=rb-4.0.3&auto=format&fit=crop&w=400&h=300&q=80"; Description = "Wok con vegetales salteados" },
    @{ Name = "bandeja-paisa-completa"; Url = "https://images.unsplash.com/photo-1585937421612-70a008356fbe?ixlib=rb-4.0.3&auto=format&fit=crop&w=400&h=300&q=80"; Description = "Bandeja paisa completa tradicional" },
    @{ Name = "pasta-alfredo-cremosa"; Url = "https://images.unsplash.com/photo-1621996346565-e3dbc646d9a9?ixlib=rb-4.0.3&auto=format&fit=crop&w=400&h=300&q=80"; Description = "Pasta Alfredo cremosa" },
    @{ Name = "mojito-cubano-autentico"; Url = "https://images.unsplash.com/photo-1551538827-9c037cb4f32a?ixlib=rb-4.0.3&auto=format&fit=crop&w=400&h=300&q=80"; Description = "Mojito cubano auténtico" },
    @{ Name = "helado-artesanal-vainilla"; Url = "https://images.unsplash.com/photo-1553909489-cd47e0ef937f?ixlib=rb-4.0.3&auto=format&fit=crop&w=400&h=300&q=80"; Description = "Helado artesanal de vainilla" },
    @{ Name = "tabla-quesos-variedad-artesanal"; Url = "https://images.unsplash.com/photo-1486297678162-eb2a19b0a32d?ixlib=rb-4.0.3&auto=format&fit=crop&w=400&h=300&q=80"; Description = "Tabla de quesos variedad artesanal" },
    @{ Name = "cerveza-artesanal-rubia"; Url = "https://images.unsplash.com/photo-1436076863939-06870fe779c2?ixlib=rb-4.0.3&auto=format&fit=crop&w=400&h=300&q=80"; Description = "Cerveza artesanal rubia" }
)

$successCount = 0
$failCount = 0

Write-Host "`n🍽️ Descargando imágenes de productos...`n" -ForegroundColor Cyan

foreach ($image in $images) {
    $filename = "$($image.Name).jpg"
    $filepath = Join-Path $productsDir $filename
    
    # Verificar si ya existe
    if (Test-Path $filepath) {
        Write-Host "⏭️ Saltando: $($image.Name) (ya existe)" -ForegroundColor Gray
        $successCount++
        continue
    }
    
    Write-Host "`n📸 Descargando: $($image.Name)" -ForegroundColor Yellow
    Write-Host "   📝 $($image.Description)" -ForegroundColor Gray
    
    try {
        # Descargar con Invoke-WebRequest
        Invoke-WebRequest -Uri $image.Url -OutFile $filepath -UseBasicParsing
        
        # Verificar que se descargó
        if (Test-Path $filepath) {
            $fileSize = (Get-Item $filepath).Length / 1KB
            Write-Host "✅ Descargado: $filename ($([math]::Round($fileSize, 1)) KB)" -ForegroundColor Green
            $successCount++
        }
        
    } catch {
        Write-Host "❌ Error descargando $($image.Name): $($_.Exception.Message)" -ForegroundColor Red
        $failCount++
    }
    
    # Pequeña pausa
    Start-Sleep -Milliseconds 200
}

# Verificación final
$productFiles = Get-ChildItem -Path $productsDir -Filter "*.jpg"

Write-Host "`n📊 Resumen final:" -ForegroundColor Cyan
Write-Host "✅ Imágenes descargadas exitosamente: $successCount" -ForegroundColor Green
Write-Host "❌ Imágenes fallidas: $failCount" -ForegroundColor Red
Write-Host "📸 Archivos .jpg en products: $($productFiles.Count)" -ForegroundColor Yellow

if ($productFiles.Count -gt 0) {
    Write-Host "`n📋 Productos descargados:" -ForegroundColor Green
    $productFiles | ForEach-Object { Write-Host "   📸 $($_.Name)" -ForegroundColor White }
}

Write-Host "`n✅ Proceso completado." -ForegroundColor Green
Write-Host "📍 Las imágenes están en: $productsDir" -ForegroundColor Cyan

# Si hay fallas, mostrar comandos alternativos
if ($failCount -gt 0) {
    Write-Host "`n🔄 COMANDOS ALTERNATIVOS PARA LAS IMÁGENES FALLIDAS:" -ForegroundColor Yellow
    $failedImages = $images | Where-Object { 
        $filename = "$($_.Name).jpg"
        $filepath = Join-Path $productsDir $filename
        return !(Test-Path $filepath)
    }
    
    Write-Host "`n# PowerShell:" -ForegroundColor Cyan
    $failedImages | ForEach-Object {
        $filepath = Join-Path $productsDir "$($_.Name).jpg"
        Write-Host "Invoke-WebRequest -Uri `"$($_.Url)`" -OutFile `"$filepath`"" -ForegroundColor White
    }
    
    Write-Host "`n# CMD (Windows):" -ForegroundColor Cyan
    $failedImages | ForEach-Object {
        $filepath = Join-Path $productsDir "$($_.Name).jpg"
        Write-Host "curl -L -o `"$filepath`" `"$($_.Url)`"" -ForegroundColor White
    }
}