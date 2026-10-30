# Multi-stage production build for CivicPulse AI on Google Cloud Run
# Stage 1: Build Vite React SPA
FROM node:20-alpine AS builder

WORKDIR /app

# Copy dependency specifications
COPY package.json package-lock.json* ./

# Install all dependencies (including devDependencies for build)
RUN npm install

# Copy application source files
COPY . .

# Build production bundle into dist/
RUN npm run build

# Stage 2: Minimal Production Runtime
FROM node:20-alpine AS runner

WORKDIR /app

ENV NODE_ENV=production
ENV PORT=8080

# Copy package files and install only production dependencies
COPY package.json package-lock.json* ./
RUN npm install --omit=dev

# Copy compiled frontend from builder stage
COPY --from=builder /app/dist ./dist

# Copy backend server
COPY --from=builder /app/server.js ./server.js

# Expose standard Cloud Run port
EXPOSE 8080

# Start Express server listening on 0.0.0.0:8080
CMD ["node", "server.js"]
