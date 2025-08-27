# ScoreTeam Deployment Guide

This guide explains how to deploy the ScoreTeam application using separate Docker configurations for each component.

## Architecture Overview

The application consists of three main components:

1. **PostgreSQL Database** (`postgres-deployment/`)
2. **REST API Server** (`api-deployment/`)
3. **React Frontend** (`react-deployment/`)

Each component can be deployed independently on different servers or containers.

## Deployment Order

Deploy the components in this order:

1. **PostgreSQL Database** (required by API)
2. **REST API Server** (required by Frontend)
3. **React Frontend** (depends on API)

## Step 1: Deploy PostgreSQL Database

### Development Deployment
```bash
cd postgres-deployment

# Deploy in development mode
./deploy-dev.sh
```

### Production Deployment
```bash
cd postgres-deployment

# Configure production environment
cp env.prod.example env.prod
# Edit env.prod with your production database credentials

# Deploy in production mode
./deploy-prod.sh
```

### Using the Main Deployment Script
```bash
# Deploy PostgreSQL in development mode
./deploy-all.sh postgres dev

# Deploy PostgreSQL in production mode
./deploy-all.sh postgres prod
```

### Running Migrations Only

If you only need to run migrations (without deploying PostgreSQL):

```bash
cd postgres-deployment

# Development migrations (requires Docker PostgreSQL running)
./run-migrations.sh dev

# Production migrations (requires existing database)
./run-migrations.sh prod

# Preview migrations without executing
./run-migrations.sh prod --dry-run

# Force run all migrations
./run-migrations.sh dev --force
```

## Step 2: Deploy REST API Server

```bash
cd api-deployment

# Copy server source code
cp -r ../server/* .

# Configure environment
cp env.example .env
# Edit .env with your database connection details and API configuration

# Deploy
docker-compose up -d
```

## Step 3: Deploy React Frontend

```bash
cd react-deployment

# Copy frontend source code
cp -r ../src ../package*.json ../vite.config.ts ../tsconfig*.json ../tailwind.config.js ../postcss.config.js .

# Configure environment
cp env.example .env
# Edit .env with your API URL

# Deploy
docker-compose up -d
```

## Environment Configuration

### PostgreSQL Development (env.dev)
```bash
POSTGRES_DB=scoreteam_dev
POSTGRES_USER=postgres
POSTGRES_PASSWORD=postgres123
POSTGRES_PORT=5432
```

### PostgreSQL Production (env.prod)
```bash
POSTGRES_DB=scoreteam
POSTGRES_USER=scoreteam_user
POSTGRES_PASSWORD=your_very_secure_production_password
POSTGRES_PORT=5432
```

### API (.env)
```bash
NODE_ENV=production
PORT=3001
DB_HOST=your_postgres_host
DB_PORT=5432
DB_NAME=scoreteam
DB_USER=postgres
DB_PASSWORD=your_secure_password
JWT_SECRET=your_jwt_secret
JWT_EXPIRES_IN=24h
CORS_ORIGIN=https://your-frontend-domain.com
RATE_LIMIT_WINDOW_MS=900000
RATE_LIMIT_MAX_REQUESTS=1000
```

### Frontend (.env)
```bash
VITE_API_URL=http://your-api-domain.com:3001
VITE_APP_TITLE=ScoreTeam Dashboard
```

## Network Configuration

### Option 1: Same Server
If all components are on the same server:
- PostgreSQL: `localhost:5432`
- API: `localhost:3001`
- Frontend: `localhost:80`

### Option 2: Different Servers
If components are on different servers:
- Update the respective `.env` files with the correct hostnames/IPs
- Ensure proper network connectivity between servers
- Configure firewalls to allow necessary ports

## Health Checks

Each component includes health check endpoints:

- **PostgreSQL**: Built-in health check using `pg_isready`
- **API**: `GET /health`
- **Frontend**: `GET /health`

## Monitoring

Check the status of each component:

```bash
# PostgreSQL
cd postgres-deployment
docker-compose ps
docker-compose logs -f postgres

# API
cd api-deployment
docker-compose ps
docker-compose logs -f api

# Frontend
cd react-deployment
docker-compose ps
docker-compose logs -f frontend
```

## Scaling

Each component can be scaled independently:

### API Scaling
```bash
cd api-deployment
docker-compose up -d --scale api=3
```

### Frontend Scaling
```bash
cd react-deployment
docker-compose up -d --scale frontend=2
```

Note: When scaling the frontend, you'll need a load balancer (like nginx or traefik) in front of the containers.

## Backup and Recovery

### Database Backup
```bash
cd postgres-deployment
docker-compose exec postgres pg_dump -U postgres scoreteam > backup.sql
```

### Database Restore
```bash
cd postgres-deployment
docker-compose exec -T postgres psql -U postgres scoreteam < backup.sql
```

## Troubleshooting

### Common Issues

1. **API can't connect to database**
   - Check database host and port in API `.env`
   - Verify database is running and accessible
   - Check firewall settings

2. **Frontend can't connect to API**
   - Check API URL in frontend `.env`
   - Verify API is running and accessible
   - Check CORS configuration in API

3. **Database connection refused**
   - Check if PostgreSQL container is running
   - Verify port mapping in docker-compose
   - Check database credentials

### Logs
```bash
# View logs for all components
docker-compose logs -f

# View specific service logs
docker-compose logs -f [service-name]
```

## Security Considerations

1. **Use strong passwords** for database and JWT secrets
2. **Enable HTTPS** in production using reverse proxy
3. **Restrict database access** to only necessary IPs
4. **Regular security updates** for base images
5. **Monitor logs** for suspicious activity

## Production Checklist

- [ ] All environment variables configured
- [ ] Strong passwords and secrets set
- [ ] HTTPS enabled (if applicable)
- [ ] Database backups configured
- [ ] Monitoring and logging set up
- [ ] Health checks passing
- [ ] All components communicating properly
