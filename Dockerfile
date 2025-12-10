# Multi-stage build for Eloquent AI
FROM node:18-alpine AS base

# Install system dependencies
RUN apk add --no-cache \
    python3 \
    make \
    g++ \
    ffmpeg \
    curl \
    bash

# Set working directory
WORKDIR /app

# Copy package files
COPY package*.json ./
COPY client/package*.json ./client/

# Install dependencies
RUN npm ci --only=production && \
    cd client && npm ci --only=production

# Copy source code
COPY . .

# Build client
RUN cd client && npm run build

# Production stage
FROM node:18-alpine AS production

# Install system dependencies
RUN apk add --no-cache \
    python3 \
    make \
    g++ \
    ffmpeg \
    curl \
    bash \
    sqlite

# Create app user
RUN addgroup -g 1001 -S nodejs && \
    adduser -S eloquentai -u 1001

# Set working directory
WORKDIR /app

# Copy built application
COPY --from=base --chown=eloquentai:nodejs /app/node_modules ./node_modules
COPY --from=base --chown=eloquentai:nodejs /app/client/build ./client/build
COPY --from=base --chown=eloquentai:nodejs /app/server ./server
COPY --from=base --chown=eloquentai:nodejs /app/package*.json ./

# Create necessary directories
RUN mkdir -p /app/uploads /app/database /app/logs && \
    chown -R eloquentai:nodejs /app

# Switch to non-root user
USER eloquentai

# Expose ports
EXPOSE 5001 3000

# Health check
HEALTHCHECK --interval=30s --timeout=3s --start-period=5s --retries=3 \
    CMD curl -f http://localhost:5001/api/health || exit 1

# Start application
CMD ["npm", "start"]
