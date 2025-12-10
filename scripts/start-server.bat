@echo off
echo Starting Eloquent AI Server with Process Management...

REM Kill any existing Node.js processes
echo Cleaning up existing processes...
taskkill /IM node.exe /F >nul 2>&1
timeout /t 2 /nobreak >nul

REM Check if port 5001 is in use
echo Checking port 5001...
netstat -ano | findstr :5001 >nul
if %errorlevel% == 0 (
    echo Port 5001 is in use. Finding and killing process...
    for /f "tokens=5" %%a in ('netstat -ano ^| findstr :5001') do (
        taskkill /PID %%a /F >nul 2>&1
    )
    timeout /t 2 /nobreak >nul
)

REM Start the server
echo Starting Eloquent AI Server...
cd /d "%~dp0.."
npm start

pause
