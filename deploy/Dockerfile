# ============================================
# StackAudit.ai Production Dockerfile
# Multi-stage build for optimized production image
# ============================================

# Stage 1: Build the React frontend
FROM node:20-alpine AS client-builder

WORKDIR /app/client

# Copy client package files
COPY client/package*.json ./

# Install dependencies
RUN npm ci --only=production=false

# Copy client source
COPY client/ ./

# Build production bundle
RUN npm run build

# Stage 2: Production server image
FROM node:20-alpine AS production

# Security: Create non-root user
RUN addgroup -g 1001 -S stackaudit && \
    adduser -S stackaudit -u 1001 -G stackaudit

WORKDIR /app

# Install security updates
RUN apk update && apk upgrade && \
    apk add --no-cache dumb-init && \
    rm -rf /var/cache/apk/*

# Copy server package files
COPY server/package*.json ./

# Install production dependencies only
RUN npm ci --only=production && \
    npm cache clean --force

# Copy server source
COPY server/ ./

# Copy built client from builder stage
COPY --from=client-builder /app/client/dist ./public

# Create necessary directories
RUN mkdir -p /app/logs /app/uploads /app/temp && \
    chown -R stackaudit:stackaudit /app

# Switch to non-root user
USER stackaudit

# Expose port
EXPOSE 3000

# Health check
HEALTHCHECK --interval=30s --timeout=10s --start-period=5s --retries=3 \
    CMD wget --no-verbose --tries=1 --spider http://localhost:3000/health || exit 1

# Use dumb-init as PID 1 for proper signal handling
ENTRYPOINT ["dumb-init", "--"]

# Start the application (use src/index.js - the main API server)
CMD ["node", "src/index.js"]
