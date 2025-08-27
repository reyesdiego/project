# ScoreTeam Frontend Deployment

This directory contains the deployment configuration for the ScoreTeam React frontend.

## Prerequisites

- Docker and Docker Compose installed
- API server running (can be deployed separately using the api-deployment directory)

## Environment Variables

Copy the example environment file and configure it:

```bash
cp env.example .env
```

Update the `.env` file with your actual values:

- `VITE_API_URL`: URL of your API server
- `VITE_APP_TITLE`: Application title

## Deployment

1. Copy the frontend source code to this directory:
   ```bash
   cp -r ../src ../package*.json ../vite.config.ts ../tsconfig*.json ../tailwind.config.js ../postcss.config.js .
   ```

2. Build and run the frontend:
   ```bash
   docker-compose up -d
   ```

3. Check the logs:
   ```bash
   docker-compose logs -f frontend
   ```

## Features

- Multi-stage build for optimized production image
- Nginx server with optimized configuration
- Gzip compression for better performance
- Security headers
- Static asset caching
- Health check endpoint at `/health`
- React Router support with fallback to index.html

## Access

The application will be available at `http://localhost` (or your server's IP address).

## Health Check

The frontend includes a health check endpoint at `/health` that Docker uses to monitor the service.
