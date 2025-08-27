#!/bin/bash

# PostgreSQL Migration Runner
# This script runs migrations for both development and production environments

set -e

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

# Function to show usage
show_usage() {
    echo "Usage: $0 {dev|prod} [options]"
    echo ""
    echo "Environment:"
    echo "  dev     - Run migrations against Docker PostgreSQL container"
    echo "  prod    - Run migrations against existing production database"
    echo ""
    echo "Options:"
echo "  --force - Force run all migrations (ignore tracking table)"
echo "  --dry-run - Show which migrations would be run without executing"
echo "  --no-confirm - Skip confirmation prompt (for automated deployments)"
    echo ""
    echo "Examples:"
    echo "  $0 dev                    # Run development migrations"
    echo "  $0 prod                   # Run production migrations"
    echo "  $0 dev --force            # Force run all development migrations"
echo "  $0 prod --dry-run         # Show production migrations without running"
echo "  $0 prod --no-confirm      # Run production migrations without confirmation"
    echo ""
    echo "Prerequisites:"
    echo "  dev:   Docker PostgreSQL container must be running"
    echo "  prod:  PostgreSQL client (psql) must be installed"
}

# Check if environment is specified
if [ $# -eq 0 ]; then
    print_error "No environment specified!"
    show_usage
    exit 1
fi

ENVIRONMENT=$1
shift

# Parse options
FORCE=false
DRY_RUN=false
NO_CONFIRM=false

while [[ $# -gt 0 ]]; do
    case $1 in
        --force)
            FORCE=true
            shift
            ;;
        --dry-run)
            DRY_RUN=true
            shift
            ;;
        --no-confirm)
            NO_CONFIRM=true
            shift
            ;;
        --help|-h)
            show_usage
            exit 0
            ;;
        *)
            print_error "Unknown option: $1"
            show_usage
            exit 1
            ;;
    esac
done

# Validate environment
if [ "$ENVIRONMENT" != "dev" ] && [ "$ENVIRONMENT" != "prod" ]; then
    print_error "Invalid environment: $ENVIRONMENT"
    show_usage
    exit 1
fi

