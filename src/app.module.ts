import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { ThrottlerModule, ThrottlerGuard } from '@nestjs/throttler';
import { APP_GUARD } from '@nestjs/core';

import { PrismaModule } from './prisma/prisma.module';
import { AuthModule } from './auth/auth.module';
import { UsersModule } from './users/users.module';
import { ClientsModule } from './clients/clients.module';
import { NewsModule } from './news/news.module';
import { CommentsModule } from './comments/comments.module';
import { StoresModule } from './stores/stores.module';

@Module({
  imports: [
    // Carrega .env globalmente
    ConfigModule.forRoot({ isGlobal: true }),

    // Rate Limiting: máximo 60 requisições por minuto por IP (anti DDoS / Brute Force)
    ThrottlerModule.forRoot([
      {
        ttl: 60000, // janela em ms (1 minuto)
        limit: 60,  // máximo de requests por janela
      },
    ]),

    PrismaModule,  // @Global - disponível em todos os módulos
    AuthModule,
    UsersModule,
    ClientsModule,
    NewsModule,
    CommentsModule,
    StoresModule,
  ],
  providers: [
    // Aplica Rate Limiting globalmente em todos os endpoints
    {
      provide: APP_GUARD,
      useClass: ThrottlerGuard,
    },
  ],
})
export class AppModule {}
