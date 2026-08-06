# AI Institutional Persona System - Startup Script
# This script starts all three components

Write-Host "==============================================================================" -ForegroundColor Cyan
Write-Host " AI Institutional Persona System - Starting All Components" -ForegroundColor Cyan
Write-Host "==============================================================================" -ForegroundColor Cyan
Write-Host ""

$baseDir = "c:\Users\aryan\AI-Based-Institutional-Persona-System-UnityBased"

# Check Python
Write-Host "[1/3] Checking Python..." -ForegroundColor Yellow
try {
    $pythonVersion = python --version 2>&1
    Write-Host "  ✓ Python found: $pythonVersion" -ForegroundColor Green
} catch {
    Write-Host "  ✗ Python not found! Please install Python first." -ForegroundColor Red
    Write-Host "  See SETUP_GUIDE.md for installation instructions." -ForegroundColor Red
    exit 1
}

# Check Node.js
Write-Host "[2/3] Checking Node.js..." -ForegroundColor Yellow
try {
    $nodeVersion = node --version 2>&1
    Write-Host "  ✓ Node.js found: $nodeVersion" -ForegroundColor Green
} catch {
    Write-Host "  ✗ Node.js not found! Please install Node.js first." -ForegroundColor Red
    Write-Host "  See SETUP_GUIDE.md for installation instructions." -ForegroundColor Red
    exit 1
}

# Check if virtual environment exists
Write-Host "[3/3] Checking virtual environment..." -ForegroundColor Yellow
if (-not (Test-Path "$baseDir\backend\.venv")) {
    Write-Host "  ✗ Virtual environment not found. Creating..." -ForegroundColor Yellow
    Set-Location "$baseDir\backend"
    python -m venv .venv
    Write-Host "  ✓ Virtual environment created!" -ForegroundColor Green
} else {
    Write-Host "  ✓ Virtual environment exists" -ForegroundColor Green
}

Write-Host ""
Write-Host "==============================================================================" -ForegroundColor Cyan
Write-Host " Starting Components (this will open 3 new PowerShell windows)" -ForegroundColor Cyan
Write-Host "==============================================================================" -ForegroundColor Cyan
Write-Host ""

# Start Backend
Write-Host "Starting Backend..." -ForegroundColor Yellow
$backendScript = @"
Set-Location '$baseDir\backend'
Write-Host '====================' -ForegroundColor Green
Write-Host ' BACKEND SERVER' -ForegroundColor Green
Write-Host '====================' -ForegroundColor Green
Write-Host ''
Write-Host 'Activating virtual environment...'
.\.venv\Scripts\Activate.ps1
Write-Host 'Installing/updating dependencies...'
pip install -q -r requirements.txt
Write-Host ''
Write-Host 'Starting uvicorn server on http://127.0.0.1:8000' -ForegroundColor Cyan
Write-Host 'Press CTRL+C to stop' -ForegroundColor Yellow
Write-Host ''
uvicorn app.main:app --reload --host 127.0.0.1 --port 8000
"@
Start-Process powershell -ArgumentList "-NoExit", "-Command", $backendScript

Start-Sleep -Seconds 5

# Start Frontend
Write-Host "Starting Frontend..." -ForegroundColor Yellow
$frontendScript = @"
Set-Location '$baseDir\frontend'
Write-Host '====================' -ForegroundColor Green
Write-Host ' FRONTEND (LAPTOP)' -ForegroundColor Green
Write-Host '====================' -ForegroundColor Green
Write-Host ''
Write-Host 'Installing dependencies (if needed)...'
if (-not (Test-Path 'node_modules')) {
    npm install
}
Write-Host ''
Write-Host 'Starting Next.js dev server...' -ForegroundColor Cyan
Write-Host 'Will open at: http://localhost:3000' -ForegroundColor Cyan
Write-Host 'Press CTRL+C to stop' -ForegroundColor Yellow
Write-Host ''
npm run dev
"@
Start-Process powershell -ArgumentList "-NoExit", "-Command", $frontendScript

Start-Sleep -Seconds 2

# Start Remote Controller
Write-Host "Starting Remote Controller..." -ForegroundColor Yellow
$remoteScript = @"
Set-Location '$baseDir\remote-controller'
Write-Host '====================' -ForegroundColor Green
Write-Host ' MOBILE REMOTE' -ForegroundColor Green
Write-Host '====================' -ForegroundColor Green
Write-Host ''
Write-Host 'Installing dependencies (if needed)...'
if (-not (Test-Path 'node_modules')) {
    npm install
}
Write-Host ''
Write-Host 'Starting Vite dev server...' -ForegroundColor Cyan
Write-Host 'Local URL: http://localhost:5173' -ForegroundColor Cyan
Write-Host 'Network URL: Will be shown below' -ForegroundColor Cyan
Write-Host 'Press CTRL+C to stop' -ForegroundColor Yellow
Write-Host ''
npm run dev
"@
Start-Process powershell -ArgumentList "-NoExit", "-Command", $remoteScript

Write-Host ""
Write-Host "==============================================================================" -ForegroundColor Green
Write-Host " ✓ All components starting!" -ForegroundColor Green
Write-Host "==============================================================================" -ForegroundColor Green
Write-Host ""
Write-Host "Three PowerShell windows have opened:" -ForegroundColor Cyan
Write-Host "  1. Backend (port 8000)" -ForegroundColor White
Write-Host "  2. Frontend (port 3000)" -ForegroundColor White
Write-Host "  3. Remote Controller (port 5173)" -ForegroundColor White
Write-Host ""
Write-Host "Wait about 30 seconds for everything to start, then:" -ForegroundColor Yellow
Write-Host ""
Write-Host "  Laptop: http://localhost:3000" -ForegroundColor Cyan
Write-Host "  Mobile: http://YOUR_LAPTOP_IP:5173" -ForegroundColor Cyan
Write-Host ""
Write-Host "To stop: Press CTRL+C in each window" -ForegroundColor Yellow
Write-Host ""
Write-Host "See QUICK_START.md for usage instructions." -ForegroundColor White
Write-Host ""

pause
