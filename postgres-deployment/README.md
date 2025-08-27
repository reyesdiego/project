# ScoreTeam PostgreSQL Deployment

This directory contains the deployment configuration for the ScoreTeam PostgreSQL database with support for both development and production environments.

## 🚀 Quick Start

### Development Deployment
```bash
# Deploy PostgreSQL in development mode
./deploy-dev.sh
```

### Production Deployment
```bash
# Deploy PostgreSQL in production mode
./deploy-prod.sh
```

## 📁 File Structure

```
postgres-deployment/
├── docker-compose.yml          # Default docker-compose (production)
├── docker-compose.dev.yml      # Development configuration
├── docker-compose.prod.yml     # Production configuration
├── env.dev                     # Development environment variables
├── env.prod                    # Production environment variables
├── env.example                 # Environment template
├── init-migrations.sh          # Migration initialization script
├── deploy-dev.sh               # Development deployment script
├── deploy-prod.sh              # Production deployment script
├── run-migrations.sh           # Master migration runner (dev/prod)
├── run-migrations-dev.sh       # Development migration runner
├── run-migrations-prod.sh      # Production migration runner
├── migrations/                 # Database migration files
├── backups/                    # Database backups (production)
└── README.md                   # This file
```

## 🔧 Environment Configuration

### Development Environment (`env.dev`)
```bash
# PostgreSQL Development Configuration
POSTGRES_DB=scoreteam_dev
POSTGRES_USER=postgres
POSTGRES_PASSWORD=postgres123
POSTGRES_PORT=5432
```

### Production Environment (`env.prod`)
```bash
# PostgreSQL Production Configuration
POSTGRES_DB=scoreteam
POSTGRES_USER=scoreteam_user
POSTGRES_PASSWORD=your_very_secure_production_password_here
POSTGRES_PORT=5432
```

## 🛠️ Deployment Scenarios

### Development Scenario (Docker PostgreSQL)
Use this when you want to run PostgreSQL in a Docker container for development:

```bash
# 1. Deploy PostgreSQL container
./deploy-dev.sh

# 2. Run migrations
./run-migrations.sh dev
```

### Production Scenario (Existing Database)
Use this when you have an existing PostgreSQL database and only need to run migrations:

```bash
# 1. Configure production environment
cp env.prod.example env.prod
# Edit env.prod with your database credentials

# 2. Run migrations only
./run-migrations.sh prod
```

### Manual Deployment

#### Development Mode (Docker)
```bash
# 1. Copy migrations
mkdir -p migrations
cp -r ../server/src/migrations/* migrations/

# 2. Deploy using development configuration
docker-compose -f docker-compose.dev.yml up -d

# 3. Check status
docker-compose -f docker-compose.dev.yml ps
```

#### Production Mode (Docker)
```bash
# 1. Copy migrations
mkdir -p migrations
cp -r ../server/src/migrations/* migrations/

# 2. Deploy using production configuration
docker-compose -f docker-compose.prod.yml up -d

# 3. Check status
docker-compose -f docker-compose.prod.yml ps
```

## 🔄 Database Migrations

### Migration Scripts

#### Master Migration Runner
```bash
# Run migrations for development (Docker)
./run-migrations.sh dev

# Run migrations for production (existing database)
./run-migrations.sh prod

# Force run all migrations (ignore tracking)
./run-migrations.sh dev --force

# Dry run (show what would be executed)
./run-migrations.sh prod --dry-run

# Run production migrations without confirmation (automated)
./run-migrations.sh prod --no-confirm
```

#### Environment-Specific Runners
```bash
# Development migrations (requires Docker PostgreSQL)
./run-migrations-dev.sh

# Production migrations (requires psql client)
./run-migrations-prod.sh
```

### Migration Features

- **Automatic Tracking**: Migrations are tracked to prevent re-execution
- **Ordered Execution**: Files are executed in alphabetical order
- **Error Handling**: Stops on first migration failure
- **Dry Run Mode**: Preview migrations without executing
- **Force Mode**: Re-run all migrations ignoring tracking
- **Connection Testing**: Validates database connectivity before running
- **Production Safety**: Confirmation prompt for production migrations
- **Schema Compatibility**: Handles both old and new migration table schemas

### Migration File Format

### Migration File Format
```sql
-- Example migration file: 001_create_users_table.sql
CREATE TABLE users (
    id SERIAL PRIMARY KEY,
    username VARCHAR(50) UNIQUE NOT NULL,
    email VARCHAR(255) UNIQUE NOT NULL,
    password VARCHAR(255) NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);
```

### Manual Migration Execution
```bash
# Connect to the database
docker-compose -f docker-compose.dev.yml exec postgres psql -U postgres -d scoreteam_dev

# Or for production
docker-compose -f docker-compose.prod.yml exec postgres psql -U scoreteam_user -d $POSTGRES_DB
```

### Migration Tracking

The migration system uses a `migrations` table to track executed migrations:

```sql
CREATE TABLE migrations (
    id SERIAL PRIMARY KEY,
    filename VARCHAR(255) UNIQUE NOT NULL,
    executed_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);
```

This prevents migrations from being executed multiple times and provides an audit trail.

## 💾 Backup and Recovery

