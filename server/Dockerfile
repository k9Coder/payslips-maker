# ---- Build stage ----
FROM node:20-alpine AS builder
WORKDIR /app

# Copy workspace manifests first (better layer caching)
COPY package.json package-lock.json ./
COPY shared/package.json ./shared/
COPY server/package.json ./server/
RUN npm ci --workspace=shared --workspace=server

# Copy source and build
COPY tsconfig.json ./
COPY shared/ ./shared/
COPY server/ ./server/
RUN npm run build -w shared && npm run build -w server

# ---- Runtime stage ----
FROM node:20-alpine AS runner
WORKDIR /app
ENV NODE_ENV=production

# Install production deps — root-level npm ci creates inter-workspace symlinks
COPY package.json package-lock.json ./
COPY shared/package.json ./shared/
COPY server/package.json ./server/
COPY client/package.json ./client/
RUN npm ci --omit=dev

# Copy compiled output
COPY --from=builder /app/shared/dist ./shared/dist
COPY --from=builder /app/server/dist ./server/dist

EXPOSE 3001
CMD ["node", "server/dist/app.js"]
