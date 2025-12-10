@echo off
echo Starting Eloquent AI - Full Stack Application...

REM Kill any existing Node.js processes
echo Cleaning up existing processes...
taskkill /IM node.exe /F >nul 2>&1
timeout /t 3 /nobreak >nul

REM Check and free up ports
echo Checking and freeing up ports...
for %%p in (3000 5001 8002) do (
    netstat -ano | findstr :%%p >nul
    if !errorlevel! == 0 (
        echo Port %%p is in use. Finding and killing process...
        for /f "tokens=5" %%a in ('netstat -ano ^| findstr :%%p') do (
            taskkill /PID %%a /F >nul 2>&1
        )
    )
)
timeout /t 2 /nobreak >nul

REM Start server in background
echo Starting server...
cd /d "%~dp0.."
start "Eloquent AI Server" cmd /c "npm start"

REM Wait for server to start
echo Waiting for server to start...
timeout /t 5 /nobreak >nul

REM Start client
echo Starting client...
cd /d "%~dp0..\client"
start "Eloquent AI Client" cmd /c "npm start"

echo.
echo Eloquent AI is starting up...
echo Server: http://localhost:5001
echo Client: http://localhost:3000
echo.
echo Press any key to stop all processes...
pause >nul

REM Clean up
echo Stopping all processes...
taskkill /IM node.exe /F >nul 2>&1
echo All processes stopped.
