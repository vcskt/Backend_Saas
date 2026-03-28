import { ClientsService } from './clients.service';
import { CreateClientDto, UpdateClientDto } from './dto/client.dto';
export declare class ClientsController {
    private clientsService;
    constructor(clientsService: ClientsService);
    create(dto: CreateClientDto, req: any): Promise<{
        name: string;
        id: number;
        createdAt: Date;
        document: string | null;
        phone: string | null;
        address: string | null;
        userId: number | null;
    }>;
    findAll(): Promise<({
        user: {
            name: string;
            email: string;
        } | null;
    } & {
        name: string;
        id: number;
        createdAt: Date;
        document: string | null;
        phone: string | null;
        address: string | null;
        userId: number | null;
    })[]>;
    findOne(id: number): Promise<{
        comments: {
            id: number;
            createdAt: Date;
            clientId: number;
            authorId: number;
            content: string;
        }[];
    } & {
        name: string;
        id: number;
        createdAt: Date;
        document: string | null;
        phone: string | null;
        address: string | null;
        userId: number | null;
    }>;
    update(id: number, dto: UpdateClientDto): Promise<{
        name: string;
        id: number;
        createdAt: Date;
        document: string | null;
        phone: string | null;
        address: string | null;
        userId: number | null;
    }>;
    remove(id: number): Promise<{
        message: string;
    }>;
}
