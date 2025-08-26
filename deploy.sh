#!/bin/bash

# ScoreTeam Deployment Script
# This script deploys the ScoreTeam application using Docker Compose

set -e

echo "🚀 Starting ScoreTeam deployment..."

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Function to print colored output
print_status() {
    echo -e "${GREEN}[INFO]${NC} $1"
}

print_warning() {
    echo -e "${YELLOW}[WARNING]${NC} $1"
}

print_error() {
    echo -e "${RED}[ERROR]${NC} $1"
}

# Check if Docker is running
if ! docker info > /dev/null 2>&1; then
    print_error "Docker is not running. Please start Docker and try again."
    exit 1
fi

# Check if Docker Compose is available
if ! command -v docker-compose &> /dev/null; then
    print_error "Docker Compose is not installed. Please install Docker Compose and try again."
    exit 1
fi

# Function to check if services are healthy
check_health() {
    local service=$1
    local max_attempts=30
    local attempt=1
    
    print_status "Checking health of $service..."
    
    while [ $attempt -le $max_attempts ]; do
        if docker-compose ps $service | grep -q "Up"; then
            print_status "$service is running!"
            return 0
        fi
        
        print_warning "Attempt $attempt/$max_attempts: $service is not ready yet..."
        sleep 10
        attempt=$((attempt + 1))
    done
    
    print_error "$service failed to start within the expected time."
    return 1
}

# Function to run migrations
run_migrations() {
    print_status "Running database migrations..."
    
    # Wait for database to be ready
    sleep 15
    
    # Run migrations
    docker-compose exec -T api npm run migrate || {
        print_error "Failed to run migrations"
        return 1
    }
    
    print_status "Migrations completed successfully!"
}

# Main deployment function
deploy() {
    local environment=${1:-production}
    
    print_status "Deploying ScoreTeam in $environment mode..."
    
    # Stop existing containers
    print_status "Stopping existing containers..."
    docker-compose down --remove-orphans
    
    # Remove old images (optional)
    if [ "$2" = "--clean" ]; then
        print_status "Cleaning old images..."
        docker-compose down --rmi all --volumes --remove-orphans
    fi
    
    # Build and start services
    print_status "Building and starting services..."
    if [ "$environment" = "development" ]; then
        docker-compose -f docker-compose.dev.yml up --build -d
    else
        docker-compose up --build -d
    fi
    
    # Wait for services to be ready
    print_status "Waiting for services to be ready..."
    sleep 10
    
    # Check health of critical services
    if [ "$environment" = "development" ]; then
        check_health "postgres" || exit 1
        check_health "api" || exit 1
    else
        check_health "postgres" || exit 1
        check_health "api" || exit 1
        check_health "frontend" || exit 1
    fi
    
    # Run migrations
    run_migrations
    
    print_status "Deployment completed successfully! 🎉"
    
    # Show service status
    print_status "Service status:"
    if [ "$environment" = "development" ]; then
        docker-compose -f docker-compose.dev.yml ps
    else
        docker-compose ps
    fi
    
    # Show access URLs
    echo ""
    print_status "Access URLs:"
    echo "  🌐 Frontend: http://localhost:5173"
    echo "  🔌 API: http://localhost:3001"
    echo "  📊 API Health: http://localhost:3001/health"
    echo "  📚 API Docs: http://localhost:3001/api-docs"
    echo "  🗄️  Database: localhost:5432"
    echo ""
    print_status "Default admin credentials:"
    echo "  👤 Username: admin"
    echo "  🔑 Password: admin123"
}

# Function to show logs
show_logs() {
    local service=${1:-api}
    print_status "Showing logs for $service..."
    docker-compose logs -f $service
}

# Function to stop services
stop_services() {
    print_status "Stopping ScoreTeam services..."
    docker-compose down
    print_status "Services stopped successfully!"
}

# Function to show help
show_help() {
    echo "ScoreTeam Deployment Script"
    echo ""
    echo "Usage: $0 [COMMAND] [OPTIONS]"
    echo ""
    echo "Commands:"
    echo "  deploy [environment] [--clean]  Deploy the application"
    echo "  logs [service]                  Show logs for a service"
    echo "  stop                            Stop all services"
    echo "  help                            Show this help message"
    echo ""
    echo "Environments:"
    echo "  production (default)            Production deployment"
    echo "  development                     Development deployment with hot reload"
    echo ""
    echo "Options:"
    echo "  --clean                         Clean old images before deployment"
    echo ""
    echo "Examples:"
    echo "  $0 deploy                       Deploy in production mode"
    echo "  $0 deploy development           Deploy in development mode"
    echo "  $0 deploy --clean               Deploy with clean images"
    echo "  $0 logs api                     Show API logs"
    echo "  $0 stop                         Stop all services"
}

# Main script logic
case "${1:-deploy}" in
    "deploy")
        deploy "${2:-production}" "${3:-}"
        ;;
    "logs")
        show_logs "${2:-api}"
        ;;
    "stop")
        stop_services
        ;;
    "help"|"-h"|"--help")
        show_help
        ;;
    *)
        print_error "Unknown command: $1"
        show_help
        exit 1
        ;;
esac
