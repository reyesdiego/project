#!/bin/bash

# PostgreSQL Migration Initialization Script
# This script runs after PostgreSQL is ready to accept connections

set -e

echo "🚀 Starting PostgreSQL migration initialization..."

# Wait for PostgreSQL to be ready
until pg_isready -U $POSTGRES_USER -d $POSTGRES_DB; do
    echo "Waiting for PostgreSQL to be ready..."
    sleep 2
done

echo "PostgreSQL is ready! Running migrations..."

# Run migrations in order
for migration_file in /docker-entrypoint-initdb.d/*.sql; do
    if [ -f "$migration_file" ]; then
        echo "Running migration: $(basename $migration_file)"
        psql -U $POSTGRES_USER -d $POSTGRES_DB -f "$migration_file"
        echo "Migration completed: $(basename $migration_file)"
    fi
done

echo "✅ All migrations completed successfully!"

# Create a flag file to indicate migrations have been run
touch /var/lib/postgresql/data/migrations_completed.flag

echo "PostgreSQL initialization completed!"
