import { z } from 'zod';

// Zod schema for creating a blog
export const createBlogSchema = z.object({
  title: z
    .string()
    .min(1, 'Title is required')
    .max(255, 'Title must be 255 characters or less'),

  slug: z
    .string()
    .max(300, 'Slug must be 300 characters or less')
    .regex(/^[a-z0-9]+(?:-[a-z0-9]+)*$/, 'Slug must be lowercase with hyphens')
    .optional(),

  excerpt: z
    .string()
    .max(500, 'Excerpt must be 500 characters or less')
    .optional(),

  content: z.string().min(1, 'Content is required'),

  // Featured Image
  featuredImage: z.string().optional(),
  imageAlt: z
    .string()
    .max(255, 'Image alt must be 255 characters or less')
    .optional(),

  // SEO Fields
  metaTitle: z
    .string()
    .max(70, 'Meta title should be 70 characters or less for optimal SEO')
    .optional(),

  metaDescription: z
    .string()
    .max(
      160,
      'Meta description should be 160 characters or less for optimal SEO',
    )
    .optional(),

  focusKeyword: z
    .string()
    .max(100, 'Focus keyword must be 100 characters or less')
    .optional(),

  keywords: z
    .array(z.string())
    .max(10, 'Maximum 10 keywords allowed')
    .optional()
    .default([]),

  // Open Graph
  ogTitle: z
    .string()
    .max(70, 'OG title should be 70 characters or less')
    .optional(),

  ogDescription: z
    .string()
    .max(160, 'OG description should be 160 characters or less')
    .optional(),

  ogImage: z.string().optional(),

  // Twitter Card
  twitterTitle: z
    .string()
    .max(70, 'Twitter title should be 70 characters or less')
    .optional(),

  twitterDescription: z
    .string()
    .max(160, 'Twitter description should be 160 characters or less')
    .optional(),

  twitterImage: z.string().optional(),

  // Schema.org
  schemaType: z
    .enum(['Article', 'BlogPosting', 'NewsArticle'])
    .default('Article')
    .optional(),

  // Publishing
  status: z
    .enum(['DRAFT', 'PUBLISHED', 'SCHEDULED', 'ARCHIVED'])
    .default('DRAFT')
    .optional(),

  publishedAt: z.string().datetime().optional(),
  scheduledFor: z.string().datetime().optional(),

  // Relations
  categoryId: z.string().optional(),
  tagIds: z.array(z.string()).optional().default([]),

  // Features
  isFeatured: z.boolean().optional().default(false),
  allowComments: z.boolean().optional().default(true),
  isIndexable: z.boolean().optional().default(true),

  // Canonical URL
  canonicalUrl: z.string().url().optional(),
});

export type CreateBlogDto = z.infer<typeof createBlogSchema>;
