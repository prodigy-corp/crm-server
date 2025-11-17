import { Injectable, Logger } from '@nestjs/common';
import { PrismaService } from 'src/prisma/prisma.service';

export interface DashboardStats {
  blogs: {
    total: number;
    published: number;
    draft: number;
    scheduled: number;
    archived: number;
  };
  engagement: {
    totalViews: number;
    totalLikes: number;
    totalComments: number;
    totalShares: number;
  };
  recent: {
    recentBlogs: any[];
    recentComments: any[];
    pendingComments: number;
  };
  analytics: {
    viewsThisMonth: number;
    viewsLastMonth: number;
    viewsGrowth: number;
    topBlogs: any[];
  };
  seo: {
    averageSEOScore: number;
    needsImprovement: number;
    indexableBlogs: number;
  };
}

@Injectable()
export class DashboardService {
  constructor(private readonly prisma: PrismaService) {}
  private readonly logger = new Logger(DashboardService.name);

  /**
   * Get comprehensive dashboard statistics
   */
  async getDashboardStats(): Promise<{
    status: boolean;
    data: DashboardStats;
  }> {
    try {
      const [
        totalBlogs,
        publishedBlogs,
        draftBlogs,
        scheduledBlogs,
        archivedBlogs,
        engagementStats,
        recentBlogs,
        recentComments,
        pendingCommentsCount,
        viewsThisMonth,
        viewsLastMonth,
        topBlogs,
        indexableCount,
      ] = await Promise.all([
        // Blog counts
        this.prisma.blog.count({ where: { deletedAt: null } }),
        this.prisma.blog.count({
          where: { status: 'PUBLISHED', deletedAt: null },
        }),
        this.prisma.blog.count({ where: { status: 'DRAFT', deletedAt: null } }),
        this.prisma.blog.count({
          where: { status: 'SCHEDULED', deletedAt: null },
        }),
        this.prisma.blog.count({
          where: { status: 'ARCHIVED', deletedAt: null },
        }),

        // Engagement stats
        this.prisma.blog.aggregate({
          where: { deletedAt: null },
          _sum: {
            viewCount: true,
            likeCount: true,
            commentCount: true,
            shareCount: true,
          },
        }),

        // Recent blogs
        this.prisma.blog.findMany({
          take: 5,
          orderBy: { createdAt: 'desc' },
          where: { deletedAt: null },
          select: {
            id: true,
            title: true,
            slug: true,
            status: true,
            viewCount: true,
            createdAt: true,
            author: {
              select: {
                name: true,
                avatar: true,
              },
            },
          },
        }),

        // Recent comments
        this.prisma.blogComment.findMany({
          take: 5,
          orderBy: { createdAt: 'desc' },
          where: { deletedAt: null },
          select: {
            id: true,
            content: true,
            createdAt: true,
            status: true,
            blog: {
              select: {
                title: true,
                slug: true,
              },
            },
          },
        }),

        // Pending comments count
        this.prisma.blogComment.count({
          where: { status: 'PENDING', deletedAt: null },
        }),

        // Views this month
        this.getViewsForPeriod(this.getStartOfMonth(), new Date()),

        // Views last month
        this.getViewsForPeriod(
          this.getStartOfLastMonth(),
          this.getStartOfMonth(),
        ),

        // Top blogs by views
        this.prisma.blog.findMany({
          take: 10,
          orderBy: { viewCount: 'desc' },
          where: { status: 'PUBLISHED', deletedAt: null },
          select: {
            id: true,
            title: true,
            slug: true,
            viewCount: true,
            likeCount: true,
            commentCount: true,
          },
        }),

        // Indexable blogs
        this.prisma.blog.count({
          where: { isIndexable: true, status: 'PUBLISHED', deletedAt: null },
        }),
      ]);

      // Calculate views growth
      const viewsGrowth =
        viewsLastMonth > 0
          ? ((viewsThisMonth - viewsLastMonth) / viewsLastMonth) * 100
          : 0;

      const stats: DashboardStats = {
        blogs: {
          total: totalBlogs,
          published: publishedBlogs,
          draft: draftBlogs,
          scheduled: scheduledBlogs,
          archived: archivedBlogs,
        },
        engagement: {
          totalViews: engagementStats._sum.viewCount || 0,
          totalLikes: engagementStats._sum.likeCount || 0,
          totalComments: engagementStats._sum.commentCount || 0,
          totalShares: engagementStats._sum.shareCount || 0,
        },
        recent: {
          recentBlogs,
          recentComments,
          pendingComments: pendingCommentsCount,
        },
        analytics: {
          viewsThisMonth,
          viewsLastMonth,
          viewsGrowth: Math.round(viewsGrowth),
          topBlogs,
        },
        seo: {
          averageSEOScore: 0, // Will be calculated if needed
          needsImprovement: 0, // Will be calculated if needed
          indexableBlogs: indexableCount,
        },
      };

      return {
        status: true,
        data: stats,
      };
    } catch (error) {
      this.logger.error(`Failed to get dashboard stats: ${error.message}`);
      throw error;
    }
  }

