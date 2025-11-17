import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import { BlogStatus } from '@prisma/client';

@Injectable()
export class AdminBlogsService {
  constructor(private readonly prisma: PrismaService) {}

  async getAllBlogs(query: any) {
    const {
      page = 1,
      limit = 10,
      search,
      status,
      authorId,
      sortBy = 'createdAt',
      sortOrder = 'desc',
    } = query;

    // Convert string values to numbers
    const pageNum = parseInt(page, 10) || 1;
    const limitNum = parseInt(limit, 10) || 10;

    const skip = (pageNum - 1) * limitNum;
    const take = limitNum;

    const where: any = { deletedAt: null };

    if (search) {
      where.OR = [
        { title: { contains: search, mode: 'insensitive' } },
        { content: { contains: search, mode: 'insensitive' } },
      ];
    }

    if (status) where.status = status;
    if (authorId) where.authorId = authorId;

    const total = await this.prisma.blog.count({ where });
    const blogs = await this.prisma.blog.findMany({
      where,
      skip,
      take,
      orderBy: { [sortBy]: sortOrder },
      select: {
        id: true,
        title: true,
        slug: true,
        status: true,
        viewCount: true,
        likeCount: true,
        commentCount: true,
        publishedAt: true,
        createdAt: true,
        author: {
          select: {
            id: true,
            name: true,
            email: true,
          },
        },
        category: {
          select: {
            id: true,
            name: true,
          },
        },
      },
    });

    return {
      data: blogs,
      meta: {
        total,
        page: pageNum,
        limit: limitNum,
        totalPages: Math.ceil(total / limitNum),
      },
    };
  }

  async getBlogById(id: string) {
    const blog = await this.prisma.blog.findFirst({
      where: { id, deletedAt: null },
      include: {
        author: {
          select: {
            id: true,
            name: true,
            email: true,
          },
        },
        category: true,
        tags: {
          include: {
            tag: true,
          },
        },
        comments: {
          take: 10,
          orderBy: { createdAt: 'desc' },
        },
      },
    });

    if (!blog) {
      throw new NotFoundException('Blog not found');
    }

    return blog;
  }

  async updateBlogStatus(id: string, status: string) {
    const blog = await this.prisma.blog.findFirst({
      where: { id, deletedAt: null },
    });

    if (!blog) {
      throw new NotFoundException('Blog not found');
    }

    const updatedBlog = await this.prisma.blog.update({
      where: { id },
      data: {
        status: status as BlogStatus,
        ...(status === 'PUBLISHED' &&
          !blog.publishedAt && { publishedAt: new Date() }),
      },
      select: {
        id: true,
        title: true,
        status: true,
        publishedAt: true,
      },
    });

    return updatedBlog;
  }

  async deleteBlog(id: string) {
    const blog = await this.prisma.blog.findFirst({
      where: { id, deletedAt: null },
    });

    if (!blog) {
      throw new NotFoundException('Blog not found');
    }

    await this.prisma.blog.update({
      where: { id },
      data: { deletedAt: new Date() },
    });

    return { message: 'Blog deleted successfully' };
  }

  async getBlogAnalytics() {
    const [totalBlogs, publishedBlogs, draftBlogs, totalViews, totalComments] =
      await Promise.all([
        this.prisma.blog.count({ where: { deletedAt: null } }),
        this.prisma.blog.count({
          where: { status: 'PUBLISHED', deletedAt: null },
        }),
        this.prisma.blog.count({ where: { status: 'DRAFT', deletedAt: null } }),
        this.prisma.blog.aggregate({
          _sum: { viewCount: true },
          where: { deletedAt: null },
        }),
        this.prisma.blog.aggregate({
          _sum: { commentCount: true },
          where: { deletedAt: null },
        }),
      ]);

    return {
      totalBlogs,
      publishedBlogs,
      draftBlogs,
      totalViews: totalViews._sum.viewCount || 0,
      totalComments: totalComments._sum.commentCount || 0,
    };
  }
}
