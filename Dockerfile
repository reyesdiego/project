# Multi-stage build for React + Vite application
FROM node:18-alpine AS builder

# Set working directory
WORKDIR /app

# Copy package files
COPY package*.json ./

# Install all dependencies (including dev dependencies for build)
RUN npm ci

# Copy source code and .env file
COPY . .

# Set build-time environment variables
ARG VITE_SUPABASE_URL
ARG VITE_SUPABASE_ANON_KEY

# Build the application with production mode
RUN npm run build

# Production stage
FROM nginx:alpine AS production

# Copy built application from builder stage
COPY --from=builder /app/dist /usr/share/nginx/html

# Copy custom nginx configuration
COPY nginx.conf /etc/nginx/nginx.conf

# Expose port 80
EXPOSE 80

# Start nginx
CMD ["nginx", "-g", "daemon off;"]