  /**
   * Get views for specific time period
   */
  private async getViewsForPeriod(
    startDate: Date,
    endDate: Date,
  ): Promise<number> {
    const result = await this.prisma.blogView.count({
      where: {
        createdAt: {
          gte: startDate,
          lt: endDate,
        },
      },
    });
    return result;
  }

  /**
   * Get start of current month
   */
  private getStartOfMonth(): Date {
    const now = new Date();
    return new Date(now.getFullYear(), now.getMonth(), 1);
  }

  /**
   * Get start of last month
   */
  private getStartOfLastMonth(): Date {
    const now = new Date();
    return new Date(now.getFullYear(), now.getMonth() - 1, 1);
  }

  /**
   * Get analytics for specific date range
   */
  async getAnalytics(startDate: string, endDate: string) {
    const start = new Date(startDate);
    const end = new Date(endDate);

    const [views, topBlogs, categoryStats] = await Promise.all([
      // Total views in range
      this.prisma.blogView.count({
        where: {
          createdAt: {
            gte: start,
            lte: end,
          },
        },
      }),

      // Top performing blogs
      this.prisma.blog.findMany({
        take: 10,
        where: {
          publishedAt: {
            gte: start,
            lte: end,
          },
          status: 'PUBLISHED',
          deletedAt: null,
        },
        orderBy: { viewCount: 'desc' },
        select: {
          id: true,
          title: true,
          slug: true,
          viewCount: true,
          likeCount: true,
          commentCount: true,
          publishedAt: true,
        },
      }),

      // Category performance
      this.prisma.category.findMany({
        where: {
          blogs: {
            some: {
              publishedAt: {
                gte: start,
                lte: end,
              },
              status: 'PUBLISHED',
              deletedAt: null,
            },
          },
        },
        select: {
          id: true,
          name: true,
          slug: true,
          _count: {
            select: {
              blogs: {
                where: {
                  publishedAt: {
                    gte: start,
                    lte: end,
                  },
                  status: 'PUBLISHED',
                  deletedAt: null,
                },
              },
            },
          },
        },
      }),
    ]);

    return {
      status: true,
      data: {
        period: {
          start: startDate,
          end: endDate,
        },
        views,
        topBlogs,
        categoryStats: categoryStats.map((cat) => ({
          id: cat.id,
          name: cat.name,
          slug: cat.slug,
          postsCount: cat._count.blogs,
        })),
      },
    };
  }

