#!/bin/bash

# Docker setup script for Eloquent AI
set -e

echo "🐳 Setting up Eloquent AI with Docker..."

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Function to print colored output
print_status() {
    echo -e "${BLUE}[INFO]${NC} $1"
}

print_success() {
    echo -e "${GREEN}[SUCCESS]${NC} $1"
}

print_warning() {
    echo -e "${YELLOW}[WARNING]${NC} $1"
}

print_error() {
    echo -e "${RED}[ERROR]${NC} $1"
}

# Check if Docker is installed
check_docker() {
    print_status "Checking Docker installation..."
    if ! command -v docker &> /dev/null; then
        print_error "Docker is not installed. Please install Docker first."
        exit 1
    fi
    
    if ! command -v docker-compose &> /dev/null; then
        print_error "Docker Compose is not installed. Please install Docker Compose first."
        exit 1
    fi
    
    print_success "Docker and Docker Compose are installed"
}

# Create necessary directories
create_directories() {
    print_status "Creating necessary directories..."
    
    mkdir -p uploads
    mkdir -p database
    mkdir -p logs
    mkdir -p backups
    mkdir -p nginx/ssl
    mkdir -p monitoring/grafana/dashboards
    mkdir -p monitoring/grafana/datasources
    mkdir -p monitoring/logstash/pipeline
    
    print_success "Directories created"
}

# Create environment file
create_env_file() {
    print_status "Creating environment file..."
    
    if [ ! -f .env ]; then
        cat > .env << EOF
# Server Configuration
PORT=5001
NODE_ENV=production
FRONTEND_URL=http://localhost:3000

# Database Configuration
DATABASE_PATH=./database/eloquent_ai.db

# Email Configuration (SMTP)
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_SECURE=false
SMTP_USER=your_email@gmail.com
SMTP_PASS=your_app_password
SMTP_FROM=Eloquent AI <noreply@eloquentai.com>

# Support Email
SUPPORT_EMAIL=support@eloquentai.com

# Admin Emails (comma-separated)
ADMIN_EMAILS=admin@eloquentai.com,support@eloquentai.com

# Security
JWT_SECRET=$(openssl rand -base64 32)
SESSION_SECRET=$(openssl rand -base64 32)

# Redis
REDIS_PASSWORD=$(openssl rand -base64 16)

# Grafana
GRAFANA_PASSWORD=$(openssl rand -base64 16)

# AI Services
OPENAI_API_KEY=your_openai_api_key_here
WHISPER_MODEL=base
EOF
        print_success "Environment file created"
        print_warning "Please update the .env file with your actual configuration values"
    else
        print_warning "Environment file already exists"
    fi
}

# Build and start containers
start_containers() {
    print_status "Building and starting containers..."
    
    # Build the application
    docker-compose build
    
    # Start the services
    docker-compose up -d
    
    print_success "Containers started successfully"
}

# Wait for services to be ready
wait_for_services() {
    print_status "Waiting for services to be ready..."
    
    # Wait for the main application
    timeout=60
    counter=0
    
    while [ $counter -lt $timeout ]; do
        if curl -f http://localhost:5001/api/health &> /dev/null; then
            print_success "Application is ready"
            break
        fi
        
        counter=$((counter + 1))
        sleep 1
    done
    
    if [ $counter -eq $timeout ]; then
        print_error "Application failed to start within $timeout seconds"
        exit 1
    fi
}

# Display service information
display_info() {
    print_success "Eloquent AI is now running!"
    echo ""
    echo "🌐 Services:"
    echo "  - Application: http://localhost:3000"
    echo "  - API: http://localhost:5001"
    echo "  - Grafana: http://localhost:3001 (admin/admin123)"
    echo "  - Prometheus: http://localhost:9090"
    echo "  - Adminer: http://localhost:8080 (if using dev setup)"
    echo ""
    echo "📊 Monitoring:"
    echo "  - Health Check: http://localhost:5001/api/health"
    echo "  - Metrics: http://localhost:5001/api/monitoring/metrics"
    echo ""
    echo "🔧 Management:"
    echo "  - View logs: docker-compose logs -f"
    echo "  - Stop services: docker-compose down"
    echo "  - Restart services: docker-compose restart"
    echo "  - Update services: docker-compose pull && docker-compose up -d"
    echo ""
    print_warning "Don't forget to:"
    echo "  1. Update your .env file with actual configuration values"
    echo "  2. Set up SSL certificates in nginx/ssl/ for production"
    echo "  3. Configure your SMTP settings for email notifications"
}

# Main execution
main() {
    echo "🚀 Eloquent AI Docker Setup"
    echo "=========================="
    echo ""
    
    check_docker
    create_directories
    create_env_file
    start_containers
    wait_for_services
    display_info
}

# Run main function
main "$@"
