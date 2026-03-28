import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateClientDto, UpdateClientDto } from './dto/client.dto';

@Injectable()
export class ClientsService {
  constructor(private prisma: PrismaService) {}

  async create(dto: CreateClientDto, userId: number) {
    return this.prisma.clients.create({
      data: { ...dto, userId },
    });
  }

  async findAll() {
    return this.prisma.clients.findMany({
      include: { user: { select: { name: true, email: true } } },
    });
  }

  async findOne(id: number) {
    const client = await this.prisma.clients.findUnique({
      where: { id },
      include: { comments: true },
    });
    if (!client) throw new NotFoundException(`Cliente #${id} não encontrado.`);
    return client;
  }

  async update(id: number, dto: UpdateClientDto) {
    await this.findOne(id);
    return this.prisma.clients.update({ where: { id }, data: dto });
  }

  async remove(id: number) {
    await this.findOne(id);
    await this.prisma.clients.delete({ where: { id } });
    return { message: `Cliente #${id} removido.` };
  }
}
