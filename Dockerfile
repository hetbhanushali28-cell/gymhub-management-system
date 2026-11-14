# Multi-stage optimized Node.js Dockerfile for GymHub Backend
FROM node:20-alpine AS base

WORKDIR /app

# Install dependencies based on server package.json
COPY server/package*.json ./
RUN npm ci --only=production

# Copy server application source code
COPY server/ .

# Expose backend port
EXPOSE 5000

ENV NODE_ENV=production
ENV PORT=5000

# Start server
CMD ["node", "server.js"]

