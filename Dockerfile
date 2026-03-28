FROM node:20-alpine
WORKDIR /app

# Copia os manifestos
COPY package*.json ./

# npm install (não falha se o lock file estiver desatualizado)
RUN npm install

# Copia o código fonte
COPY . .

# Gera o Prisma Client (Prisma 6 — classic API)
RUN npx prisma generate

# Compila o NestJS → /app/dist
RUN npm run build

EXPOSE 3000

# Roda migrations e inicia a API
CMD ["sh", "-c", "npx prisma migrate deploy && node dist/main"]
