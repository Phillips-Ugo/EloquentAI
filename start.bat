@echo off
REM Eloquent AI - Windows Startup Script
REM This script sets up and starts the Eloquent AI application

echo 🚀 Starting Eloquent AI...

REM Check if Node.js is installed
node --version >nul 2>&1
if %errorlevel% neq 0 (
    echo ❌ Node.js is not installed. Please install Node.js 18+ from https://nodejs.org/
    pause
    exit /b 1
)

REM Check if Python is installed
python --version >nul 2>&1
if %errorlevel% neq 0 (
    echo ❌ Python is not installed. Please install Python 3.9+ from https://python.org/
    pause
    exit /b 1
)

echo ✅ Node.js detected
echo ✅ Python detected

REM Install dependencies if node_modules doesn't exist
if not exist "node_modules" (
    echo 📦 Installing Node.js dependencies...
    npm install
)

REM Install client dependencies if needed
if not exist "client\node_modules" (
    echo 📦 Installing React dependencies...
    cd client
    npm install
    cd ..
)

REM Install Python dependencies if needed
if not exist "ai-services\venv" (
    echo 🐍 Setting up Python virtual environment...
    cd ai-services
    python -m venv venv
    call venv\Scripts\activate.bat
    pip install -r requirements.txt
    cd ..
)

echo 🎯 Starting Eloquent AI in development mode...
echo 📱 Frontend will be available at: http://localhost:3000
echo 🔧 Backend API will be available at: http://localhost:5000
echo.
echo Press Ctrl+C to stop the application
echo.

REM Start the application
npm run dev

pause 