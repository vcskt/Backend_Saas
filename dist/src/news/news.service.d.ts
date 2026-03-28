import { PrismaService } from '../prisma/prisma.service';
import { CreateNewsDto, UpdateNewsDto } from './dto/news.dto';
export declare class NewsService {
    private prisma;
    constructor(prisma: PrismaService);
    create(dto: CreateNewsDto, authorId: number): Promise<{
        author: {
            name: string;
        };
    } & {
        id: number;
        createdAt: Date;
        authorId: number;
        content: string;
        title: string;
    }>;
    findAll(): Promise<({
        author: {
            name: string;
        };
    } & {
        id: number;
        createdAt: Date;
        authorId: number;
        content: string;
        title: string;
    })[]>;
    findOne(id: number): Promise<{
        author: {
            name: string;
        };
    } & {
        id: number;
        createdAt: Date;
        authorId: number;
        content: string;
        title: string;
    }>;
    update(id: number, dto: UpdateNewsDto): Promise<{
        id: number;
        createdAt: Date;
        authorId: number;
        content: string;
        title: string;
    }>;
    remove(id: number): Promise<{
        message: string;
    }>;
}
