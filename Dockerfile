# Build stage
FROM node:20-alpine AS builder
WORKDIR /app
COPY package*.json ./
# Instala TODAS as dependências (inclusive as de dev como @nestjs/cli para conseguirmos empacotar o código)
RUN npm ci
COPY . .
# Gera o cliente do Prisma
RUN npx prisma generate
# Empacota a aplicação do NestJS
RUN npm run build

# Production dependencies stage
FROM node:20-alpine AS deps
WORKDIR /app
COPY package*.json ./
# Agora sim instalamos APENAS as dependências levíssimas de produção
RUN npm ci --omit=dev
COPY prisma ./prisma
RUN npx prisma generate

# Production stage
FROM node:20-alpine AS production
WORKDIR /app
ENV NODE_ENV=production

COPY --from=builder /app/dist ./dist
COPY --from=deps /app/node_modules ./node_modules
COPY --from=builder /app/package.json ./
COPY --from=builder /app/prisma ./prisma
COPY --from=builder /app/prisma.config.ts ./

EXPOSE 3000

# Aplicar migrações pendentes e iniciar a aplicação
CMD ["sh", "-c", "npx prisma migrate deploy && node dist/main"]
