import { PrismaService } from '../prisma/prisma.service';
import { UpdateUserDto } from './dto/user.dto';
export declare class UsersService {
    private prisma;
    constructor(prisma: PrismaService);
    findAll(): Promise<{
        name: string;
        email: string;
        id: number;
        role: import(".prisma/client").$Enums.Role;
        createdAt: Date;
    }[]>;
    findOne(id: number): Promise<{
        name: string;
        email: string;
        id: number;
        role: import(".prisma/client").$Enums.Role;
        createdAt: Date;
    }>;
    update(id: number, dto: UpdateUserDto): Promise<{
        name: string;
        email: string;
        id: number;
        role: import(".prisma/client").$Enums.Role;
    }>;
    remove(id: number): Promise<{
        message: string;
    }>;
}
