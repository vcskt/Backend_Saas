import { Controller, Get, Post, Patch, Delete, Param, Body, UseGuards, Request, ParseIntPipe } from '@nestjs/common';
import { StoresService } from './stores.service';
import { CreateStoreDto, UpdateStoreDto } from './dto/store.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../auth/decorators/roles.decorator';
import { Role } from '@prisma/client';

@UseGuards(JwtAuthGuard)
@Controller('stores')
export class StoresController {
  constructor(private storesService: StoresService) {}

  /** POST /api/stores → USER cria sua loja */
  @Post()
  create(@Body() dto: CreateStoreDto, @Request() req) {
    return this.storesService.create(dto, req.user.id);
  }

  /** GET /api/stores/mine → USER vê suas lojas */
  @Get('mine')
  findMine(@Request() req) {
    return this.storesService.findMine(req.user.id);
  }

  /** GET /api/stores → Somente ADMIN vê todas */
  @UseGuards(RolesGuard)
  @Roles(Role.ADMIN)
  @Get()
  findAll() {
    return this.storesService.findAll();
  }

  /** GET /api/stores/:id */
  @Get(':id')
  findOne(@Param('id', ParseIntPipe) id: number) {
    return this.storesService.findOne(id);
  }

  /** PATCH /api/stores/:id → Owner ou ADMIN */
  @Patch(':id')
  update(@Param('id', ParseIntPipe) id: number, @Body() dto: UpdateStoreDto, @Request() req) {
    return this.storesService.update(id, dto, req.user.id, req.user.role === Role.ADMIN);
  }

  /** DELETE /api/stores/:id → Owner ou ADMIN */
  @Delete(':id')
  remove(@Param('id', ParseIntPipe) id: number, @Request() req) {
    return this.storesService.remove(id, req.user.id, req.user.role === Role.ADMIN);
  }
}
