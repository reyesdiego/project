#!/bin/bash

# Simple deployment script for ScoreTeam application

set -e

echo "🚀 Starting ScoreTeam deployment..."

# Check if .env file exists
if [ ! -f ".env" ]; then
    echo "❌ Missing .env file!"
    echo "Please create a .env file with your Supabase configuration."
    echo "You can copy env.example and update it with your values:"
    echo "  cp env.example .env"
    echo "  # Then edit .env with your actual Supabase credentials"
    exit 1
fi

# Check if required environment variables are in .env file
if ! grep -q "VITE_SUPABASE_URL=" .env || ! grep -q "VITE_SUPABASE_ANON_KEY=" .env; then
    echo "❌ Missing required environment variables in .env file!"
    echo "Please ensure your .env file contains:"
    echo "  VITE_SUPABASE_URL=your_supabase_url"
    echo "  VITE_SUPABASE_ANON_KEY=your_supabase_anon_key"
    exit 1
fi

# Load environment variables from .env file
export $(cat .env | grep -v '^#' | xargs)

# Check if Docker is running
if ! docker info > /dev/null 2>&1; then
    echo "❌ Docker is not running. Please start Docker and try again."
    exit 1
fi

# Build and start the application with explicit environment variables
echo "📦 Building and starting the application..."
docker-compose up --build -d

echo "✅ Deployment completed!"
echo ""
echo "🌐 Application URL:"
echo "   Frontend: http://localhost"
echo ""
echo "📋 Useful commands:"
echo "   View logs: docker-compose logs -f"
echo "   Stop app: docker-compose down"
echo "   Restart: docker-compose restart"
