FROM node:20-alpine
WORKDIR /app

# 1. Copia manifestos e instala TODAS as dependências (necessário pro prisma rodar migrations depois lendo ts)
COPY package*.json ./
RUN npm ci

# 2. Copia o resto do código
COPY . .

# 3. Gera os tipos do Prisma para o Node
RUN npx prisma generate

# 4. Empacota a aplicação do NestJS
RUN npm run build

# Ouve na porta 3000
EXPOSE 3000

# Roda as migrações (se houver banco desatualizado) e inicia a API
CMD ["sh", "-c", "npx prisma migrate deploy && node dist/main"]
