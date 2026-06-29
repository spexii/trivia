FROM node:24-alpine AS deps
WORKDIR /app
RUN apk add --no-cache openssl
COPY package*.json ./
COPY bot/package*.json ./bot/
COPY web/package*.json ./web/
COPY prisma ./prisma
RUN npm ci && npx prisma generate

# ---- Dev targets (used by docker-compose.dev.yml) ----

FROM node:24-alpine AS dev-web
WORKDIR /app
RUN apk add --no-cache openssl
COPY --from=deps /app/node_modules ./node_modules
COPY . .
EXPOSE 3000
CMD ["npm", "run", "dev", "--workspace=web"]

FROM node:24-alpine AS dev-bot
WORKDIR /app
RUN apk add --no-cache openssl
COPY --from=deps /app/node_modules ./node_modules
COPY . .
EXPOSE 3001
CMD ["node", "--watch", "bot/index.js"]

# ---- Builder (Next.js production build + Prisma generate) ----

FROM node:24-alpine AS builder
WORKDIR /app
RUN apk add --no-cache openssl
COPY --from=deps /app/node_modules ./node_modules
COPY . .
RUN npx prisma generate
RUN npm run build --workspace=web

# ---- Production: web (Next.js standalone) ----

FROM node:24-alpine AS production-web
WORKDIR /app
ENV NODE_ENV=production
COPY --from=builder /app/web/.next/standalone ./
COPY --from=builder /app/web/.next/static ./web/.next/static
COPY --from=builder /app/web/public ./web/public
EXPOSE 3000
CMD ["node", "web/server.js"]

# ---- Production: bot ----

FROM node:24-alpine AS production-bot
WORKDIR /app
ENV NODE_ENV=production
RUN apk add --no-cache openssl
COPY --from=deps /app/node_modules ./node_modules
COPY prisma ./prisma
RUN npx prisma generate
COPY bot ./bot
EXPOSE 3001
CMD ["node", "bot/index.js"]
