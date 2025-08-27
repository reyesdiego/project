#!/bin/bash

# PostgreSQL Production Migration Runner
# This script runs migrations against an existing production database

set -e

echo "🔄 Running PostgreSQL migrations in production mode..."

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

# Check if psql is available
if ! command -v psql &> /dev/null; then
    print_error "PostgreSQL client (psql) is not installed!"
    print_error "Please install PostgreSQL client tools:"
    echo "  Ubuntu/Debian: sudo apt-get install postgresql-client"
    echo "  macOS: brew install postgresql"
    echo "  CentOS/RHEL: sudo yum install postgresql"
    exit 1
fi

# Production safety prompt
echo ""
print_warning "⚠️  PRODUCTION MIGRATION WARNING ⚠️"
echo ""
echo "You are about to run database migrations in PRODUCTION environment."
echo "This will modify your production database structure and data."
echo ""
echo "Database connection details:"
echo "  Host: ${POSTGRES_HOST:-localhost}"
echo "  Port: ${POSTGRES_PORT:-5432}"
echo "  Database: ${POSTGRES_DB:-scoreteam}"
echo "  User: ${POSTGRES_USER:-postgres}"
echo ""
echo "⚠️  This action cannot be easily undone!"
echo ""

# Check for --no-confirm flag
NO_CONFIRM=false
for arg in "$@"; do
    if [ "$arg" = "--no-confirm" ]; then
        NO_CONFIRM=true
        break
    fi
done

# Ask for confirmation (skip if no-confirm flag is set)
if [ "$NO_CONFIRM" = false ]; then
    read -p "Are you sure you want to continue? (type 'yes' to confirm): " confirmation
    
    if [ "$confirmation" != "yes" ]; then
        print_error "Migration cancelled by user."
        exit 1
    fi
fi

echo ""
print_status "Proceeding with production migrations..."

# Load production environment variables
if [ -f "env.prod" ]; then
    # Load environment variables, ignoring comments and empty lines
    while IFS= read -r line; do
        # Skip comments and empty lines
        if [[ ! "$line" =~ ^[[:space:]]*# ]] && [[ -n "$line" ]]; then
            export "$line"
        fi
    done < env.prod
    print_status "Loaded production environment variables"
else
    print_error "Production environment file (env.prod) not found!"
    print_error "Please create env.prod with your production database credentials."
    exit 1
fi

# Validate required environment variables
if [ -z "$POSTGRES_DB" ] || [ -z "$POSTGRES_USER" ] || [ -z "$POSTGRES_PASSWORD" ]; then
    print_error "Missing required environment variables!"
    print_error "Please ensure POSTGRES_DB, POSTGRES_USER, and POSTGRES_PASSWORD are set in env.prod"
    exit 1
fi

# Set default host and port if not provided
export POSTGRES_HOST=${POSTGRES_HOST:-localhost}
export POSTGRES_PORT=${POSTGRES_PORT:-5432}

print_status "Connecting to: $POSTGRES_HOST:$POSTGRES_PORT"
print_status "Database: $POSTGRES_DB"
print_status "User: $POSTGRES_USER"

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

# Test database connection
print_status "Testing database connection..."
if ! PGPASSWORD=$POSTGRES_PASSWORD psql -h $POSTGRES_HOST -p $POSTGRES_PORT -U $POSTGRES_USER -d $POSTGRES_DB -c "SELECT 1;" > /dev/null 2>&1; then
    print_error "Cannot connect to the database!"
    print_error "Please check your connection settings in env.prod:"
    echo "  POSTGRES_HOST=$POSTGRES_HOST"
    echo "  POSTGRES_PORT=$POSTGRES_PORT"
    echo "  POSTGRES_DB=$POSTGRES_DB"
    echo "  POSTGRES_USER=$POSTGRES_USER"
    exit 1
fi

print_status "Database connection successful!"

# Create migrations tracking table if it doesn't exist
print_status "Setting up migrations tracking..."
PGPASSWORD=$POSTGRES_PASSWORD psql -h $POSTGRES_HOST -p $POSTGRES_PORT -U $POSTGRES_USER -d $POSTGRES_DB -c "
CREATE TABLE IF NOT EXISTS migrations (
    id SERIAL PRIMARY KEY,
    filename VARCHAR(255) UNIQUE NOT NULL,
    executed_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);" 2>/dev/null || true

# Run migrations in order
migration_files=($(find migrations -name "*.sql" | sort))
executed_count=0

for migration_file in "${migration_files[@]}"; do
    filename=$(basename "$migration_file")
    
    # Check if migration has already been executed
    if PGPASSWORD=$POSTGRES_PASSWORD psql -h $POSTGRES_HOST -p $POSTGRES_PORT -U $POSTGRES_USER -d $POSTGRES_DB -t -c "SELECT COUNT(*) FROM migrations WHERE filename = '$filename';" | grep -q "1"; then
        print_status "Skipping $filename (already executed)"
        continue
    fi
    
    print_status "Running migration: $filename"
    
    # Run the migration
    if PGPASSWORD=$POSTGRES_PASSWORD psql -h $POSTGRES_HOST -p $POSTGRES_PORT -U $POSTGRES_USER -d $POSTGRES_DB -f "$migration_file"; then
        # Record the migration as executed
        PGPASSWORD=$POSTGRES_PASSWORD psql -h $POSTGRES_HOST -p $POSTGRES_PORT -U $POSTGRES_USER -d $POSTGRES_DB -c "INSERT INTO migrations (filename) VALUES ('$filename');"
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

print_status "Production migrations completed successfully!"
