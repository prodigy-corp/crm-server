# Complete Setup Guide - Blog & CMS System

This guide will help you set up the production-ready blog system with full SEO support and CMS admin panel.

## 📋 Prerequisites

- Node.js 18+ installed
- PostgreSQL database running
- Redis (optional, for caching)
- AWS S3 or local storage configured

## 🚀 Quick Start

### Step 1: Install Dependencies

All dependencies are already in package.json. Verify installation:

```bash
npm install
```

### Step 2: Configure Environment Variables

Create or update your `.env` file:

```env
# Database
DATABASE_URL="postgresql://username:password@localhost:5432/database_name"

# Application
NODE_ENV=development
PORT=3000
SITE_URL=https://yourdomain.com

# JWT
JWT_SECRET=your-super-secret-jwt-key
JWT_EXPIRATION=7d

# AWS S3 (if using S3 for uploads)
AWS_ACCESS_KEY_ID=your-access-key
AWS_SECRET_ACCESS_KEY=your-secret-key
AWS_REGION=us-east-1
AWS_S3_BUCKET=your-bucket-name

# Redis (optional)
REDIS_HOST=localhost
REDIS_PORT=6379

# Email
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_USER=your-email@gmail.com
SMTP_PASSWORD=your-password
```

### Step 3: Generate Prisma Client

Generate the Prisma client with the new blog models:

```bash
npm run prisma:generate
```

### Step 4: Run Database Migrations

Create the database tables:

```bash
npm run prisma:migrate
```

When prompted for migration name, use something like: `add_blog_and_cms_models`

### Step 5: Seed Permissions

Create a seed file or manually add required permissions:

**Option A: Manual SQL Insert**

```sql
-- Blog Permissions
INSERT INTO permissions (id, name, description, created_at, updated_at) VALUES
  (gen_random_uuid(), 'blog.create', 'Create blog posts', NOW(), NOW()),
  (gen_random_uuid(), 'blog.update', 'Update blog posts', NOW(), NOW()),
  (gen_random_uuid(), 'blog.delete', 'Delete blog posts', NOW(), NOW()),
  (gen_random_uuid(), 'blog.delete.permanent', 'Permanently delete blog posts', NOW(), NOW()),
  (gen_random_uuid(), 'admin.blog.view', 'View all blog posts in admin', NOW(), NOW());

-- CMS Permissions
INSERT INTO permissions (id, name, description, created_at, updated_at) VALUES
  (gen_random_uuid(), 'admin.dashboard.view', 'View CMS dashboard', NOW(), NOW()),
  (gen_random_uuid(), 'admin.analytics.view', 'View analytics data', NOW(), NOW()),
  (gen_random_uuid(), 'admin.seo.view', 'View SEO tools and analysis', NOW(), NOW());
```

**Option B: Using Prisma Seed Script**

Create `prisma/seeds/permissions.ts`:

```typescript
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function seedPermissions() {
  const permissions = [
    { name: 'blog.create', description: 'Create blog posts' },
    { name: 'blog.update', description: 'Update blog posts' },
    { name: 'blog.delete', description: 'Delete blog posts' },
    { name: 'blog.delete.permanent', description: 'Permanently delete blog posts' },
    { name: 'admin.blog.view', description: 'View all blog posts in admin' },
    { name: 'admin.dashboard.view', description: 'View CMS dashboard' },
    { name: 'admin.analytics.view', description: 'View analytics data' },
    { name: 'admin.seo.view', description: 'View SEO tools and analysis' },
  ];

  for (const perm of permissions) {
    await prisma.permission.upsert({
      where: { name: perm.name },
      update: {},
      create: perm,
    });
  }

  console.log('✅ Permissions seeded successfully');
}

seedPermissions()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
```

Run seed:
```bash
npx ts-node prisma/seeds/permissions.ts
```

### Step 6: Assign Permissions to Admin Role

```sql
-- Get role and permission IDs
SELECT id FROM roles WHERE name = 'admin';
SELECT id, name FROM permissions WHERE name LIKE 'blog.%' OR name LIKE 'admin.%';

-- Assign permissions to admin role (replace with actual IDs)
INSERT INTO role_permissions (id, role_id, permission_id, created_at) VALUES
  (gen_random_uuid(), 'admin-role-id', 'permission-id-1', NOW()),
  (gen_random_uuid(), 'admin-role-id', 'permission-id-2', NOW());
  -- ... repeat for all permissions
```

### Step 7: Update App Module

Add the new modules to `src/app.module.ts`:

```typescript
import { BlogModule } from './blog/blog.module';
import { CmsModule } from './cms/cms.module';

@Module({
  imports: [
    // ... existing modules
    BlogModule,
    CmsModule,
  ],
})
export class AppModule {}
```

### Step 8: Start the Application

```bash
# Development
npm run start:dev

# Production
npm run build
npm run start:prod
```

## 📍 Verify Installation

### Check API Endpoints

