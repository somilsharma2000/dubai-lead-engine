# ============================================================
#  Growth OS - one-click local preview (Windows)
#  Right-click this file in the dubai-lead-engine folder
#  and choose "Run with PowerShell".
# ============================================================
$ErrorActionPreference = "Stop"
Set-Location "$PSScriptRoot/app"

Write-Host "Step 1 of 5: Checking Node.js..." -ForegroundColor Yellow
try { $v = node -v } catch {
  Write-Host "Node.js is not installed. Do this, then run this file again:" -ForegroundColor Red
  Write-Host "  1. Go to https://nodejs.org" 
  Write-Host "  2. Download the LTS version and install it (click Next until done)"
  Read-Host "Press Enter to close"; exit 1
}
Write-Host "Found Node $v"

if (-not (Test-Path ".env")) {
  Set-Content ".env" "DATABASE_URL=`"file:./dev.db`"`nADMIN_EMAILS=`"somil@leadengine.com`"`nAPP_URL=`"http://localhost:3000`""
  Write-Host "Created local settings file (.env)"
}

Write-Host "Step 2 of 5: Installing dependencies (2-4 min, first time only)..." -ForegroundColor Yellow
npm install

Write-Host "Step 3 of 5: Setting up the local database with demo data..." -ForegroundColor Yellow
npm run setup

Write-Host "Step 4 of 5: Building the app (1-2 min)..." -ForegroundColor Yellow
npm run build

Write-Host "Step 5 of 5: Starting Growth OS..." -ForegroundColor Yellow
Start-Process powershell -ArgumentList "-NoExit","-Command","Set-Location '$PWD'; npm run start"
Start-Sleep -Seconds 8
Start-Process "http://localhost:3000/login"

Write-Host ""
Write-Host "=================================================" -ForegroundColor Green
Write-Host " Growth OS is running in your browser." -ForegroundColor Green
Write-Host " Login:  somil@leadengine.com" -ForegroundColor Green
Write-Host " Password: Password123!" -ForegroundColor Green
Write-Host " (dev-only credentials - everything runs on YOUR PC)" -ForegroundColor Green
Write-Host " To stop: close the other PowerShell window." -ForegroundColor Green
Write-Host "=================================================" -ForegroundColor Green
Read-Host "You can close this window. Press Enter"
