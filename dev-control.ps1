# Quiklii Development Control Script
# Uso: .\dev-control.ps1 [comando]

param(
    [Parameter(Position=0)]
    [string]$Command = "status"
)

function Show-Header {
    Write-Host "`n🚀 Quiklii Development Control" -ForegroundColor Cyan
    Write-Host "================================" -ForegroundColor Cyan
}

function Show-Status {
    Write-Host "`n📊 Estado actual:" -ForegroundColor Yellow
    
    # Verificar backend PM2
    $backendStatus = pm2 jlist | ConvertFrom-Json | Where-Object { $_.name -eq "quiklii-backend" }
    if ($backendStatus) {
        $status = $backendStatus.pm2_env.status
        $memory = [math]::Round($backendStatus.monit.memory / 1MB, 1)
        Write-Host "   🔧 Backend (PM2):  $status - ${memory}MB - http://localhost:3001" -ForegroundColor Green
    } else {
        Write-Host "   🔧 Backend (PM2):  ❌ No corriendo" -ForegroundColor Red
    }
    
    # Verificar frontend
    $frontendProcess = Get-Process -Name "node" -ErrorAction SilentlyContinue | Where-Object { $_.MainWindowTitle -like "*vite*" -or (Get-NetTCPConnection -LocalPort 5173 -ErrorAction SilentlyContinue) }
    if (Get-NetTCPConnection -LocalPort 5173 -ErrorAction SilentlyContinue) {
        Write-Host "   🎨 Frontend:       ✅ Corriendo - http://localhost:5173" -ForegroundColor Blue
    } else {
        Write-Host "   🎨 Frontend:       ❌ No corriendo" -ForegroundColor Gray
    }
}

function Start-Backend {
    Write-Host "`n🔧 Iniciando backend con PM2..." -ForegroundColor Green
    Set-Location "C:\Users\PC\quiklii-prototype\backend"
    pm2 start src/app-db.js --name quiklii-backend
    Write-Host "✅ Backend iniciado en segundo plano" -ForegroundColor Green
    Write-Host "📋 Ver logs: pm2 logs quiklii-backend" -ForegroundColor Gray
}

function Stop-Backend {
    Write-Host "`n🛑 Deteniendo backend..." -ForegroundColor Yellow
    pm2 stop quiklii-backend
    Write-Host "✅ Backend detenido" -ForegroundColor Green
}

function Start-Frontend {
    Write-Host "`n🎨 Iniciando frontend..." -ForegroundColor Blue
    Write-Host "⚠️  Esto bloqueará la terminal. Usa Ctrl+C para detener." -ForegroundColor Yellow
    Set-Location "C:\Users\PC\quiklii-prototype"
    npm run dev
}

function Start-FrontendPM2 {
    Write-Host "`n🎨 Iniciando frontend con PM2..." -ForegroundColor Blue
    Set-Location "C:\Users\PC\quiklii-prototype"
    pm2 start npm --name "quiklii-frontend" -- run dev
    Write-Host "✅ Frontend iniciado en segundo plano" -ForegroundColor Blue
}

function Stop-Frontend {
    Write-Host "`n🛑 Deteniendo frontend..." -ForegroundColor Yellow
    pm2 stop quiklii-frontend -s
    pm2 delete quiklii-frontend -s
    Write-Host "✅ Frontend detenido" -ForegroundColor Green
}

function Show-Help {
    Write-Host "`n📖 Comandos disponibles:" -ForegroundColor Cyan
    Write-Host "   .\dev-control.ps1 status          - Ver estado de servicios" -ForegroundColor White
    Write-Host "   .\dev-control.ps1 backend         - Iniciar solo backend (PM2)" -ForegroundColor Green
    Write-Host "   .\dev-control.ps1 frontend        - Iniciar frontend (bloquea terminal)" -ForegroundColor Blue
    Write-Host "   .\dev-control.ps1 frontend-bg     - Iniciar frontend en segundo plano (PM2)" -ForegroundColor Blue
    Write-Host "   .\dev-control.ps1 both            - Iniciar ambos servicios" -ForegroundColor Magenta
    Write-Host "   .\dev-control.ps1 stop            - Detener todos los servicios" -ForegroundColor Red
    Write-Host "   .\dev-control.ps1 restart         - Reiniciar backend" -ForegroundColor Yellow
    Write-Host "   .\dev-control.ps1 logs            - Ver logs del backend" -ForegroundColor Gray
    
    Write-Host "`n💡 Recomendación para desarrollo:" -ForegroundColor Cyan
    Write-Host "   1. .\dev-control.ps1 backend      - Deja el backend corriendo siempre" -ForegroundColor White
    Write-Host "   2. .\dev-control.ps1 frontend     - Solo cuando necesites probar UI" -ForegroundColor White
}

# Mostrar header
Show-Header

# Ejecutar comando
switch ($Command.ToLower()) {
    "status" { Show-Status }
    "backend" { Start-Backend; Show-Status }
    "frontend" { Start-Frontend }
    "frontend-bg" { Start-FrontendPM2; Show-Status }
    "both" { Start-Backend; Start-Sleep 2; Start-FrontendPM2; Show-Status }
    "stop" { Stop-Backend; Stop-Frontend; Show-Status }
    "restart" { pm2 restart quiklii-backend; Show-Status }
    "logs" { pm2 logs quiklii-backend }
    "help" { Show-Help }
    default { Show-Help }
}

Write-Host "`n" -ForegroundColor White
