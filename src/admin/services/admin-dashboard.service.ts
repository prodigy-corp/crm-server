import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';

@Injectable()
export class AdminDashboardService {
  constructor(private readonly prisma: PrismaService) {}

  async getDashboardStats() {
    const [
      totalUsers,
      activeUsers,
      totalBlogs,
      publishedBlogs,
      totalComments,
      pendingComments,
      totalViews,
      recentUsers,
    ] = await Promise.all([
      this.prisma.user.count({ where: { deletedAt: null } }),
      this.prisma.user.count({ where: { status: 'ACTIVE', deletedAt: null } }),
      this.prisma.blog.count({ where: { deletedAt: null } }),
      this.prisma.blog.count({
        where: { status: 'PUBLISHED', deletedAt: null },
      }),
      this.prisma.blogComment.count({ where: { deletedAt: null } }),
      this.prisma.blogComment.count({
        where: { status: 'PENDING', deletedAt: null },
      }),
      this.prisma.blog.aggregate({
        _sum: { viewCount: true },
        where: { deletedAt: null },
      }),
      this.prisma.user.count({
        where: {
          createdAt: { gte: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000) },
          deletedAt: null,
        },
      }),
    ]);

    return {
      users: {
        total: totalUsers,
        active: activeUsers,
        recent: recentUsers,
      },
      blogs: {
        total: totalBlogs,
        published: publishedBlogs,
        draft: totalBlogs - publishedBlogs,
      },
      comments: {
        total: totalComments,
        pending: pendingComments,
        approved: totalComments - pendingComments,
      },
      analytics: {
        totalViews: totalViews._sum.viewCount || 0,
      },
    };
  }

  async getRecentActivities() {
    const [recentUsers, recentBlogs, recentComments] = await Promise.all([
      this.prisma.user.findMany({
        where: { deletedAt: null },
        orderBy: { createdAt: 'desc' },
        take: 5,
        select: {
          id: true,
          name: true,
          email: true,
          createdAt: true,
        },
      }),
      this.prisma.blog.findMany({
        where: { deletedAt: null },
        orderBy: { createdAt: 'desc' },
        take: 5,
        select: {
          id: true,
          title: true,
          status: true,
          createdAt: true,
          author: {
            select: {
              name: true,
            },
          },
        },
      }),
      this.prisma.blogComment.findMany({
        where: { deletedAt: null },
        orderBy: { createdAt: 'desc' },
        take: 5,
        select: {
          id: true,
          content: true,
          status: true,
          createdAt: true,
          blog: {
            select: {
              title: true,
            },
          },
        },
      }),
    ]);

    return {
      recentUsers,
      recentBlogs,
      recentComments,
    };
  }

  async getAnalytics() {
    const thirtyDaysAgo = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000);

    const [userGrowth, blogGrowth, viewsGrowth] = await Promise.all([
      this.prisma.user.groupBy({
        by: ['createdAt'],
        where: {
          createdAt: { gte: thirtyDaysAgo },
          deletedAt: null,
        },
        _count: true,
      }),
      this.prisma.blog.groupBy({
        by: ['createdAt'],
        where: {
          createdAt: { gte: thirtyDaysAgo },
          deletedAt: null,
        },
        _count: true,
      }),
      this.prisma.blogView.groupBy({
        by: ['createdAt'],
        where: {
          createdAt: { gte: thirtyDaysAgo },
        },
        _count: true,
      }),
    ]);

    return {
      userGrowth,
      blogGrowth,
      viewsGrowth,
    };
  }
}
