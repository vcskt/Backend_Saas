import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateNewsDto, UpdateNewsDto } from './dto/news.dto';

@Injectable()
export class NewsService {
  constructor(private prisma: PrismaService) {}

  async create(dto: CreateNewsDto, authorId: number) {
    return this.prisma.news.create({
      data: { ...dto, authorId },
      include: { author: { select: { name: true } } },
    });
  }

  async findAll() {
    return this.prisma.news.findMany({
      include: { author: { select: { name: true } } },
      orderBy: { createdAt: 'desc' },
    });
  }

  async findOne(id: number) {
    const news = await this.prisma.news.findUnique({
      where: { id },
      include: { author: { select: { name: true } } },
    });
    if (!news) throw new NotFoundException(`Notícia #${id} não encontrada.`);
    return news;
  }

  async update(id: number, dto: UpdateNewsDto) {
    await this.findOne(id);
    return this.prisma.news.update({ where: { id }, data: dto });
  }

  async remove(id: number) {
    await this.findOne(id);
    await this.prisma.news.delete({ where: { id } });
    return { message: `Notícia #${id} removida.` };
  }
}
