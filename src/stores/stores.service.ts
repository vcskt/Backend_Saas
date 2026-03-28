import { Injectable, NotFoundException, ForbiddenException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateStoreDto, UpdateStoreDto } from './dto/store.dto';

@Injectable()
export class StoresService {
  constructor(private prisma: PrismaService) {}

  async create(dto: CreateStoreDto, ownerId: number) {
    return this.prisma.store.create({
      data: { ...dto, ownerId },
    });
  }

  // Usuário só vê suas próprias lojas
  async findMine(ownerId: number) {
    return this.prisma.store.findMany({ where: { ownerId } });
  }

  // ADMIN vê todas
  async findAll() {
    return this.prisma.store.findMany({
      include: { owner: { select: { name: true, email: true } } },
    });
  }

  async findOne(id: number) {
    const store = await this.prisma.store.findUnique({ where: { id } });
    if (!store) throw new NotFoundException(`Loja #${id} não encontrada.`);
    return store;
  }

  async update(id: number, dto: UpdateStoreDto, userId: number, isAdmin: boolean) {
    const store = await this.findOne(id);
    if (!isAdmin && store.ownerId !== userId) {
      throw new ForbiddenException('Você só pode editar sua própria loja.');
    }
    return this.prisma.store.update({ where: { id }, data: dto });
  }

  async remove(id: number, userId: number, isAdmin: boolean) {
    const store = await this.findOne(id);
    if (!isAdmin && store.ownerId !== userId) {
      throw new ForbiddenException('Você só pode remover sua própria loja.');
    }
    await this.prisma.store.delete({ where: { id } });
    return { message: `Loja #${id} removida.` };
  }
}
