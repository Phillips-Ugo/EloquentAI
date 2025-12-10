@echo off
echo 🐳 Setting up Eloquent AI with Docker...

REM Check if Docker is installed
docker --version >nul 2>&1
if %errorlevel% neq 0 (
    echo [ERROR] Docker is not installed. Please install Docker Desktop first.
    exit /b 1
)

docker-compose --version >nul 2>&1
if %errorlevel% neq 0 (
    echo [ERROR] Docker Compose is not installed. Please install Docker Compose first.
    exit /b 1
)

echo [SUCCESS] Docker and Docker Compose are installed

REM Create necessary directories
echo [INFO] Creating necessary directories...
if not exist "uploads" mkdir uploads
if not exist "database" mkdir database
if not exist "logs" mkdir logs
if not exist "backups" mkdir backups
if not exist "nginx\ssl" mkdir nginx\ssl
if not exist "monitoring\grafana\dashboards" mkdir monitoring\grafana\dashboards
if not exist "monitoring\grafana\datasources" mkdir monitoring\grafana\datasources
if not exist "monitoring\logstash\pipeline" mkdir monitoring\logstash\pipeline

echo [SUCCESS] Directories created

REM Create environment file
echo [INFO] Creating environment file...
if not exist ".env" (
    echo # Server Configuration > .env
    echo PORT=5001 >> .env
    echo NODE_ENV=production >> .env
    echo FRONTEND_URL=http://localhost:3000 >> .env
    echo. >> .env
    echo # Database Configuration >> .env
    echo DATABASE_PATH=./database/eloquent_ai.db >> .env
    echo. >> .env
    echo # Email Configuration (SMTP) >> .env
    echo SMTP_HOST=smtp.gmail.com >> .env
    echo SMTP_PORT=587 >> .env
    echo SMTP_SECURE=false >> .env
    echo SMTP_USER=your_email@gmail.com >> .env
    echo SMTP_PASS=your_app_password >> .env
    echo SMTP_FROM=Eloquent AI ^<noreply@eloquentai.com^> >> .env
    echo. >> .env
    echo # Support Email >> .env
    echo SUPPORT_EMAIL=support@eloquentai.com >> .env
    echo. >> .env
    echo # Admin Emails (comma-separated) >> .env
    echo ADMIN_EMAILS=admin@eloquentai.com,support@eloquentai.com >> .env
    echo. >> .env
    echo # Security >> .env
    echo JWT_SECRET=your_jwt_secret_key_here >> .env
    echo SESSION_SECRET=your_session_secret_key_here >> .env
    echo. >> .env
    echo # Redis >> .env
    echo REDIS_PASSWORD=eloquentai123 >> .env
    echo. >> .env
    echo # Grafana >> .env
    echo GRAFANA_PASSWORD=admin123 >> .env
    echo. >> .env
    echo # AI Services >> .env
    echo OPENAI_API_KEY=your_openai_api_key_here >> .env
    echo WHISPER_MODEL=base >> .env
    
    echo [SUCCESS] Environment file created
    echo [WARNING] Please update the .env file with your actual configuration values
) else (
    echo [WARNING] Environment file already exists
)

REM Build and start containers
echo [INFO] Building and starting containers...
docker-compose build
if %errorlevel% neq 0 (
    echo [ERROR] Failed to build containers
    exit /b 1
)

docker-compose up -d
if %errorlevel% neq 0 (
    echo [ERROR] Failed to start containers
    exit /b 1
)

echo [SUCCESS] Containers started successfully

REM Wait for services to be ready
echo [INFO] Waiting for services to be ready...
timeout /t 10 /nobreak >nul

REM Check if application is ready
:check_ready
curl -f http://localhost:5001/api/health >nul 2>&1
if %errorlevel% equ 0 (
    echo [SUCCESS] Application is ready
    goto :display_info
) else (
    echo [INFO] Waiting for application to start...
    timeout /t 5 /nobreak >nul
    goto :check_ready
)

:display_info
echo.
echo [SUCCESS] Eloquent AI is now running!
echo.
echo 🌐 Services:
echo   - Application: http://localhost:3000
echo   - API: http://localhost:5001
echo   - Grafana: http://localhost:3001 (admin/admin123)
echo   - Prometheus: http://localhost:9090
echo.
echo 📊 Monitoring:
echo   - Health Check: http://localhost:5001/api/health
echo   - Metrics: http://localhost:5001/api/monitoring/metrics
echo.
echo 🔧 Management:
echo   - View logs: docker-compose logs -f
echo   - Stop services: docker-compose down
echo   - Restart services: docker-compose restart
echo   - Update services: docker-compose pull ^&^& docker-compose up -d
echo.
echo [WARNING] Don't forget to:
echo   1. Update your .env file with actual configuration values
echo   2. Set up SSL certificates in nginx/ssl/ for production
echo   3. Configure your SMTP settings for email notifications
echo.
pause
