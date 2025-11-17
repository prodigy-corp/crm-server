import {
  Injectable,
  Logger,
  NotAcceptableException,
  NotFoundException,
  BadRequestException,
} from '@nestjs/common';
import { PrismaService } from 'src/prisma/prisma.service';
import { UploadService } from 'src/upload/upload.service';
import { CreateBlogDto, createBlogSchema } from './dto/create-blog.dto';
import { UpdateBlogDto, updateBlogSchema } from './dto/update-blog.dto';
import {
  QueryBlogDto,
  queryBlogSchema,
  AdminQueryBlogDto,
  adminQueryBlogSchema,
} from './dto/query-blog.dto';

@Injectable()
export class BlogService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly uploadService: UploadService,
  ) {}
  private readonly logger = new Logger(BlogService.name);

  /**
   * Generate SEO-friendly slug from title
   */
  private generateSlug(title: string): string {
    return title
      .toLowerCase()
      .replace(/[^a-z0-9\s-]/g, '') // Remove special characters
      .trim()
      .replace(/\s+/g, '-') // Replace spaces with hyphens
      .replace(/-+/g, '-') // Replace multiple hyphens with single hyphen
      .substring(0, 200); // Limit length
  }

  /**
   * Calculate reading time based on word count
   */
  private calculateReadingTime(content: string): number {
    const wordsPerMinute = 200;
    const wordCount = content.trim().split(/\s+/).length;
    return Math.ceil(wordCount / wordsPerMinute);
  }

  /**
   * Calculate word count
   */
  private calculateWordCount(content: string): number {
    return content.trim().split(/\s+/).length;
  }

  /**
   * Auto-generate SEO fields if not provided
   */
  private autoGenerateSEOFields(data: CreateBlogDto | UpdateBlogDto) {
    // Auto-generate meta title from title if not provided
    if (data.title && !data.metaTitle) {
      data.metaTitle = data.title.substring(0, 70);
    }

    // Auto-generate meta description from excerpt or content if not provided
    if (!data.metaDescription) {
      if (data.excerpt) {
        data.metaDescription = data.excerpt.substring(0, 160);
      } else if (data.content) {
        const plainText = data.content.replace(/<[^>]*>/g, '').trim();
        data.metaDescription = plainText.substring(0, 160);
      }
    }

    // Auto-generate OG fields from meta fields
    if (!data.ogTitle && data.metaTitle) {
      data.ogTitle = data.metaTitle;
    }
    if (!data.ogDescription && data.metaDescription) {
      data.ogDescription = data.metaDescription;
    }
    if (!data.ogImage && data.featuredImage) {
      data.ogImage = data.featuredImage;
    }

    // Auto-generate Twitter fields from OG fields
    if (!data.twitterTitle && data.ogTitle) {
      data.twitterTitle = data.ogTitle;
    }
    if (!data.twitterDescription && data.ogDescription) {
      data.twitterDescription = data.ogDescription;
    }
    if (!data.twitterImage && data.ogImage) {
      data.twitterImage = data.ogImage;
    }

    return data;
  }

  /**
   * Create a new blog post
   */
  async create(
    data: CreateBlogDto,
    userId: string,
    file?: Express.Multer.File,
  ) {
    const parsedBody = createBlogSchema.safeParse(data);

    if (!parsedBody.success) {
      throw new NotAcceptableException(parsedBody.error);
    }

    // Auto-generate SEO fields
    const enrichedData = this.autoGenerateSEOFields(parsedBody.data);

    // Generate slug from title if not provided
    const slug = enrichedData.slug
      ? enrichedData.slug
      : this.generateSlug(enrichedData.title!);

    // Check if slug already exists
    const existingSlug = await this.prisma.blog.findUnique({
      where: { slug },
    });

    if (existingSlug) {
      throw new NotAcceptableException(
        'Slug already exists. Please provide a unique slug.',
      );
    }

    // Handle featured image upload
    if (file) {
      const uploadResult = await this.uploadService.uploadFile(file, 'blogs');
      enrichedData.featuredImage = uploadResult.Key;
    }

    // Calculate reading time and word count
    const readingTime = this.calculateReadingTime(enrichedData.content!);
    const wordCount = this.calculateWordCount(enrichedData.content!);

    // Handle publishing date
    if (enrichedData.status === 'PUBLISHED' && !enrichedData.publishedAt) {
      enrichedData.publishedAt = new Date().toISOString();
    }

    // Extract tagIds for separate handling
    const { tagIds, ...blogData } = enrichedData;

    // Create blog post
    const blog = await this.prisma.blog.create({
      data: {
        // Required fields
        title: enrichedData.title!,
        content: enrichedData.content!,
        slug,
        authorId: userId,
        // Calculated fields
        readingTime,
        wordCount,
        // Optional fields from blogData
        ...blogData,
        // Date fields
        publishedAt: enrichedData.publishedAt
          ? new Date(enrichedData.publishedAt)
          : null,
        scheduledFor: enrichedData.scheduledFor
          ? new Date(enrichedData.scheduledFor)
          : null,
        // Connect tags if provided
        tags:
          tagIds && tagIds.length > 0
            ? {
                create: tagIds.map((tagId) => ({
                  tag: { connect: { id: tagId } },
                })),
              }
            : undefined,
      },
      include: {
        author: {
          select: {
            id: true,
            name: true,
            email: true,
            avatar: true,
          },
        },
        category: true,
        tags: {
          include: {
            tag: true,
          },
        },
      },
    });

    this.logger.log(`Created blog post with id: ${blog.id}`);

    return {
      status: true,
      data: blog,
      message: 'Blog post created successfully.',
    };
  }

  /**
   * Update a blog post
   */
  async update(
    id: string,
    data: UpdateBlogDto,
    userId: string,
    file?: Express.Multer.File,
  ) {
    const parsedBody = updateBlogSchema.safeParse(data);

    if (!parsedBody.success) {
      throw new NotAcceptableException(parsedBody.error);
    }

    // Check if blog exists
    const blog = await this.prisma.blog.findUnique({
      where: { id },
      include: { tags: true },
    });

    if (!blog) {
      throw new NotFoundException('Blog post not found.');
    }

    // Auto-generate SEO fields
    const enrichedData = this.autoGenerateSEOFields(parsedBody.data);

    // Handle slug update
    if (enrichedData.slug && enrichedData.slug !== blog.slug) {
      const existingSlug = await this.prisma.blog.findUnique({
        where: { slug: enrichedData.slug },
      });

      if (existingSlug && existingSlug.id !== id) {
        throw new NotAcceptableException('Slug already exists.');
      }
    }

    // Handle featured image upload
    if (file) {
      // Delete old image if exists
      if (blog.featuredImage) {
        await this.uploadService.deleteFile(blog.featuredImage);
      }
      const uploadResult = await this.uploadService.uploadFile(file, 'blogs');
      enrichedData.featuredImage = uploadResult.Key;
    }

    // Recalculate reading time and word count if content is updated
    let readingTime = blog.readingTime;
    let wordCount = blog.wordCount;
    if (enrichedData.content) {
      readingTime = this.calculateReadingTime(enrichedData.content);
      wordCount = this.calculateWordCount(enrichedData.content);
    }

    // Handle publishing date
    if (
      enrichedData.status === 'PUBLISHED' &&
      blog.status !== 'PUBLISHED' &&
      !enrichedData.publishedAt
    ) {
      enrichedData.publishedAt = new Date().toISOString();
    }

    // Extract tagIds for separate handling
    const { tagIds, ...blogData } = enrichedData;

    // Prepare tag operations
    const tagOperations = tagIds
      ? {
          deleteMany: {}, // Delete all existing tags
          create: tagIds.map((tagId) => ({
            tag: { connect: { id: tagId } },
          })),
        }
      : undefined;

    // Update blog post
    const updatedBlog = await this.prisma.blog.update({
      where: { id },
      data: {
        ...blogData,
        readingTime,
        wordCount,
        publishedAt: enrichedData.publishedAt
          ? new Date(enrichedData.publishedAt)
          : blog.publishedAt,
        scheduledFor: enrichedData.scheduledFor
          ? new Date(enrichedData.scheduledFor)
          : blog.scheduledFor,
        tags: tagOperations,
      },
      include: {
        author: {
          select: {
            id: true,
            name: true,
            email: true,
            avatar: true,
          },
        },
        category: true,
        tags: {
          include: {
            tag: true,
          },
        },
      },
    });

    this.logger.log(`Updated blog post with id: ${blog.id}`);

    return {
      status: true,
      data: updatedBlog,
      message: 'Blog post updated successfully.',
    };
  }

  /**
   * Get all blog posts with filters and pagination (Public)
   */
  async findAll(query: QueryBlogDto) {
    const parsedQuery = queryBlogSchema.safeParse(query);

    if (!parsedQuery.success) {
      throw new NotAcceptableException(parsedQuery.error);
    }

    const {
      search,
      limit = '10',
      page = '1',
      sortBy = 'createdAt',
      sortOrder = 'desc',
      status,
      categoryId,
      tagId,
      authorId,
      isFeatured,
      publishedFrom,
      publishedTo,
      focusKeyword,
    } = parsedQuery.data;

    const skip = (parseInt(page) - 1) * parseInt(limit);

    const where: any = {
      deletedAt: null,
      // Only show published blogs for public access
      status: status || 'PUBLISHED',
    };

    // Search functionality
    if (search) {
      where.OR = [
        { title: { contains: search, mode: 'insensitive' } },
        { content: { contains: search, mode: 'insensitive' } },
        { excerpt: { contains: search, mode: 'insensitive' } },
      ];
    }

    // Filters
    if (categoryId) {
      where.categoryId = categoryId;
    }

    if (tagId) {
      where.tags = {
        some: {
          tagId: tagId,
        },
      };
    }

    if (authorId) {
      where.authorId = authorId;
    }

    if (isFeatured !== undefined) {
      where.isFeatured = isFeatured;
    }

    if (focusKeyword) {
      where.focusKeyword = { contains: focusKeyword, mode: 'insensitive' };
    }

    // Date range filter
    if (publishedFrom || publishedTo) {
      where.publishedAt = {};
      if (publishedFrom) {
        where.publishedAt.gte = new Date(publishedFrom);
      }
      if (publishedTo) {
        where.publishedAt.lte = new Date(publishedTo);
      }
    }

    const [data, total] = await this.prisma.$transaction([
      this.prisma.blog.findMany({
        where,
        skip: Number(skip),
        take: Number(limit),
        orderBy: { [sortBy as string]: sortOrder },
        include: {
          author: {
            select: {
              id: true,
              name: true,
              email: true,
              avatar: true,
            },
          },
          category: {
            select: {
              id: true,
              name: true,
              slug: true,
            },
          },
          tags: {
            include: {
              tag: {
                select: {
                  id: true,
                  name: true,
                  slug: true,
                },
              },
            },
          },
        },
        // Select only necessary fields for list view
        // Exclude full content to optimize performance
      }),
      this.prisma.blog.count({ where }),
    ]);

    return {
      status: true,
      data: data.map((blog) => ({
        ...blog,
        content: undefined, // Don't send full content in list view
        excerpt: blog.excerpt || blog.content?.substring(0, 200) + '...',
      })),
      meta: {
        total,
        page: parseInt(page),
        limit: parseInt(limit),
        totalPages: Math.ceil(total / parseInt(limit)),
      },
    };
  }

  /**
   * Get all blog posts for admin with additional filters
   */
  async findByAdmin(query: AdminQueryBlogDto) {
    const parsedQuery = adminQueryBlogSchema.safeParse(query);

    if (!parsedQuery.success) {
      throw new NotAcceptableException(parsedQuery.error);
    }

    const {
      search,
      limit = '10',
      page = '1',
      sortBy = 'createdAt',
      sortOrder = 'desc',
      status,
      categoryId,
      tagId,
      authorId,
      isFeatured,
      publishedFrom,
      publishedTo,
      focusKeyword,
      includeDeleted,
      isIndexable,
    } = parsedQuery.data;

    const skip = (parseInt(page) - 1) * parseInt(limit);

    const where: any = {};

    // Include deleted posts if requested
    if (!includeDeleted) {
      where.deletedAt = null;
    }

    // Search functionality
    if (search) {
      where.OR = [
        { title: { contains: search, mode: 'insensitive' } },
        { content: { contains: search, mode: 'insensitive' } },
        { excerpt: { contains: search, mode: 'insensitive' } },
      ];
    }

    // Filters
    if (status) {
      where.status = status;
    }

    if (categoryId) {
      where.categoryId = categoryId;
    }

    if (tagId) {
      where.tags = {
        some: {
          tagId: tagId,
        },
      };
    }

    if (authorId) {
      where.authorId = authorId;
    }

    if (isFeatured !== undefined) {
      where.isFeatured = isFeatured;
    }

    if (isIndexable !== undefined) {
      where.isIndexable = isIndexable;
    }

    if (focusKeyword) {
      where.focusKeyword = { contains: focusKeyword, mode: 'insensitive' };
    }

    // Date range filter
    if (publishedFrom || publishedTo) {
      where.publishedAt = {};
      if (publishedFrom) {
        where.publishedAt.gte = new Date(publishedFrom);
      }
      if (publishedTo) {
        where.publishedAt.lte = new Date(publishedTo);
      }
    }

    const [data, total] = await this.prisma.$transaction([
      this.prisma.blog.findMany({
        where,
        skip: Number(skip),
        take: Number(limit),
        orderBy: { [sortBy as string]: sortOrder },
        include: {
          author: {
            select: {
              id: true,
              name: true,
              email: true,
              avatar: true,
            },
          },
          category: true,
          tags: {
            include: {
              tag: true,
            },
          },
        },
      }),
      this.prisma.blog.count({ where }),
    ]);

    return {
      status: true,
      data: data,
      meta: {
        total,
        page: parseInt(page),
        limit: parseInt(limit),
        totalPages: Math.ceil(total / parseInt(limit)),
      },
    };
  }

  /**
   * Get a single blog post by slug (Public)
   */
  async findBySlug(slug: string, userId?: string, ip?: string) {
    const blog = await this.prisma.blog.findUnique({
      where: { slug, status: 'PUBLISHED', deletedAt: null },
      include: {
        author: {
          select: {
            id: true,
            name: true,
            email: true,
            avatar: true,
          },
        },
        category: true,
        tags: {
          include: {
            tag: true,
          },
        },
        comments: {
          where: {
            status: 'APPROVED',
            parentId: null,
          },
          include: {
            replies: {
              where: {
                status: 'APPROVED',
              },
            },
          },
          orderBy: {
            createdAt: 'desc',
          },
        },
      },
    });

    if (!blog) {
      throw new NotFoundException('Blog post not found.');
    }

    // Track view asynchronously (don't wait for it)
    this.trackView(blog.id, userId, ip).catch((error) => {
      this.logger.error(`Failed to track view: ${error.message}`);
    });

    return {
      status: true,
      data: blog,
    };
  }

  /**
   * Get a single blog post by ID (Admin)
   */
  async findById(id: string) {
    const blog = await this.prisma.blog.findUnique({
      where: { id },
      include: {
        author: {
          select: {
            id: true,
            name: true,
            email: true,
            avatar: true,
          },
        },
        category: true,
        tags: {
          include: {
            tag: true,
          },
        },
        comments: {
          include: {
            replies: true,
          },
          orderBy: {
            createdAt: 'desc',
          },
        },
      },
    });

    if (!blog) {
      throw new NotFoundException('Blog post not found.');
    }

    return {
      status: true,
      data: blog,
    };
  }

  /**
   * Track blog view
   */
  private async trackView(blogId: string, userId?: string, ip?: string) {
    // Increment view count
    await this.prisma.blog.update({
      where: { id: blogId },
      data: {
        viewCount: {
          increment: 1,
        },
      },
    });

    // Create view record for analytics
    await this.prisma.blogView.create({
      data: {
        blogId,
        userId,
        ip,
      },
    });
  }

  /**
   * Soft delete a blog post
   */
  async delete(id: string) {
    const blog = await this.prisma.blog.findUnique({
      where: { id },
    });

    if (!blog) {
      throw new NotFoundException('Blog post not found.');
    }

    await this.prisma.blog.update({
      where: { id },
      data: {
        deletedAt: new Date(),
      },
    });

    this.logger.log(`Soft deleted blog post with id: ${id}`);

    return {
      status: true,
      message: 'Blog post deleted successfully.',
    };
  }

  /**
   * Permanently delete a blog post
   */
  async permanentDelete(id: string) {
    const blog = await this.prisma.blog.findUnique({
      where: { id },
    });

    if (!blog) {
      throw new NotFoundException('Blog post not found.');
    }

    // Delete featured image if exists
    if (blog.featuredImage) {
      await this.uploadService.deleteFile(blog.featuredImage);
    }

    await this.prisma.blog.delete({
      where: { id },
    });

    this.logger.log(`Permanently deleted blog post with id: ${id}`);

    return {
      status: true,
      message: 'Blog post permanently deleted.',
    };
  }

  /**
   * Get featured blog posts
   */
  async getFeaturedBlogs(limit: number = 5) {
    const blogs = await this.prisma.blog.findMany({
      where: {
        isFeatured: true,
        status: 'PUBLISHED',
        deletedAt: null,
      },
      take: limit,
      orderBy: {
        publishedAt: 'desc',
      },
      include: {
        author: {
          select: {
            id: true,
            name: true,
            avatar: true,
          },
        },
        category: {
          select: {
            id: true,
            name: true,
            slug: true,
          },
        },
      },
    });

    return {
      status: true,
      data: blogs,
    };
  }

  /**
   * Get related blog posts based on category and tags
   */
  async getRelatedBlogs(blogId: string, limit: number = 5) {
    const blog = await this.prisma.blog.findUnique({
      where: { id: blogId },
      include: {
        tags: true,
      },
    });

    if (!blog) {
      throw new NotFoundException('Blog post not found.');
    }

    const tagIds = blog.tags.map((t) => t.tagId);

    const relatedBlogs = await this.prisma.blog.findMany({
      where: {
        id: { not: blogId },
        status: 'PUBLISHED',
        deletedAt: null,
        OR: [
          { categoryId: blog.categoryId },
          {
            tags: {
              some: {
                tagId: { in: tagIds },
              },
            },
          },
        ],
      },
      take: limit,
      orderBy: {
        publishedAt: 'desc',
      },
      include: {
        author: {
          select: {
            id: true,
            name: true,
            avatar: true,
          },
        },
        category: {
          select: {
            id: true,
            name: true,
            slug: true,
          },
        },
      },
    });

    return {
      status: true,
      data: relatedBlogs,
    };
  }

  /**
   * Get popular blog posts based on view count
   */
  async getPopularBlogs(limit: number = 10, days: number = 30) {
    const dateFrom = new Date();
    dateFrom.setDate(dateFrom.getDate() - days);

    const blogs = await this.prisma.blog.findMany({
      where: {
        status: 'PUBLISHED',
        deletedAt: null,
        publishedAt: {
          gte: dateFrom,
        },
      },
      take: limit,
      orderBy: {
        viewCount: 'desc',
      },
      include: {
        author: {
          select: {
            id: true,
            name: true,
            avatar: true,
          },
        },
        category: {
          select: {
            id: true,
            name: true,
            slug: true,
          },
        },
      },
    });

    return {
      status: true,
      data: blogs,
    };
  }
}
