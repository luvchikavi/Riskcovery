# ── Stage 1: Dependencies ──
FROM node:20-slim AS deps
RUN corepack enable && corepack prepare pnpm@9.0.0 --activate
WORKDIR /app

# Copy workspace config
COPY pnpm-workspace.yaml package.json pnpm-lock.yaml ./
COPY apps/api/package.json apps/api/
COPY packages/types/package.json packages/types/
COPY packages/typescript-config/package.json packages/typescript-config/

RUN pnpm install --frozen-lockfile

# ── Stage 2: Build ──
FROM node:20-slim AS builder
RUN corepack enable && corepack prepare pnpm@9.0.0 --activate
WORKDIR /app

COPY --from=deps /app/node_modules ./node_modules
COPY --from=deps /app/apps/api/node_modules ./apps/api/node_modules

# Copy workspace packages source (tsconfig, types, etc.)
COPY packages ./packages

# Copy source
COPY apps/api ./apps/api
COPY pnpm-workspace.yaml package.json pnpm-lock.yaml turbo.json ./

# Generate Prisma client and build
RUN cd apps/api && npx prisma generate
RUN cd apps/api && npx tsc

# ── Stage 3: Runner ──
FROM node:20-slim AS runner
RUN corepack enable && corepack prepare pnpm@9.0.0 --activate
RUN apt-get update -y && apt-get install -y openssl && rm -rf /var/lib/apt/lists/*
WORKDIR /app

ENV NODE_ENV=production

# Copy dependencies, built output, and prisma schema
COPY --from=deps /app/node_modules ./node_modules
COPY --from=deps /app/apps/api/node_modules ./apps/api/node_modules
COPY --from=builder /app/apps/api/dist ./apps/api/dist
COPY --from=builder /app/apps/api/prisma ./apps/api/prisma
COPY apps/api/package.json ./apps/api/

WORKDIR /app/apps/api

# Generate Prisma client in runner context (avoids pnpm path issues)
RUN npx prisma generate

# Run as non-root user
RUN addgroup --system --gid 1001 appgroup && \
    adduser --system --uid 1001 --ingroup appgroup appuser && \
    chown -R appuser:appgroup /app
USER appuser

EXPOSE 3001

CMD ["sh", "-c", "npx prisma migrate deploy && node dist/index.js"]
