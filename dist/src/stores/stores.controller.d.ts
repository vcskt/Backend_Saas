import { StoresService } from './stores.service';
import { CreateStoreDto, UpdateStoreDto } from './dto/store.dto';
export declare class StoresController {
    private storesService;
    constructor(storesService: StoresService);
    create(dto: CreateStoreDto, req: any): Promise<{
        name: string;
        id: number;
        createdAt: Date;
        description: string | null;
        ownerId: number;
    }>;
    findMine(req: any): Promise<{
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
    update(id: number, dto: UpdateStoreDto, req: any): Promise<{
        name: string;
        id: number;
        createdAt: Date;
        description: string | null;
        ownerId: number;
    }>;
    remove(id: number, req: any): Promise<{
        message: string;
    }>;
}
