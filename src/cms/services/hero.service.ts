import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from 'src/prisma/prisma.service';
import { ContentQueryDto } from '../dto/content-query.dto';
import {
  CreateHeroSectionDto,
  UpdateHeroSectionDto,
} from '../dto/hero-section.dto';

@Injectable()
export class HeroService {
  constructor(private readonly prisma: PrismaService) {}

  async list(query: ContentQueryDto) {
    const {
      page = 1,
      limit = 10,
      search,
      isActive,
      sortBy = 'displayOrder',
      sortOrder = 'asc',
    } = query;

    const where: any = {};
    if (typeof isActive === 'boolean') where.isActive = isActive;
    if (search) {
      where.OR = [
        { title: { contains: search, mode: 'insensitive' } },
        { subtitle: { contains: search, mode: 'insensitive' } },
        { description: { contains: search, mode: 'insensitive' } },
      ];
    }

    const [total, items] = await this.prisma.$transaction([
      this.prisma.heroSection.count({ where }),
      this.prisma.heroSection.findMany({
        where,
        orderBy: { [sortBy]: sortOrder },
        skip: (page - 1) * limit,
        take: limit,
      }),
    ]);

    return {
      status: true,
      data: {
        data: items,
        meta: {
          total,
          page,
          limit,
          totalPages: Math.ceil(total / limit),
        },
      },
      message: 'Hero sections retrieved successfully',
    };
  }

  async getById(id: string) {
    const item = await this.prisma.heroSection.findUnique({ where: { id } });
    if (!item) throw new NotFoundException('Hero section not found');
    return {
      status: true,
      data: item,
      message: 'Hero section retrieved successfully',
    };
  }

  async create(dto: CreateHeroSectionDto, userId?: string) {
    const created = await this.prisma.heroSection.create({
      data: { ...dto, updatedBy: userId },
    });
    return {
      status: true,
      data: created,
      message: 'Hero section created successfully',
    };
  }

  async update(id: string, dto: UpdateHeroSectionDto, userId?: string) {
    const updated = await this.prisma.heroSection.update({
      where: { id },
      data: { ...dto, updatedBy: userId },
    });
    return {
      status: true,
      data: updated,
      message: 'Hero section updated successfully',
    };
  }

  async delete(id: string) {
    await this.prisma.heroSection.delete({ where: { id } });
    return {
      status: true,
      data: null,
      message: 'Hero section deleted successfully',
    };
  }

  async reorder(ids: string[]) {
    await this.prisma.$transaction(
      ids.map((id, index) =>
        this.prisma.heroSection.update({
          where: { id },
          data: { displayOrder: index },
        }),
      ),
    );
    return {
      status: true,
      data: null,
      message: 'Hero sections reordered successfully',
    };
  }

  async active(limit = 10) {
    const items = await this.prisma.heroSection.findMany({
      where: { isActive: true },
      orderBy: { displayOrder: 'asc' },
      take: limit,
    });
    return {
      status: true,
      data: items,
      message: 'Active hero sections retrieved successfully',
    };
  }
}
