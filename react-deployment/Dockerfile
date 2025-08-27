# Multi-stage build for React + Vite application
FROM node:18-alpine AS builder

# Set working directory
WORKDIR /app
ENV CI=true
# Use pnpm
RUN corepack enable && corepack prepare pnpm@9 --activate


# Copy package files
COPY package*.json pnpm-lock.yaml ./

# Install all dependencies (including dev dependencies for build)
# Install deps, fail if lockfile doesn't match
RUN --mount=type=cache,target=/root/.local/share/pnpm/store \
    pnpm install --frozen-lockfile

# Copy source code and .env file
COPY . .

# Set build-time environment variables
ARG VITE_API_URL
ARG VITE_APP_TITLE

# Build the application with production mode
RUN pnpm run build

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
