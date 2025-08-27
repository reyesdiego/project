#!/bin/bash

# PostgreSQL Development Migration Runner
# This script runs migrations against the Docker PostgreSQL container

set -e

echo "🔄 Running PostgreSQL migrations in development mode..."

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

# Check if PostgreSQL container is running
if ! docker-compose -f docker-compose.dev.yml ps | grep -q "Up"; then
    print_error "PostgreSQL container is not running!"
    print_error "Please start PostgreSQL first with: ./deploy-dev.sh"
    exit 1
fi

# Load development environment variables
if [ -f "env.dev" ]; then
    # Load environment variables, ignoring comments and empty lines
    while IFS= read -r line; do
        # Skip comments and empty lines
        if [[ ! "$line" =~ ^[[:space:]]*# ]] && [[ -n "$line" ]]; then
            export "$line"
        fi
    done < env.dev
    print_status "Loaded development environment variables"
else
    print_warning "env.dev not found, using default values"
    export POSTGRES_DB=scoreteam_dev
    export POSTGRES_USER=postgres
    export POSTGRES_PASSWORD=postgres123
fi

# Check if migrations directory exists
if [ ! -d "migrations" ]; then
    print_error "Migrations directory not found!"
    print_error "Please copy migrations first:"
    echo "mkdir -p migrations && cp -r ../server/src/migrations/* migrations/"
    exit 1
fi

# Check if there are migration files
migration_count=$(find migrations -name "*.sql" | wc -l)
if [ "$migration_count" -eq 0 ]; then
    print_warning "No SQL migration files found in migrations/ directory"
    exit 0
fi

print_status "Found $migration_count migration files"

# Wait for PostgreSQL to be ready
print_status "Waiting for PostgreSQL to be ready..."
until docker-compose -f docker-compose.dev.yml exec -T postgres pg_isready -U $POSTGRES_USER; do
    echo "Waiting for PostgreSQL..."
    sleep 2
done

# Create database if it doesn't exist
print_status "Checking if database $POSTGRES_DB exists..."
if ! docker-compose -f docker-compose.dev.yml exec -T postgres psql -U $POSTGRES_USER -lqt | cut -d \| -f 1 | grep -qw "$POSTGRES_DB"; then
    print_status "Creating database $POSTGRES_DB..."
    docker-compose -f docker-compose.dev.yml exec -T postgres createdb -U $POSTGRES_USER "$POSTGRES_DB"
    print_status "Database $POSTGRES_DB created successfully"
else
    print_status "Database $POSTGRES_DB already exists"
fi

print_status "PostgreSQL is ready! Running migrations..."

# Create migrations tracking table if it doesn't exist
print_status "Setting up migrations tracking..."

# Check if migrations table exists and what schema it has
if docker-compose -f docker-compose.dev.yml exec -T postgres psql -U $POSTGRES_USER -d $POSTGRES_DB -c "SELECT column_name FROM information_schema.columns WHERE table_name = 'migrations' AND column_name = 'filename';" | grep -q "filename"; then
    # Table exists with filename column (new schema)
    print_status "Using existing migrations table with filename column"
elif docker-compose -f docker-compose.dev.yml exec -T postgres psql -U $POSTGRES_USER -d $POSTGRES_DB -c "SELECT column_name FROM information_schema.columns WHERE table_name = 'migrations' AND column_name = 'name';" | grep -q "name"; then
    # Table exists with name column (old schema)
    print_status "Using existing migrations table with name column"
else
    # Create new table with filename column
    docker-compose -f docker-compose.dev.yml exec -T postgres psql -U $POSTGRES_USER -d $POSTGRES_DB -c "
    CREATE TABLE IF NOT EXISTS migrations (
        id SERIAL PRIMARY KEY,
        filename VARCHAR(255) UNIQUE NOT NULL,
        executed_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
    );" 2>/dev/null || true
    print_status "Created new migrations table with filename column"
fi

# Run migrations in order
migration_files=($(find migrations -name "*.sql" | sort))
executed_count=0

for migration_file in "${migration_files[@]}"; do
    filename=$(basename "$migration_file")
    
    # Check if migration has already been executed
    # Try filename column first (new schema), then name column (old schema)
    if docker-compose -f docker-compose.dev.yml exec -T postgres psql -U $POSTGRES_USER -d $POSTGRES_DB -t -c "SELECT COUNT(*) FROM migrations WHERE filename = '$filename';" 2>/dev/null | grep -q "1"; then
        print_status "Skipping $filename (already executed)"
        continue
    elif docker-compose -f docker-compose.dev.yml exec -T postgres psql -U $POSTGRES_USER -d $POSTGRES_DB -t -c "SELECT COUNT(*) FROM migrations WHERE name = '$filename';" 2>/dev/null | grep -q "1"; then
        print_status "Skipping $filename (already executed)"
        continue
    fi
    
    print_status "Running migration: $filename"
    
    # Run the migration
    if docker-compose -f docker-compose.dev.yml exec -T postgres psql -U $POSTGRES_USER -d $POSTGRES_DB -f "/docker-entrypoint-initdb.d/$filename"; then
        # Record the migration as executed
        # Try to insert with filename column first, then name column
        if ! docker-compose -f docker-compose.dev.yml exec -T postgres psql -U $POSTGRES_USER -d $POSTGRES_DB -c "INSERT INTO migrations (filename) VALUES ('$filename');" 2>/dev/null; then
            docker-compose -f docker-compose.dev.yml exec -T postgres psql -U $POSTGRES_USER -d $POSTGRES_DB -c "INSERT INTO migrations (name) VALUES ('$filename');"
        fi
        print_status "✅ Migration completed: $filename"
        ((executed_count++))
    else
        print_error "❌ Migration failed: $filename"
        exit 1
    fi
done

if [ "$executed_count" -eq 0 ]; then
    print_status "✅ All migrations are already up to date!"
else
    print_status "✅ Successfully executed $executed_count new migrations!"
fi

print_status "Development migrations completed successfully!"
