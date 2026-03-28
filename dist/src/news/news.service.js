"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.NewsService = void 0;
const common_1 = require("@nestjs/common");
const prisma_service_1 = require("../prisma/prisma.service");
let NewsService = class NewsService {
    prisma;
    constructor(prisma) {
        this.prisma = prisma;
    }
    async create(dto, authorId) {
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
    async findOne(id) {
        const news = await this.prisma.news.findUnique({
            where: { id },
            include: { author: { select: { name: true } } },
        });
        if (!news)
            throw new common_1.NotFoundException(`Notícia #${id} não encontrada.`);
        return news;
    }
    async update(id, dto) {
        await this.findOne(id);
        return this.prisma.news.update({ where: { id }, data: dto });
    }
    async remove(id) {
        await this.findOne(id);
        await this.prisma.news.delete({ where: { id } });
        return { message: `Notícia #${id} removida.` };
    }
};
exports.NewsService = NewsService;
exports.NewsService = NewsService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService])
], NewsService);
//# sourceMappingURL=news.service.js.map