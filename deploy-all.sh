#!/bin/bash

# ScoreTeam Deployment Script
# This script deploys all three components of the ScoreTeam application

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
    print_error "Docker Compose is not installed. Please install it and try again."
    exit 1
fi

# Function to deploy PostgreSQL
deploy_postgres() {
    local environment=${1:-dev}
    print_status "Deploying PostgreSQL database in $environment mode..."
    
    cd postgres-deployment
    
    # Create migrations directory if it doesn't exist
    mkdir -p migrations
    
    # Copy migrations if they exist
    if [ -d "../server/src/migrations" ]; then
        cp -r ../server/src/migrations/* migrations/
        print_status "Migrations copied successfully"
    else
        print_warning "No migrations found in ../server/src/migrations"
    fi
    
    if [ "$environment" = "prod" ]; then
        # Production deployment
        if [ ! -f "env.prod" ]; then
            print_error "Production environment file (env.prod) not found!"
            print_error "Please create env.prod with your production database credentials."
            exit 1
        fi
        
        # Security check - ensure password is not default
        if grep -q "your_very_secure_production_password_here" env.prod; then
            print_error "Please change the default password in env.prod before deploying to production!"
            exit 1
        fi
        
        ./deploy-prod.sh
    else
        # Development deployment
        if [ ! -f "env.dev" ]; then
            print_warning "Development environment file (env.dev) not found, using defaults"
        fi
        
        ./deploy-dev.sh
    fi
    
    print_status "PostgreSQL deployed successfully in $environment mode"
    
    cd ..
}

# Function to deploy API
deploy_api() {
    print_status "Deploying REST API server..."
    
    cd api-deployment
    
    # Copy server source code
    if [ -d "../server" ]; then
        cp -r ../server/* .
        print_status "Server source code copied successfully"
    else
        print_error "Server directory not found"
        exit 1
    fi
    
    # Check if .env exists, if not copy from example
    if [ ! -f ".env" ]; then
        if [ -f "env.example" ]; then
            cp env.example .env
            print_warning "Please edit .env file with your database connection details and API configuration"
            read -p "Press Enter when you've configured the .env file..."
        else
            print_error "No env.example file found"
            exit 1
        fi
    fi
    
    docker-compose up -d
    print_status "API server deployed successfully"
    
    cd ..
}

# Function to deploy Frontend
deploy_frontend() {
    print_status "Deploying React frontend..."
    
    cd react-deployment
    
    # Copy frontend source code
    if [ -d "../src" ]; then
        cp -r ../src ../package*.json ../vite.config.ts ../tsconfig*.json ../tailwind.config.js ../postcss.config.js .
        print_status "Frontend source code copied successfully"
    else
        print_error "Frontend source code not found"
        exit 1
    fi
    
    # Check if .env exists, if not copy from example
    if [ ! -f ".env" ]; then
        if [ -f "env.example" ]; then
            cp env.example .env
            print_warning "Please edit .env file with your API URL"
            read -p "Press Enter when you've configured the .env file..."
        else
            print_error "No env.example file found"
            exit 1
        fi
    fi
    
    docker-compose up -d
    print_status "Frontend deployed successfully"
    
    cd ..
}

# Function to check deployment status
check_status() {
    print_status "Checking deployment status..."
    
    echo ""
    echo "PostgreSQL Status:"
    cd postgres-deployment
    docker-compose ps
    cd ..
    
    echo ""
    echo "API Status:"
    cd api-deployment
    docker-compose ps
    cd ..
    
    echo ""
    echo "Frontend Status:"
    cd react-deployment
    docker-compose ps
    cd ..
    
    echo ""
    print_status "Deployment completed!"
    print_status "Access your application at: http://localhost"
    print_status "API endpoint: http://localhost:3001"
    print_status "Database: localhost:5432"
}

# Main deployment logic
case "${1:-all}" in
    "postgres")
        deploy_postgres "${2:-dev}"
        ;;
    "api")
        deploy_api
        ;;
    "frontend")
        deploy_frontend
        ;;
    "all")
        deploy_postgres "${2:-dev}"
        deploy_api
        deploy_frontend
        check_status
        ;;
    *)
        echo "Usage: $0 {postgres|api|frontend|all} [dev|prod]"
        echo "  postgres [dev|prod]  - Deploy only PostgreSQL database (default: dev)"
        echo "  api                 - Deploy only REST API server"
        echo "  frontend            - Deploy only React frontend"
        echo "  all [dev|prod]      - Deploy all components (default: dev)"
        echo ""
        echo "Examples:"
        echo "  $0 postgres dev     - Deploy PostgreSQL in development mode"
        echo "  $0 postgres prod    - Deploy PostgreSQL in production mode"
        echo "  $0 all prod         - Deploy all components in production mode"
        exit 1
        ;;
esac

