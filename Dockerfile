# --- Builder Stage ---
FROM node:20-alpine AS builder
WORKDIR /app

# Copy deps manifests and configurations
COPY package*.json tsconfig.json vite.config.ts ./

# Install packages
RUN npm ci

# Copy full codebase
COPY . .

# Build Vite SPA and package Express server as unified dist/server.cjs
RUN npm run build

# --- Runner Stage ---
FROM node:20-alpine AS runner
WORKDIR /app

ENV NODE_ENV=production
ENV PORT=3000

# Copy output files from builder stage
COPY --from=builder /app/package*.json ./
COPY --from=builder /app/dist ./dist
COPY --from=builder /app/node_modules ./node_modules

# Expose server listener port
EXPOSE 3000

# Start deployment using compiled target CJS server
CMD ["npm", "start"]
