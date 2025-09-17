# Script para iniciar backend y frontend en paralelo
# Uso: .\start-dev.ps1

Write-Host "🚀 Iniciando Quiklii en modo desarrollo..." -ForegroundColor Cyan

# Función para limpiar procesos al cerrar
function Cleanup {
    Write-Host "`n🛑 Deteniendo servidores..." -ForegroundColor Yellow
    Get-Job | Stop-Job
    Get-Job | Remove-Job
    Write-Host "✅ Servidores detenidos" -ForegroundColor Green
    exit
}

# Registrar función de limpieza
Register-EngineEvent PowerShell.Exiting -Action { Cleanup }

# Verificar si los puertos están libres
$backendPort = 3001
$frontendPort = 5173

$backendInUse = Get-NetTCPConnection -LocalPort $backendPort -ErrorAction SilentlyContinue
$frontendInUse = Get-NetTCPConnection -LocalPort $frontendPort -ErrorAction SilentlyContinue

if ($backendInUse) {
    Write-Host "⚠️ Puerto $backendPort ya está en uso. Deteniendo proceso..." -ForegroundColor Yellow
    $process = Get-Process -Id (Get-NetTCPConnection -LocalPort $backendPort).OwningProcess -ErrorAction SilentlyContinue
    if ($process) { Stop-Process -Id $process.Id -Force }
}

if ($frontendInUse) {
    Write-Host "⚠️ Puerto $frontendPort ya está en uso. Deteniendo proceso..." -ForegroundColor Yellow
    $process = Get-Process -Id (Get-NetTCPConnection -LocalPort $frontendPort).OwningProcess -ErrorAction SilentlyContinue
    if ($process) { Stop-Process -Id $process.Id -Force }
}

# Iniciar backend
Write-Host "🔧 Iniciando backend en puerto $backendPort..." -ForegroundColor Green
Start-Job -Name "Backend" -ScriptBlock {
    Set-Location "C:\Users\PC\quiklii-prototype\backend"
    npm run dev
} | Out-Null

# Esperar un poco para que el backend inicie
Start-Sleep -Seconds 3

# Iniciar frontend
Write-Host "🎨 Iniciando frontend en puerto $frontendPort..." -ForegroundColor Blue
Start-Job -Name "Frontend" -ScriptBlock {
    Set-Location "C:\Users\PC\quiklii-prototype"
    npm run dev
} | Out-Null

Write-Host "`n✅ Servidores iniciados:" -ForegroundColor Cyan
Write-Host "   🔧 Backend:  http://localhost:$backendPort" -ForegroundColor Green
Write-Host "   🎨 Frontend: http://localhost:$frontendPort" -ForegroundColor Blue
Write-Host "`n📝 Para detener ambos servidores, presiona Ctrl+C" -ForegroundColor Yellow

# Monitorear los trabajos y mostrar su salida
try {
    while ($true) {
        Get-Job | Receive-Job
        Start-Sleep -Seconds 1
        
        # Verificar si ambos trabajos siguen corriendo
        $backendJob = Get-Job -Name "Backend" -ErrorAction SilentlyContinue
        $frontendJob = Get-Job -Name "Frontend" -ErrorAction SilentlyContinue
        
        if ($backendJob.State -eq "Failed" -or $frontendJob.State -eq "Failed") {
            Write-Host "❌ Uno de los servidores falló" -ForegroundColor Red
            break
        }
    }
} catch {
    Write-Host "`n🛑 Script interrumpido" -ForegroundColor Yellow
} finally {
    Cleanup
}