# Copy migrations if they don't exist
if [ ! -d "migrations" ]; then
    print_status "Copying migrations..."
    mkdir -p migrations
    if [ -d "../server/src/migrations" ]; then
        cp -r ../server/src/migrations/* migrations/
        print_status "Migrations copied successfully"
    else
        print_error "No migrations found in ../server/src/migrations"
        exit 1
    fi
fi

# Run migrations based on environment
if [ "$ENVIRONMENT" = "dev" ]; then
    print_status "Running development migrations..."
    
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
        export POSTGRES_DB=scoreteam_dev
        export POSTGRES_USER=postgres
        export POSTGRES_PASSWORD=postgres123
        print_status "Using default development environment variables"
    fi
    
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
    
    # Create migrations tracking table if it doesn't exist
    if [ "$FORCE" = false ]; then
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
    fi
    
    # Run migrations
    migration_files=($(find migrations -name "*.sql" | sort))
    executed_count=0
    
    for migration_file in "${migration_files[@]}"; do
        filename=$(basename "$migration_file")
        
        if [ "$FORCE" = false ]; then
            # Check if migration has already been executed
            # Try filename column first (new schema), then name column (old schema)
            if docker-compose -f docker-compose.dev.yml exec -T postgres psql -U $POSTGRES_USER -d $POSTGRES_DB -t -c "SELECT COUNT(*) FROM migrations WHERE filename = '$filename';" 2>/dev/null | grep -q "1"; then
                print_status "Skipping $filename (already executed)"
                continue
            elif docker-compose -f docker-compose.dev.yml exec -T postgres psql -U $POSTGRES_USER -d $POSTGRES_DB -t -c "SELECT COUNT(*) FROM migrations WHERE name = '$filename';" 2>/dev/null | grep -q "1"; then
                print_status "Skipping $filename (already executed)"
                continue
            fi
        fi
        
        if [ "$DRY_RUN" = true ]; then
            print_status "Would run migration: $filename"
            ((executed_count++))
        else
            print_status "Running migration: $filename"
            
            if docker-compose -f docker-compose.dev.yml exec -T postgres psql -U $POSTGRES_USER -d $POSTGRES_DB -f "/docker-entrypoint-initdb.d/$filename"; then
                if [ "$FORCE" = false ]; then
                    # Try to insert with filename column first, then name column
                    if ! docker-compose -f docker-compose.dev.yml exec -T postgres psql -U $POSTGRES_USER -d $POSTGRES_DB -c "INSERT INTO migrations (filename) VALUES ('$filename');" 2>/dev/null; then
                        docker-compose -f docker-compose.dev.yml exec -T postgres psql -U $POSTGRES_USER -d $POSTGRES_DB -c "INSERT INTO migrations (name) VALUES ('$filename');"
                    fi
                fi
                print_status "✅ Migration completed: $filename"
                ((executed_count++))
            else
                print_error "❌ Migration failed: $filename"
                exit 1
            fi
        fi
    done
    
else
    print_status "Running production migrations..."
    
    # Production safety prompt
    echo ""
    print_warning "⚠️  PRODUCTION MIGRATION WARNING ⚠️"
    echo ""
    echo "You are about to run database migrations in PRODUCTION environment."
    echo "This will modify your production database structure and data."
    echo ""
    echo "⚠️  This action cannot be easily undone!"
    echo ""
    
    # Ask for confirmation (skip if dry-run or no-confirm)
    if [ "$DRY_RUN" = false ] && [ "$NO_CONFIRM" = false ]; then
        read -p "Are you sure you want to continue? (type 'yes' to confirm): " confirmation
        
        if [ "$confirmation" != "yes" ]; then
            print_error "Migration cancelled by user."
            exit 1
        fi
        
        echo ""
        print_status "Proceeding with production migrations..."
    fi
    
    # Check if psql is available
    if ! command -v psql &> /dev/null; then
        print_error "PostgreSQL client (psql) is not installed!"
        print_error "Please install PostgreSQL client tools:"
        echo "  Ubuntu/Debian: sudo apt-get install postgresql-client"
        echo "  macOS: brew install postgresql"
        echo "  CentOS/RHEL: sudo yum install postgresql"
        exit 1
    fi
    
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
    
    # Test database connection
    print_status "Testing database connection..."
    if ! PGPASSWORD=$POSTGRES_PASSWORD psql -h $POSTGRES_HOST -p $POSTGRES_PORT -U $POSTGRES_USER -d $POSTGRES_DB -c "SELECT 1;" > /dev/null 2>&1; then
        print_error "Cannot connect to the database!"
        print_error "Please check your connection settings in env.prod"
        exit 1
    fi
    
    print_status "Database connection successful!"
    
    # Create migrations tracking table if it doesn't exist
    if [ "$FORCE" = false ]; then
        print_status "Setting up migrations tracking..."
        PGPASSWORD=$POSTGRES_PASSWORD psql -h $POSTGRES_HOST -p $POSTGRES_PORT -U $POSTGRES_USER -d $POSTGRES_DB -c "
        CREATE TABLE IF NOT EXISTS migrations (
            id SERIAL PRIMARY KEY,
            filename VARCHAR(255) UNIQUE NOT NULL,
            executed_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
        );" 2>/dev/null || true
    fi
    
    # Run migrations
    migration_files=($(find migrations -name "*.sql" | sort))
    executed_count=0
    
    for migration_file in "${migration_files[@]}"; do
        filename=$(basename "$migration_file")
        
        if [ "$FORCE" = false ]; then
            # Check if migration has already been executed
            if PGPASSWORD=$POSTGRES_PASSWORD psql -h $POSTGRES_HOST -p $POSTGRES_PORT -U $POSTGRES_USER -d $POSTGRES_DB -t -c "SELECT COUNT(*) FROM migrations WHERE filename = '$filename';" | grep -q "1"; then
                print_status "Skipping $filename (already executed)"
                continue
            fi
        fi
        
        if [ "$DRY_RUN" = true ]; then
            print_status "Would run migration: $filename"
            ((executed_count++))
        else
            print_status "Running migration: $filename"
            
            if PGPASSWORD=$POSTGRES_PASSWORD psql -h $POSTGRES_HOST -p $POSTGRES_PORT -U $POSTGRES_USER -d $POSTGRES_DB -f "$migration_file"; then
                if [ "$FORCE" = false ]; then
                    PGPASSWORD=$POSTGRES_PASSWORD psql -h $POSTGRES_HOST -p $POSTGRES_PORT -U $POSTGRES_USER -d $POSTGRES_DB -c "INSERT INTO migrations (filename) VALUES ('$filename');"
                fi
                print_status "✅ Migration completed: $filename"
                ((executed_count++))
            else
                print_error "❌ Migration failed: $filename"
                exit 1
            fi
        fi
    done
fi

# Summary
if [ "$DRY_RUN" = true ]; then
    print_status "Dry run completed. Would execute $executed_count migrations."
else
    if [ "$executed_count" -eq 0 ]; then
        print_status "✅ All migrations are already up to date!"
    else
        print_status "✅ Successfully executed $executed_count migrations!"
    fi
fi

print_status "$ENVIRONMENT migrations completed successfully!"
