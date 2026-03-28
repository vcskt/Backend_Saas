import { UsersService } from './users.service';
import { UpdateUserDto } from './dto/user.dto';
export declare class UsersController {
    private usersService;
    constructor(usersService: UsersService);
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
