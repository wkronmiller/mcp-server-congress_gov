# syntax=docker/dockerfile:1.7

# ---- Base builder image ----
FROM node:20-alpine AS builder

WORKDIR /app

# Install dependencies first (leverages Docker layer cache)
COPY package.json package-lock.json ./
RUN npm ci

# Copy source and build
COPY tsconfig.json ./
COPY src ./src
COPY assets ./assets

RUN npm run build

# ---- Production runtime image ----
FROM node:20-alpine AS runner

ENV NODE_ENV=production \
    NODE_OPTIONS=--enable-source-maps \
    PORT=3000

WORKDIR /app

# Install only prod dependencies
COPY package.json package-lock.json ./
RUN npm ci --omit=dev && npm cache clean --force

# Copy built artifacts and any runtime assets
COPY --from=builder /app/dist ./dist
COPY --from=builder /app/assets ./assets

# Use non-root user for security
USER node

EXPOSE 3000

CMD ["node", "dist/server.js"]

