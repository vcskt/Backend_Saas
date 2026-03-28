import { CommentsService } from './comments.service';
import { CreateCommentDto, UpdateCommentDto } from './dto/comment.dto';
export declare class CommentsController {
    private commentsService;
    constructor(commentsService: CommentsService);
    create(dto: CreateCommentDto, req: any): Promise<{
        client: {
            name: string;
            id: number;
            createdAt: Date;
            document: string | null;
            phone: string | null;
            address: string | null;
            userId: number | null;
        };
        author: {
            name: string;
        };
    } & {
        id: number;
        createdAt: Date;
        clientId: number;
        authorId: number;
        content: string;
    }>;
    findAll(): Promise<({
        client: {
            name: string;
        };
        author: {
            name: string;
        };
    } & {
        id: number;
        createdAt: Date;
        clientId: number;
        authorId: number;
        content: string;
    })[]>;
    findByClient(clientId: number): Promise<({
        author: {
            name: string;
        };
    } & {
        id: number;
        createdAt: Date;
        clientId: number;
        authorId: number;
        content: string;
    })[]>;
    update(id: number, dto: UpdateCommentDto): Promise<{
        id: number;
        createdAt: Date;
        clientId: number;
        authorId: number;
        content: string;
    }>;
    remove(id: number): Promise<{
        message: string;
    }>;
}
