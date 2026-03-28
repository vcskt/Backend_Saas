# ============================================================
# Stage 1 — Builder: instala tudo e compila o TypeScript
# ============================================================
FROM node:20-alpine AS builder

WORKDIR /app

# Copia os manifestos de dependências
COPY package*.json ./

# Instala TODAS as dependências (incluindo devDeps — necessário para nest build e prisma)
RUN npm ci

# Copia todo o código fonte
COPY . .

# Gera os tipos do Prisma Client
RUN npx prisma generate

# Compila o NestJS → gera /app/dist
RUN npm run build

# ============================================================
# Stage 2 — Runner: imagem final enxuta apenas com o essencial
# ============================================================
FROM node:20-alpine AS runner

WORKDIR /app

# Copia os manifestos
COPY package*.json ./

# Instala apenas dependências de produção
RUN npm ci --omit=dev

# Copia o Prisma Client gerado (binários nativos do alpine)
COPY --from=builder /app/node_modules/.prisma ./node_modules/.prisma
COPY --from=builder /app/node_modules/@prisma ./node_modules/@prisma

# Copia o schema e config do Prisma (necessário para migrate deploy)
COPY --from=builder /app/prisma ./prisma
COPY --from=builder /app/prisma.config.ts ./prisma.config.ts

# Copia o build compilado
COPY --from=builder /app/dist ./dist

# Expõe a porta da API
EXPOSE 3000

# Executa as migrações e inicia a API
CMD ["sh", "-c", "npx prisma migrate deploy && node dist/main"]