1. **Public Blog Endpoints** (no auth required):
```bash
# Get published blogs
curl http://localhost:3000/blog

# Get blog by slug
curl http://localhost:3000/blog/slug/sample-post

# Get featured blogs
curl http://localhost:3000/blog/featured/list

# Get sitemap
curl http://localhost:3000/cms/sitemap.xml

# Get robots.txt
curl http://localhost:3000/cms/robots.txt
```

2. **Admin Blog Endpoints** (requires auth):
```bash
# Get admin blog list
curl -H "Authorization: Bearer YOUR_TOKEN" \
  http://localhost:3000/blog/admin/list

# Create blog post
curl -X POST -H "Authorization: Bearer YOUR_TOKEN" \
  -F "title=Test Post" \
  -F "content=<p>Test content</p>" \
  -F "status=PUBLISHED" \
  http://localhost:3000/blog
```

3. **CMS Dashboard** (requires auth):
```bash
# Get dashboard stats
curl -H "Authorization: Bearer YOUR_TOKEN" \
  http://localhost:3000/cms/dashboard/stats

# Analyze blog SEO
curl -H "Authorization: Bearer YOUR_TOKEN" \
  http://localhost:3000/cms/seo/analyze/BLOG_ID
```

## 📊 Testing the System

### Create Sample Data

**1. Create Categories:**
```bash
curl -X POST -H "Authorization: Bearer YOUR_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"name":"Technology","status":"ACTIVE"}' \
  http://localhost:3000/category
```

**2. Create Tags:**
```sql
INSERT INTO tags (id, name, slug, created_at, updated_at) VALUES
  (gen_random_uuid(), 'JavaScript', 'javascript', NOW(), NOW()),
  (gen_random_uuid(), 'SEO', 'seo', NOW(), NOW()),
  (gen_random_uuid(), 'Web Development', 'web-development', NOW(), NOW());
```

**3. Create a Blog Post:**
```bash
curl -X POST -H "Authorization: Bearer YOUR_TOKEN" \
  -F "title=Complete Guide to SEO Optimization" \
  -F "content=<h2>Introduction</h2><p>SEO is crucial...</p>" \
  -F "excerpt=Learn how to optimize your content for search engines" \
  -F "categoryId=CATEGORY_ID" \
  -F "tagIds[]=TAG_ID_1" \
  -F "tagIds[]=TAG_ID_2" \
  -F "status=PUBLISHED" \
  -F "isFeatured=true" \
  -F "metaTitle=Complete Guide to SEO Optimization" \
  -F "metaDescription=Learn the best practices for SEO optimization and improve your search rankings" \
  -F "focusKeyword=seo optimization" \
  http://localhost:3000/blog
```

**4. Test SEO Analysis:**
```bash
curl -H "Authorization: Bearer YOUR_TOKEN" \
  http://localhost:3000/cms/seo/analyze/BLOG_ID
```

## 🎯 Frontend Integration

### Blog List Page

```typescript
// app/blog/page.tsx (Next.js example)
export default async function BlogPage({ searchParams }) {
  const response = await fetch(
    `${process.env.API_URL}/blog?page=${searchParams.page || 1}&limit=10`
  );
  const { data: blogs, meta } = await response.json();

  return (
    <div>
      <h1>Blog Posts</h1>
      {blogs.map(blog => (
        <article key={blog.id}>
          <h2>{blog.title}</h2>
          <p>{blog.excerpt}</p>
          <Link href={`/blog/${blog.slug}`}>Read More</Link>
        </article>
      ))}
      <Pagination {...meta} />
    </div>
  );
}
```

### Blog Detail Page with SEO

```typescript
// app/blog/[slug]/page.tsx
export async function generateMetadata({ params }) {
  const response = await fetch(`${process.env.API_URL}/blog/slug/${params.slug}`);
  const { data: blog } = await response.json();

  return {
    title: blog.metaTitle || blog.title,
    description: blog.metaDescription,
    keywords: blog.keywords,
    openGraph: {
      title: blog.ogTitle || blog.metaTitle,
      description: blog.ogDescription || blog.metaDescription,
      images: [blog.ogImage || blog.featuredImage],
      type: 'article',
      publishedTime: blog.publishedAt,
      authors: [blog.author.name],
    },
    twitter: {
      card: 'summary_large_image',
      title: blog.twitterTitle || blog.ogTitle,
      description: blog.twitterDescription || blog.ogDescription,
      images: [blog.twitterImage || blog.ogImage],
    },
    alternates: {
      canonical: blog.canonicalUrl || `${process.env.SITE_URL}/blog/${blog.slug}`,
    },
  };
}

export default async function BlogDetailPage({ params }) {
  const response = await fetch(`${process.env.API_URL}/blog/slug/${params.slug}`);
  const { data: blog } = await response.json();

  return (
    <article>
      {blog.featuredImage && (
        <img src={blog.featuredImage} alt={blog.imageAlt} />
      )}
      <h1>{blog.title}</h1>
      <div className="meta">
        <span>By {blog.author.name}</span>
        <span>{blog.readingTime} min read</span>
        <span>{blog.viewCount} views</span>
      </div>
      <div dangerouslySetInnerHTML={{ __html: blog.content }} />
      
      {/* Schema.org structured data */}
      <script type="application/ld+json">
        {JSON.stringify({
          "@context": "https://schema.org",
          "@type": blog.schemaType || "Article",
          "headline": blog.title,
          "description": blog.metaDescription,
          "image": blog.featuredImage,
          "datePublished": blog.publishedAt,
          "dateModified": blog.updatedAt,
          "author": {
            "@type": "Person",
            "name": blog.author.name
          }
        })}
      </script>
    </article>
  );
}
```