### Creating Backups
```bash
# Development backup
docker-compose -f docker-compose.dev.yml exec postgres pg_dump -U postgres scoreteam_dev > backup_dev.sql

# Production backup
docker-compose -f docker-compose.prod.yml exec postgres pg_dump -U scoreteam_user scoreteam > backup_prod.sql
```

### Restoring Backups
```bash
# Development restore
docker-compose -f docker-compose.dev.yml exec -T postgres psql -U postgres scoreteam_dev < backup_dev.sql

# Production restore
docker-compose -f docker-compose.prod.yml exec -T postgres psql -U scoreteam_user scoreteam < backup_prod.sql
```

## 🔍 Monitoring and Logs

### View Logs
```bash
# Development logs
docker-compose -f docker-compose.dev.yml logs -f postgres

# Production logs
docker-compose -f docker-compose.prod.yml logs -f postgres
```

### Health Checks
```bash
# Check if PostgreSQL is ready
docker-compose -f docker-compose.dev.yml exec postgres pg_isready -U postgres -d scoreteam_dev

# Production health check
docker-compose -f docker-compose.prod.yml exec postgres pg_isready -U scoreteam_user -d scoreteam
```

### Connection Testing
```bash
# Test database connection
docker-compose -f docker-compose.dev.yml exec postgres psql -U postgres -d scoreteam_dev -c "SELECT version();"
```

## 🔒 Security Features

### Development Security
- Default credentials for easy setup
- Exposed ports for local development
- Basic security settings

### Production Security
- Custom user credentials
- Security options enabled
- Read-only filesystem where possible
- Temporary filesystem for sensitive data
- Automatic backup creation before deployment

## 🌐 Network Configuration

### Development Network
- Network: `postgres-network-dev`
- Port: `5432` (configurable)
- Access: `localhost:5432`

### Production Network
- Network: `postgres-network-prod`
- Port: `5432` (configurable)
- Access: `localhost:5432` (or your server IP)

## 📊 Data Persistence

### Development Data
- Volume: `postgres_data_dev`
- Location: Docker managed volume
- Purpose: Development data persistence

### Production Data
- Volume: `postgres_data_prod`
- Location: Docker managed volume
- Purpose: Production data persistence
- Backup: Automatic backups in `backups/` directory

## 🚨 Troubleshooting

### Common Issues

1. **Port Already in Use**
   ```bash
   # Check what's using port 5432
   lsof -i :5432
   
   # Change port in env file
   POSTGRES_PORT=5433
   ```

2. **Permission Denied**
   ```bash
   # Fix script permissions
   chmod +x deploy-dev.sh deploy-prod.sh init-migrations.sh
   ```

3. **Migration Errors**
   ```bash
   # Check migration logs
   docker-compose -f docker-compose.dev.yml logs postgres | grep -i migration
   ```

4. **Database Connection Failed**
   ```bash
   # Check if container is running
   docker-compose -f docker-compose.dev.yml ps
   
   # Check container logs
   docker-compose -f docker-compose.dev.yml logs postgres
   ```

### Reset Database
```bash
# Stop containers
docker-compose -f docker-compose.dev.yml down

# Remove volumes (WARNING: This will delete all data!)
docker volume rm postgres-deployment_postgres_data_dev

# Restart
docker-compose -f docker-compose.dev.yml up -d
```

## 🔧 Advanced Configuration

### Custom PostgreSQL Configuration
Create a `postgresql.conf` file and mount it:
```yaml
volumes:
  - ./postgresql.conf:/etc/postgresql/postgresql.conf
```

### Environment Variables
Additional PostgreSQL environment variables:
- `POSTGRES_INITDB_ARGS`: Additional initdb arguments
- `POSTGRES_HOST_AUTH_METHOD`: Authentication method
- `POSTGRES_SHARED_PRELOAD_LIBRARIES`: Shared libraries to preload

## 📝 Default Credentials

### Development
- **Database**: `scoreteam_dev`
- **User**: `postgres`
- **Password**: `postgres123`
- **Port**: `5432`

### Production
- **Database**: `scoreteam`
- **User**: `scoreteam_user`
- **Password**: (set in `env.prod`)
- **Port**: `5432`

## 🔄 Integration with Other Components

### API Connection
Update your API's `.env` file to connect to PostgreSQL:

```bash
# Development
DB_HOST=localhost
DB_PORT=5432
DB_NAME=scoreteam_dev
DB_USER=postgres
DB_PASSWORD=postgres123

# Production
DB_HOST=localhost
DB_PORT=5432
DB_NAME=scoreteam
DB_USER=scoreteam_user
DB_PASSWORD=your_production_password
```

## 📋 Deployment Checklist

### Development
- [ ] Docker and Docker Compose installed
- [ ] Migrations copied to `migrations/` directory
- [ ] `env.dev` file configured
- [ ] Port 5432 available
- [ ] Run `./deploy-dev.sh`

### Production
- [ ] Docker and Docker Compose installed
- [ ] Migrations copied to `migrations/` directory
- [ ] `env.prod` file configured with secure password
- [ ] Port 5432 available
- [ ] Backup strategy in place
- [ ] Run `./deploy-prod.sh`
- [ ] Test database connection
- [ ] Verify migrations executed successfully
