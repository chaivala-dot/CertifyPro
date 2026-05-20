# -----------------------------
# Stage 1: Base
# -----------------------------
FROM node:20-alpine AS base
WORKDIR /app

# -----------------------------
# Stage 2: Dependencies (all deps for build)
# -----------------------------
FROM base AS deps
COPY package.json package-lock.json ./
RUN npm ci --include=dev

# -----------------------------
# Stage 3: Build Application
# -----------------------------
FROM base AS builder

# Dummy DATABASE_URL only for prisma generate
ENV DATABASE_URL="postgresql://user:pass@localhost:5432/db"

# Copy all dependencies (including dev)
COPY --from=deps /app/node_modules ./node_modules
COPY . ./

RUN npx prisma generate
RUN npm run build

# -----------------------------
# Stage 4: Production Runtime
# -----------------------------
FROM node:20-alpine AS runtime

WORKDIR /app
ENV NODE_ENV=production
ENV NPM_CONFIG_LOGLEVEL=warn

# Install wget for healthcheck
RUN apk add --no-cache wget

# Security: non-root user
RUN addgroup -S nodegroup && adduser -S nodeuser -G nodegroup

# Copy only required files from builder
COPY --from=builder /app/dist ./dist
COPY --from=builder /app/prisma ./prisma
COPY --from=builder /app/package.json ./package.json
COPY --from=deps /app/package-lock.json ./package-lock.json

# Install production-only dependencies
RUN npm ci --omit=dev --ignore-scripts

# Fix permissions
RUN chown -R nodeuser:nodegroup /app
USER nodeuser

EXPOSE 8000

HEALTHCHECK --interval=30s --timeout=10s --start-period=40s --retries=3 \
    CMD wget --spider -q http://localhost:8000/health || exit 1

CMD ["sh", "-c", "npx prisma migrate deploy && node dist/index.js"]
