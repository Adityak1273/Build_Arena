@echo off
setlocal enabledelayedexpansion
title AutoForge — AI-Native Developer Browser
cls
color 0b

echo ===================================================================
echo             AUTOFORGE — ONE-CLICK LOCAL LAUNCHER
echo     AI-Native Developer Browser with 5-Agent Autonomous Swarm
echo ===================================================================
echo.

cd /d "%~dp0"

echo [*] Step 1/3: Checking for stale processes on port 4000 and 9222...
for /f "tokens=5" %%a in ('netstat -aon ^| findstr :4000 ^| findstr LISTENING 2^>nul') do (
    echo     Clearing stale process on port 4000 (PID: %%a)...
    taskkill /f /pid %%a >nul 2>&1
)
for /f "tokens=5" %%a in ('netstat -aon ^| findstr :9222 ^| findstr LISTENING 2^>nul') do (
    echo     Clearing stale process on port 9222 (PID: %%a)...
    taskkill /f /pid %%a >nul 2>&1
)

echo [*] Step 2/3: Checking production build bundles...
if not exist "dist\index.html" (
    echo     Compiling full production bundles...
    call npm run build
) else if not exist "dist-electron\preload.cjs" (
    echo     Compiling preload script...
    call npm run build
) else (
    echo     Production bundles verified.
)

echo.
echo [*] Step 3/3: Starting AutoForge (Runtime Server + Electron Desktop)...
echo.
call npm run launch

echo.
echo [AutoForge session ended]
pause
