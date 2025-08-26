#!/bin/bash

echo "Updating environment files..."

# Update .env file
echo "# Frontend Environment Variables" > .env
echo "VITE_API_URL=http://localhost:3001/api" >> .env

# Update .env.local file
echo "VITE_API_URL=http://localhost:3001/api" > .env.local

echo "✅ Environment files updated!"
echo "📝 .env and .env.local now contain VITE_API_URL=http://localhost:3001/api"
echo ""
echo "🚀 For production, you can set:"
echo "   VITE_API_URL=https://your-production-domain.com/api"
echo ""
echo "🔄 Restart your frontend development server to pick up the changes."
