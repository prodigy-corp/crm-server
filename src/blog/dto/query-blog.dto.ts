import { z } from 'zod';

// Zod schema for querying blogs with pagination and filters
export const queryBlogSchema = z.object({
  // Pagination
  page: z
    .string()
    .regex(/^\d+$/, 'Page must be a number')
    .default('1')
    .optional(),

  limit: z
    .string()
    .regex(/^\d+$/, 'Limit must be a number')
    .default('10')
    .optional(),

  // Sorting
  sortBy: z
    .enum([
      'createdAt',
      'updatedAt',
      'publishedAt',
      'title',
      'viewCount',
      'likeCount',
      'commentCount',
    ])
    .default('createdAt')
    .optional(),

  sortOrder: z.enum(['asc', 'desc']).default('desc').optional(),

  // Filters
  search: z.string().optional(), // Search in title, content, excerpt
  status: z.enum(['DRAFT', 'PUBLISHED', 'SCHEDULED', 'ARCHIVED']).optional(),

  categoryId: z.string().optional(),
  tagId: z.string().optional(),
  authorId: z.string().optional(),

  isFeatured: z
    .string()
    .transform((val) => val === 'true')
    .optional(),

  // Date filters
  publishedFrom: z.string().datetime().optional(),
  publishedTo: z.string().datetime().optional(),

  // SEO filter
  focusKeyword: z.string().optional(),
});

export type QueryBlogDto = z.infer<typeof queryBlogSchema>;

// Admin query schema with additional filters
export const adminQueryBlogSchema = queryBlogSchema.extend({
  includeDeleted: z
    .string()
    .transform((val) => val === 'true')
    .optional(),

  isIndexable: z
    .string()
    .transform((val) => val === 'true')
    .optional(),
});

export type AdminQueryBlogDto = z.infer<typeof adminQueryBlogSchema>;
