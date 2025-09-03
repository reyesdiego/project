#!/bin/bash

# PostgreSQL Development Deployment Script

set -e

echo "🚀 Deploying PostgreSQL in development mode..."

# Colors for output
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m'

print_status() {
    echo -e "${GREEN}[INFO]${NC} $1"
}

print_warning() {
    echo -e "${YELLOW}[WARNING]${NC} $1"
}

# Check if Docker is running
if ! docker info > /dev/null 2>&1; then
    echo "❌ Docker is not running. Please start Docker and try again."
    exit 1
fi



# Use development environment
if [ -f "env.dev" ]; then
    # Load environment variables, ignoring comments and empty lines
    while IFS= read -r line; do
        # Skip comments and empty lines
        if [[ ! "$line" =~ ^[[:space:]]*# ]] && [[ -n "$line" ]]; then
            export "$line"
        fi
    done < env.dev
else
    print_warning "env.dev not found, using default values"
    export POSTGRES_DB=scoreteam_dev
    export POSTGRES_USER=postgres
    export POSTGRES_PASSWORD=postgres123
    export POSTGRES_PORT=5432
fi

# Stop existing containers
print_status "Stopping existing containers..."
docker-compose -f docker-compose.dev.yml down

# Start PostgreSQL in development mode
print_status "Starting PostgreSQL in development mode..."
docker-compose -f docker-compose.dev.yml up -d

# Wait for PostgreSQL to be ready
print_status "Waiting for PostgreSQL to be ready..."
sleep 10

# Check if PostgreSQL is running
if docker-compose -f docker-compose.dev.yml ps | grep -q "Up"; then
    print_status "✅ PostgreSQL development deployment completed successfully!"
    print_status "Database: $POSTGRES_DB"
    print_status "User: $POSTGRES_USER"
    print_status "Port: $POSTGRES_PORT"
    print_status "Connection: localhost:$POSTGRES_PORT"
    print_status "To run migrations, use: ./run-migrations-dev.sh"
else
    echo "❌ PostgreSQL failed to start. Check logs with:"
    echo "docker-compose -f docker-compose.dev.yml logs postgres"
    exit 1
fi
