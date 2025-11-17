import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from 'src/prisma/prisma.service';
import { ContentQueryDto } from '../dto/content-query.dto';
import {
  CreateTestimonialDto,
  UpdateTestimonialDto,
} from '../dto/testimonial.dto';

@Injectable()
export class TestimonialService {
  constructor(private readonly prisma: PrismaService) {}

  async list(query: ContentQueryDto) {
    const {
      page = 1,
      limit = 10,
      search,
      isActive,
      isFeatured,
      sortBy = 'displayOrder',
      sortOrder = 'asc',
    } = query;

    const where: any = {};
    if (typeof isActive === 'boolean') where.isActive = isActive;
    if (typeof isFeatured === 'boolean') where.isFeatured = isFeatured;
    if (search) {
      where.OR = [
        { name: { contains: search, mode: 'insensitive' } },
        { position: { contains: search, mode: 'insensitive' } },
        { company: { contains: search, mode: 'insensitive' } },
        { content: { contains: search, mode: 'insensitive' } },
      ];
    }

    const [total, items] = await this.prisma.$transaction([
      this.prisma.testimonial.count({ where }),
      this.prisma.testimonial.findMany({
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
      message: 'Testimonials retrieved successfully',
    };
  }

  async getById(id: string) {
    const item = await this.prisma.testimonial.findUnique({ where: { id } });
    if (!item) throw new NotFoundException('Testimonial not found');
    return {
      status: true,
      data: item,
      message: 'Testimonial retrieved successfully',
    };
  }

  async create(dto: CreateTestimonialDto, userId?: string) {
    const created = await this.prisma.testimonial.create({
      data: { ...dto, updatedBy: userId },
    });
    return {
      status: true,
      data: created,
      message: 'Testimonial created successfully',
    };
  }

  async update(id: string, dto: UpdateTestimonialDto, userId?: string) {
    const updated = await this.prisma.testimonial.update({
      where: { id },
      data: { ...dto, updatedBy: userId },
    });
    return {
      status: true,
      data: updated,
      message: 'Testimonial updated successfully',
    };
  }

  async delete(id: string) {
    await this.prisma.testimonial.delete({ where: { id } });
    return {
      status: true,
      data: null,
      message: 'Testimonial deleted successfully',
    };
  }

  async reorder(ids: string[]) {
    await this.prisma.$transaction(
      ids.map((id, index) =>
        this.prisma.testimonial.update({
          where: { id },
          data: { displayOrder: index },
        }),
      ),
    );
    return {
      status: true,
      data: null,
      message: 'Testimonials reordered successfully',
    };
  }

  async active(limit = 10, featured?: boolean) {
    const where: any = { isActive: true };
    if (typeof featured === 'boolean') where.isFeatured = featured;

    const items = await this.prisma.testimonial.findMany({
      where,
      orderBy: [{ isFeatured: 'desc' }, { displayOrder: 'asc' }],
      take: limit,
    });
    return {
      status: true,
      data: items,
      message: 'Active testimonials retrieved successfully',
    };
  }
}
