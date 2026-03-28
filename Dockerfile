FROM node:20-alpine
WORKDIR /app

# Copia os manifestos
COPY package*.json ./

# npm install (não exige lockfile sincronizado)
RUN npm install

# Copia o código fonte
COPY . .

# Gera o Prisma Client (Prisma 6)
RUN npx prisma generate

# Compila o NestJS
RUN npm run build

# DEBUG: mostra o que foi gerado no dist
RUN echo "=== Conteúdo do /app/dist ===" && ls -la /app/dist/ || echo "ERRO: /app/dist está vazio ou não existe!"
RUN echo "=== Procurando main.js ===" && find /app/dist -name "main.js" || echo "ERRO: main.js não encontrado!"

EXPOSE 3000

CMD ["sh", "-c", "npx prisma migrate deploy && node dist/main"]
