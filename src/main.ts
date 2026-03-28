import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { ValidationPipe } from '@nestjs/common';
import helmet from 'helmet';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  // Prefixo global para todas as rotas (Ex: /api/auth/login)
  app.setGlobalPrefix('api');

  // Helmet: Headers de segurança HTTP
  app.use(helmet());

  // CORS: Aceitar só requisições do Angular
  app.enableCors({
    origin: process.env.FRONTEND_URL || '*',
    methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE'],
    credentials: true,
  });

  // Validação automática de todos os DTOs
  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,       // Remove campos não declarados no DTO
      forbidNonWhitelisted: true, // Retorna erro se vier campo extra
      transform: true,       // Converte tipos automaticamente
    }),
  );

  await app.listen(process.env.PORT ?? 3000);
  console.log(`🚀 API Blackjag rodando em: ${await app.getUrl()}/api`);
}
bootstrap();
