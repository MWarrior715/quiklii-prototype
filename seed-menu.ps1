# seed-menu.ps1
# 🚀 Ejecuta el seeder de menús en SQLite para Quiklii

Write-Host "🔄 Ejecutando seeder de menús..." -ForegroundColor Cyan

# Ir a la carpeta del backend
Set-Location -Path ".\backend\src\seeders"

# Ejecutar el seeder
node .\menuSeed.js

# Volver a la raíz del proyecto
Set-Location -Path "..\..\.."

Write-Host "✅ Seeder ejecutado correctamente. Ahora puedes reiniciar el backend con PM2:" -ForegroundColor Green
Write-Host "   pm2 restart quiklii-backend" -ForegroundColor Yellow
