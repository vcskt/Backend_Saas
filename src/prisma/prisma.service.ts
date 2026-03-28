import { Injectable, OnModuleInit, OnModuleDestroy } from '@nestjs/common';
import { PrismaClient } from '@prisma/client';

@Injectable()
export class PrismaService implements OnModuleInit, OnModuleDestroy {
  private readonly prisma = new PrismaClient();

  get user()    { return this.prisma.user; }
  get clients() { return this.prisma.client; }
  get news()    { return this.prisma.news; }
  get comment() { return this.prisma.comment; }
  get store()   { return this.prisma.store; }

  async onModuleInit()    { await this.prisma.$connect(); }
  async onModuleDestroy() { await this.prisma.$disconnect(); }
}
