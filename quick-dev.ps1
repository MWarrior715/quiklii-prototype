# Quiklii Quick Development Script
param([string]$action = "help")

function Show-Status {
    Write-Host "`n🚀 Quiklii Development Status" -ForegroundColor Cyan
    Write-Host "=============================" -ForegroundColor Cyan
    
    # Backend status
    try {
        $backendRunning = pm2 list | Select-String "quiklii-backend.*online"
        if ($backendRunning) {
            Write-Host "✅ Backend (PM2): RUNNING on http://localhost:3001" -ForegroundColor Green
        } else {
            Write-Host "❌ Backend (PM2): NOT RUNNING" -ForegroundColor Red
        }
    } catch {
        Write-Host "❌ Backend (PM2): NOT RUNNING" -ForegroundColor Red
    }
    
    # Frontend status
    try {
        $frontendPort = Get-NetTCPConnection -LocalPort 5173 -ErrorAction SilentlyContinue
        if ($frontendPort) {
            Write-Host "✅ Frontend: RUNNING on http://localhost:5173" -ForegroundColor Blue
        } else {
            Write-Host "⚪ Frontend: NOT RUNNING" -ForegroundColor Gray
        }
    } catch {
        Write-Host "⚪ Frontend: NOT RUNNING" -ForegroundColor Gray
    }
}

switch ($action.ToLower()) {
    "start" {
        Write-Host "🔧 Starting backend with PM2..." -ForegroundColor Yellow
        pm2 start backend/ecosystem.config.cjs
        Set-Location "C:\Users\PC\quiklii-prototype"
        Show-Status
        Write-Host "`n💡 Backend is now running in background!" -ForegroundColor Cyan
        Write-Host "💡 To start frontend: .\quick-dev.ps1 start-frontend" -ForegroundColor Cyan
    }
    "start-frontend" {
        Write-Host "🔧 Starting frontend (new PowerShell window)..." -ForegroundColor Yellow
        Start-Process powershell -ArgumentList "cd C:\Users\PC\quiklii-prototype\frontend; npm run dev"
        Show-Status
    }
    "start-all" {
        Write-Host "🚀 Starting backend + frontend..." -ForegroundColor Yellow
        pm2 start backend/ecosystem.config.cjs
        Start-Process powershell -ArgumentList "cd C:\Users\PC\quiklii-prototype\frontend; npm run dev"
        Set-Location "C:\Users\PC\quiklii-prototype"
        Show-Status
        Write-Host "`n✅ All services started!" -ForegroundColor Green
    }
    "stop" {
        Write-Host "🛑 Stopping backend..." -ForegroundColor Yellow
        pm2 stop quiklii-backend
        Show-Status
    }
    "restart" {
        Write-Host "🔄 Restarting backend..." -ForegroundColor Yellow
        pm2 restart quiklii-backend
        Show-Status
    }
    "logs" {
        Write-Host "📋 Showing backend logs..." -ForegroundColor Yellow
        pm2 logs quiklii-backend
    }
    "status" {
        Show-Status
    }
    default {
        Write-Host "`n🚀 Quiklii Quick Development Commands" -ForegroundColor Cyan
        Write-Host "=====================================" -ForegroundColor Cyan
        Write-Host ".\quick-dev.ps1 start         - Start backend with PM2" -ForegroundColor White
        Write-Host ".\quick-dev.ps1 start-frontend - Start frontend in new terminal" -ForegroundColor White
        Write-Host ".\quick-dev.ps1 start-all     - Start backend + frontend" -ForegroundColor White
        Write-Host ".\quick-dev.ps1 stop          - Stop backend" -ForegroundColor White
        Write-Host ".\quick-dev.ps1 restart       - Restart backend" -ForegroundColor White
        Write-Host ".\quick-dev.ps1 logs          - View backend logs" -ForegroundColor White
        Write-Host ".\quick-dev.ps1 status        - Show services status" -ForegroundColor White
        
        Write-Host "`n💡 Recommended workflow:" -ForegroundColor Green
        Write-Host "1. .\quick-dev.ps1 start-all     # Start backend + frontend" -ForegroundColor White
        Write-Host "2. .\quick-dev.ps1 status        # Check services status" -ForegroundColor White
        Write-Host "3. .\quick-dev.ps1 logs          # Check backend logs anytime" -ForegroundColor White
        
        Show-Status
    }
}
