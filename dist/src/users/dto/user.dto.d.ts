import { Role } from '@prisma/client';
export declare class CreateUserDto {
    name: string;
    email: string;
    password: string;
    role?: Role;
}
export declare class UpdateUserDto {
    name?: string;
    role?: Role;
}
