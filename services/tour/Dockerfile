# ---------- BUILD STAGE ----------
FROM node:20-alpine AS builder

WORKDIR /app

COPY package.json package-lock.json ./
RUN npm ci

COPY . .

# Build TypeScript + copy migrations
RUN npm run build


# ---------- RUNNER STAGE ----------
FROM node:20-alpine AS runner

WORKDIR /app

ENV NODE_ENV=production
ENV PORT=3000

# Copy runtime files
COPY --from=builder /app/dist ./dist
COPY --from=builder /app/node_modules ./node_modules
COPY --from=builder /app/package.json ./

EXPOSE 3000

# 👉 CHẠY MIGRATION RỒI MỚI START APP
CMD ["node", "dist/server.js"]