### Admin Dashboard

```typescript
// app/admin/dashboard/page.tsx
'use client';
import { useEffect, useState } from 'react';

export default function DashboardPage() {
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch('/api/cms/dashboard/stats', {
      headers: { 'Authorization': `Bearer ${getToken()}` }
    })
      .then(r => r.json())
      .then(data => {
        setStats(data.data);
        setLoading(false);
      });
  }, []);

  if (loading) return <div>Loading...</div>;

  return (
    <div className="dashboard">
      <h1>Dashboard</h1>
      
      <div className="stats-grid">
        <StatCard
          title="Total Blogs"
          value={stats.blogs.total}
          subtitle={`${stats.blogs.published} published`}
        />
        <StatCard
          title="Total Views"
          value={stats.engagement.totalViews.toLocaleString()}
          subtitle={`${stats.analytics.viewsGrowth}% growth`}
        />
        <StatCard
          title="Engagement"
          value={stats.engagement.totalLikes + stats.engagement.totalComments}
          subtitle={`${stats.recent.pendingComments} pending comments`}
        />
      </div>

      <div className="charts">
        <RecentBlogsTable blogs={stats.recent.recentBlogs} />
        <TopBlogsChart blogs={stats.analytics.topBlogs} />
      </div>
    </div>
  );
}
```

## 🔍 SEO Checklist

After setup, optimize your content:

- [ ] Set SITE_URL in environment variables
- [ ] Submit sitemap to Google Search Console
- [ ] Submit sitemap to Bing Webmaster Tools
- [ ] Verify robots.txt is accessible
- [ ] Check all meta tags are rendering
- [ ] Test Open Graph tags (Facebook Debugger)
- [ ] Test Twitter Cards (Twitter Card Validator)
- [ ] Add schema.org structured data
- [ ] Enable HTTPS
- [ ] Configure CDN for images
- [ ] Set up analytics tracking
- [ ] Monitor SEO scores regularly

## 🚨 Common Issues

### Issue 1: Prisma Client Not Found
```bash
# Solution: Regenerate Prisma client
npm run prisma:generate
```

### Issue 2: Permission Denied Errors
```bash
# Solution: Verify user has required permissions
# Check role_permissions table
SELECT p.name FROM permissions p
JOIN role_permissions rp ON p.id = rp.permission_id
JOIN user_roles ur ON rp.role_id = ur.role_id
WHERE ur.user_id = 'YOUR_USER_ID';
```

### Issue 3: File Upload Not Working
```bash
# Solution: Check UploadService configuration
# Verify AWS credentials or local storage path
# Check file size limits in NestJS configuration
```

### Issue 4: Sitemap Returns Empty
```bash
# Solution: Ensure SITE_URL is set
# Verify blogs are published and indexable
# Check database connection
```

## 📈 Performance Optimization

### Database Indexes
All critical fields are already indexed in the Prisma schema:
- Blog slug, status, authorId, categoryId
- Published date, featured flag
- Focus keyword for SEO queries

### Caching (Optional)
Implement caching for frequently accessed data:

```typescript
// Example: Cache dashboard stats for 5 minutes
import { Cache } from 'cache-manager';

@Injectable()
export class DashboardService {
  constructor(
    @Inject(CACHE_MANAGER) private cacheManager: Cache
  ) {}

  async getDashboardStats() {
    const cached = await this.cacheManager.get('dashboard:stats');
    if (cached) return cached;

    const stats = await this.calculateStats();
    await this.cacheManager.set('dashboard:stats', stats, 300); // 5 min
    return stats;
  }
}
```

### CDN Integration
Serve static assets and images through a CDN:
- CloudFlare
- AWS CloudFront
- Fastly

## 🎓 Learning Resources

- [Blog Service Documentation](./src/blog/README.md)
- [CMS Module Documentation](./src/cms/README.md)
- [SEO Best Practices](https://developers.google.com/search/docs)
- [Schema.org Documentation](https://schema.org/)

## 🤝 Support

For issues or questions:
1. Check the documentation in `/src/blog/README.md` and `/src/cms/README.md`
2. Review this setup guide
3. Check error logs in the console
4. Verify database schema is up to date

## ✅ Post-Setup Checklist

- [ ] Database migrations completed
- [ ] Prisma client generated
- [ ] Permissions seeded
- [ ] Modules imported in AppModule
- [ ] Environment variables configured
- [ ] Application starts without errors
- [ ] Can create blog posts
- [ ] Can view blog posts (public)
- [ ] Dashboard loads successfully
- [ ] SEO analysis works
- [ ] Sitemap is accessible
- [ ] Robots.txt is accessible
- [ ] RSS feed works

Congratulations! Your blog and CMS system with full SEO support is now ready! 🎉
