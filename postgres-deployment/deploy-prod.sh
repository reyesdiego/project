#!/bin/bash

# PostgreSQL Production Deployment Script

set -e

echo "🚀 Deploying PostgreSQL in production mode..."

# Colors for output
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
NC='\033[0m'

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

# Check if production environment file exists
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



# Create backups directory
mkdir -p backups

# Use production environment
if [ -f "env.prod" ]; then
    # Load environment variables, ignoring comments and empty lines
    while IFS= read -r line; do
        # Skip comments and empty lines
        if [[ ! "$line" =~ ^[[:space:]]*# ]] && [[ -n "$line" ]]; then
            export "$line"
        fi
    done < env.prod
else
    print_error "env.prod not found!"
    exit 1
fi

# Stop existing containers
print_status "Stopping existing containers..."
docker-compose -f docker-compose.prod.yml down

# Create backup before deployment (if data exists)
if docker volume ls | grep -q "postgres_data_prod"; then
    print_status "Creating backup before deployment..."
    docker-compose -f docker-compose.prod.yml up -d postgres
    sleep 10
    docker-compose -f docker-compose.prod.yml exec -T postgres pg_dump -U $POSTGRES_USER $POSTGRES_DB > backups/backup_$(date +%Y%m%d_%H%M%S).sql
    docker-compose -f docker-compose.prod.yml down
    print_status "Backup created successfully"
fi

# Start PostgreSQL in production mode
print_status "Starting PostgreSQL in production mode..."
docker-compose -f docker-compose.prod.yml up -d

# Wait for PostgreSQL to be ready
print_status "Waiting for PostgreSQL to be ready..."
sleep 15

# Check if PostgreSQL is running
if docker-compose -f docker-compose.prod.yml ps | grep -q "Up"; then
    print_status "✅ PostgreSQL production deployment completed successfully!"
    print_status "Database: $POSTGRES_DB"
    print_status "User: $POSTGRES_USER"
    print_status "Port: $POSTGRES_PORT"
    print_status "Connection: localhost:$POSTGRES_PORT"
    print_status "To run migrations, use: ./run-migrations-prod.sh"
    
    # Test database connection
    print_status "Testing database connection..."
    if docker-compose -f docker-compose.prod.yml exec -T postgres pg_isready -U $POSTGRES_USER -d $POSTGRES_DB; then
        print_status "✅ Database connection test successful!"
    else
        print_warning "⚠️  Database connection test failed. Check logs for details."
    fi
else
    print_error "PostgreSQL failed to start. Check logs with:"
    echo "docker-compose -f docker-compose.prod.yml logs postgres"
    exit 1
fi
