@echo off
echo Starting Eloquent AI Client...

REM Kill any existing Node.js processes on port 3000
echo Cleaning up existing processes...
netstat -ano | findstr :3000 >nul
if %errorlevel% == 0 (
    echo Port 3000 is in use. Finding and killing process...
    for /f "tokens=5" %%a in ('netstat -ano ^| findstr :3000') do (
        taskkill /PID %%a /F >nul 2>&1
    )
    timeout /t 2 /nobreak >nul
)

REM Start the client
echo Starting Eloquent AI Client...
cd /d "%~dp0..\client"
npm start

pause
