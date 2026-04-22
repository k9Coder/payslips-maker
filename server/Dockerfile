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

# Install server production deps only
COPY package.json package-lock.json ./
COPY server/package.json ./server/
RUN npm ci --workspace=server --omit=dev

# Place compiled shared directly in node_modules (avoids workspace symlink issues)
COPY shared/package.json ./node_modules/@payslips-maker/shared/package.json
COPY --from=builder /app/shared/dist ./node_modules/@payslips-maker/shared/dist

# Copy compiled server
COPY --from=builder /app/server/dist ./server/dist

EXPOSE 3001
CMD ["node", "server/dist/app.js"]