  /**
   * Get traffic sources analytics
   */
  async getTrafficSources(days: number = 30) {
    const startDate = new Date();
    startDate.setDate(startDate.getDate() - days);

    const views = await this.prisma.blogView.findMany({
      where: {
        createdAt: {
          gte: startDate,
        },
      },
      select: {
        referer: true,
        country: true,
        city: true,
      },
    });

    // Aggregate referrers
    const referrerMap = new Map<string, number>();
    const countryMap = new Map<string, number>();

    views.forEach((view) => {
      if (view.referer) {
        const count = referrerMap.get(view.referer) || 0;
        referrerMap.set(view.referer, count + 1);
      }
      if (view.country) {
        const count = countryMap.get(view.country) || 0;
        countryMap.set(view.country, count + 1);
      }
    });

    const topReferrers = Array.from(referrerMap.entries())
      .map(([source, count]) => ({ source, count }))
      .sort((a, b) => b.count - a.count)
      .slice(0, 10);

    const topCountries = Array.from(countryMap.entries())
      .map(([country, count]) => ({ country, count }))
      .sort((a, b) => b.count - a.count)
      .slice(0, 10);

    return {
      status: true,
      data: {
        period: `Last ${days} days`,
        totalViews: views.length,
        topReferrers,
        topCountries,
      },
    };
  }

  /**
   * Get content performance metrics
   */
  async getContentPerformance() {
    const blogs = await this.prisma.blog.findMany({
      where: {
        status: 'PUBLISHED',
        deletedAt: null,
      },
      select: {
        id: true,
        title: true,
        slug: true,
        viewCount: true,
        likeCount: true,
        commentCount: true,
        shareCount: true,
        readingTime: true,
        wordCount: true,
        publishedAt: true,
      },
    });

    // Calculate engagement rate for each blog
    const blogsWithEngagement = blogs.map((blog) => {
      const totalEngagement =
        blog.likeCount + blog.commentCount + blog.shareCount;
      const engagementRate =
        blog.viewCount > 0 ? (totalEngagement / blog.viewCount) * 100 : 0;

      return {
        ...blog,
        totalEngagement,
        engagementRate: Number(engagementRate.toFixed(2)),
      };
    });

    // Sort by engagement rate
    blogsWithEngagement.sort((a, b) => b.engagementRate - a.engagementRate);

    const averageEngagementRate =
      blogsWithEngagement.reduce((sum, blog) => sum + blog.engagementRate, 0) /
      blogsWithEngagement.length;

    return {
      status: true,
      data: {
        totalBlogs: blogs.length,
        averageEngagementRate: Number(averageEngagementRate.toFixed(2)),
        topPerformers: blogsWithEngagement.slice(0, 10),
        underPerformers: blogsWithEngagement
          .filter((b) => b.engagementRate < averageEngagementRate / 2)
          .slice(0, 10),
      },
    };
  }

  /**
   * Get author performance statistics
   */
  async getAuthorStats() {
    const authors = await this.prisma.user.findMany({
      where: {
        blogs: {
          some: {
            status: 'PUBLISHED',
            deletedAt: null,
          },
        },
      },
      select: {
        id: true,
        name: true,
        email: true,
        avatar: true,
        _count: {
          select: {
            blogs: {
              where: {
                status: 'PUBLISHED',
                deletedAt: null,
              },
            },
          },
        },
        blogs: {
          where: {
            status: 'PUBLISHED',
            deletedAt: null,
          },
          select: {
            viewCount: true,
            likeCount: true,
            commentCount: true,
          },
        },
      },
    });

    const authorStats = authors.map((author) => {
      const totalViews = author.blogs.reduce((sum, b) => sum + b.viewCount, 0);
      const totalLikes = author.blogs.reduce((sum, b) => sum + b.likeCount, 0);
      const totalComments = author.blogs.reduce(
        (sum, b) => sum + b.commentCount,
        0,
      );

      return {
        id: author.id,
        name: author.name,
        email: author.email,
        avatar: author.avatar,
        postsCount: author._count.blogs,
        totalViews,
        totalLikes,
        totalComments,
        averageViews:
          author._count.blogs > 0
            ? Math.round(totalViews / author._count.blogs)
            : 0,
      };
    });

    // Sort by total views
    authorStats.sort((a, b) => b.totalViews - a.totalViews);

    return {
      status: true,
      data: authorStats,
    };
  }
}
