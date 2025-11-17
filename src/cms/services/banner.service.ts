import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from 'src/prisma/prisma.service';
import { ContentQueryDto } from '../dto/content-query.dto';
import { CreateBannerDto, UpdateBannerDto } from '../dto/banner.dto';

@Injectable()
export class BannerService {
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
        { message: { contains: search, mode: 'insensitive' } },
      ];
    }

    const [total, items] = await this.prisma.$transaction([
      this.prisma.banner.count({ where }),
      this.prisma.banner.findMany({
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
      message: 'Banners retrieved successfully',
    };
  }

  async getById(id: string) {
    const item = await this.prisma.banner.findUnique({ where: { id } });
    if (!item) throw new NotFoundException('Banner not found');
    return {
      status: true,
      data: item,
      message: 'Banner retrieved successfully',
    };
  }

  async create(dto: CreateBannerDto, userId?: string) {
    const data: any = { ...dto, updatedBy: userId };
    if (dto.startDate) data.startDate = new Date(dto.startDate);
    if (dto.endDate) data.endDate = new Date(dto.endDate);
    const created = await this.prisma.banner.create({ data });
    return {
      status: true,
      data: created,
      message: 'Banner created successfully',
    };
  }

  async update(id: string, dto: UpdateBannerDto, userId?: string) {
    const data: any = { ...dto, updatedBy: userId };
    if (dto.startDate) data.startDate = new Date(dto.startDate);
    if (dto.endDate) data.endDate = new Date(dto.endDate);
    const updated = await this.prisma.banner.update({ where: { id }, data });
    return {
      status: true,
      data: updated,
      message: 'Banner updated successfully',
    };
  }

  async delete(id: string) {
    await this.prisma.banner.delete({ where: { id } });
    return { status: true, data: null, message: 'Banner deleted successfully' };
  }

  async reorder(ids: string[]) {
    await this.prisma.$transaction(
      ids.map((id, index) =>
        this.prisma.banner.update({
          where: { id },
          data: { displayOrder: index },
        }),
      ),
    );
    return {
      status: true,
      data: null,
      message: 'Banners reordered successfully',
    };
  }

  async active(limit = 10) {
    const now = new Date();
    const items = await this.prisma.banner.findMany({
      where: {
        isActive: true,
        OR: [
          { startDate: null, endDate: null },
          { startDate: { lte: now }, endDate: null },
          { startDate: null, endDate: { gte: now } },
          { startDate: { lte: now }, endDate: { gte: now } },
        ],
      },
      orderBy: { displayOrder: 'asc' },
      take: limit,
    });
    return {
      status: true,
      data: items,
      message: 'Active banners retrieved successfully',
    };
  }
}
