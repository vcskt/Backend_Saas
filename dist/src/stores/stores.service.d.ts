import { PrismaService } from '../prisma/prisma.service';
import { CreateStoreDto, UpdateStoreDto } from './dto/store.dto';
export declare class StoresService {
    private prisma;
    constructor(prisma: PrismaService);
    create(dto: CreateStoreDto, ownerId: number): Promise<{
        name: string;
        id: number;
        createdAt: Date;
        description: string | null;
        ownerId: number;
    }>;
    findMine(ownerId: number): Promise<{
        name: string;
        id: number;
        createdAt: Date;
        description: string | null;
        ownerId: number;
    }[]>;
    findAll(): Promise<({
        owner: {
            name: string;
            email: string;
        };
    } & {
        name: string;
        id: number;
        createdAt: Date;
        description: string | null;
        ownerId: number;
    })[]>;
    findOne(id: number): Promise<{
        name: string;
        id: number;
        createdAt: Date;
        description: string | null;
        ownerId: number;
    }>;
    update(id: number, dto: UpdateStoreDto, userId: number, isAdmin: boolean): Promise<{
        name: string;
        id: number;
        createdAt: Date;
        description: string | null;
        ownerId: number;
    }>;
    remove(id: number, userId: number, isAdmin: boolean): Promise<{
        message: string;
    }>;
}
