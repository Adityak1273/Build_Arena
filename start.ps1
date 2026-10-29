# AutoForge Quick Launcher Script
Write-Host "==========================================================" -ForegroundColor Cyan
Write-Host "      AutoForge - The AI-Native Developer Browser         " -ForegroundColor Yellow
Write-Host "         HackDriven Build Arena • Team Code Ninjas        " -ForegroundColor Green
Write-Host "==========================================================" -ForegroundColor Cyan

# 1. Start Python Backend Orchestrator in a new terminal window
Write-Host "[1/2] Starting Python FastAPI & ArmorIQ/AdaL Orchestrator on http://127.0.0.1:8000..." -ForegroundColor Cyan
Start-Process powershell -ArgumentList "-NoExit", "-Command", "cd '$PSScriptRoot'; python backend/app.py"

# 2. Wait for backend startup
Start-Sleep -Seconds 2

# 3. Start React + Vite Desktop Frontend
Write-Host "[2/2] Starting AutoForge React Workspace on http://localhost:3000..." -ForegroundColor Green
npm run dev
