import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateCommentDto, UpdateCommentDto } from './dto/comment.dto';

@Injectable()
export class CommentsService {
  constructor(private prisma: PrismaService) {}

  async create(dto: CreateCommentDto, authorId: number) {
    return this.prisma.comment.create({
      data: { ...dto, authorId },
      include: { author: { select: { name: true } }, client: true },
    });
  }

  async findAll() {
    return this.prisma.comment.findMany({
      include: {
        author: { select: { name: true } },
        client: { select: { name: true } },
      },
      orderBy: { createdAt: 'desc' },
    });
  }

  async findByClient(clientId: number) {
    return this.prisma.comment.findMany({
      where: { clientId },
      include: { author: { select: { name: true } } },
    });
  }

  async update(id: number, dto: UpdateCommentDto) {
    const comment = await this.prisma.comment.findUnique({ where: { id } });
    if (!comment) throw new NotFoundException(`Comentário #${id} não encontrado.`);
    return this.prisma.comment.update({ where: { id }, data: dto });
  }

  async remove(id: number) {
    const comment = await this.prisma.comment.findUnique({ where: { id } });
    if (!comment) throw new NotFoundException(`Comentário #${id} não encontrado.`);
    await this.prisma.comment.delete({ where: { id } });
    return { message: `Comentário #${id} removido.` };
  }
}
