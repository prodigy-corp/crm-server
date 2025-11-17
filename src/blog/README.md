# Blog Service - Production-Ready with Full SEO Support

A comprehensive, production-ready blog management system with advanced SEO optimization, analytics, and content management features.

## 🚀 Features

### Core Features
- ✅ **CRUD Operations** - Full create, read, update, delete functionality
- ✅ **SEO Optimization** - Complete meta tags, Open Graph, Twitter Cards, Schema.org
- ✅ **Rich Content** - Support for featured images, excerpts, and full HTML content
- ✅ **Multi-Author** - Multiple authors with proper attribution
- ✅ **Categories & Tags** - Organize content with categories and tags
- ✅ **Draft System** - Draft, scheduled, published, and archived status
- ✅ **Soft Delete** - Recoverable deletion with permanent delete option

### SEO Features
- 🔍 **Meta Tags** - Title, description, keywords (optimized lengths)
- 🌐 **Open Graph** - Full OG tags for social media sharing
- 🐦 **Twitter Cards** - Twitter-specific meta tags
- 📊 **Schema.org** - Structured data (Article, BlogPosting, NewsArticle)
- 🔗 **Canonical URLs** - Prevent duplicate content issues
- 🤖 **Indexability Control** - Control which posts search engines index
- 🎯 **Focus Keyword** - Target specific keywords per post
- 📝 **Auto-Generation** - Automatic SEO field generation from content

### Analytics & Engagement
- 👁️ **View Tracking** - Track post views with IP and user data
- 💬 **Comment System** - Nested comments with approval workflow
- ❤️ **Engagement Metrics** - Likes, shares, comments count
- 📈 **Reading Time** - Auto-calculated based on word count
- 🔥 **Popular Posts** - Get trending posts by views
- 🎯 **Related Posts** - Automatic related content suggestions
- ⭐ **Featured Posts** - Highlight important content

### Content Management
- 🖼️ **Featured Images** - Upload and manage post images
- 📅 **Scheduling** - Schedule posts for future publication
- 🔍 **Advanced Search** - Search by title, content, tags, categories
- 📊 **Pagination** - Efficient pagination for large datasets
- 🔐 **Permission-Based** - Role-based access control
- 📱 **Public/Admin Views** - Separate endpoints for public and admin

## 📁 Project Structure

```
src/blog/
├── dto/
│   ├── create-blog.dto.ts      # Create blog validation schema
│   ├── update-blog.dto.ts      # Update blog validation schema
│   └── query-blog.dto.ts       # Query/filter validation schema
├── blog.controller.ts           # REST API endpoints
├── blog.service.ts             # Business logic & SEO optimization
├── blog.module.ts              # Module configuration
└── README.md                   # This file
```

## 🗄️ Database Schema

### Blog Model
- Complete SEO fields (meta, OG, Twitter, Schema.org)
- Content fields (title, slug, excerpt, content)
- Publishing workflow (status, publishedAt, scheduledFor)
- Analytics (viewCount, likeCount, commentCount, shareCount)
- Relations (author, category, tags, comments, views)

### Related Models
- **Tag** - Blog tags with SEO meta
- **BlogTag** - Many-to-many relation
- **BlogComment** - Nested comments with approval
- **BlogView** - View tracking for analytics

## 🔌 API Endpoints

### Public Endpoints

#### Get All Published Blogs
```http
GET /blog?page=1&limit=10&search=keyword&categoryId=xxx&tagId=xxx
```

#### Get Blog by Slug
```http
GET /blog/slug/:slug
```

#### Get Featured Blogs
```http
GET /blog/featured/list?limit=5
```

#### Get Popular Blogs
```http
GET /blog/popular/list?limit=10&days=30
```

#### Get Related Blogs
```http
GET /blog/related/:blogId?limit=5
```

### Admin/Authenticated Endpoints

#### Create Blog Post
```http
POST /blog
Authorization: Bearer {token}
Content-Type: multipart/form-data

{
  "title": "Amazing Blog Post",
  "content": "Full HTML content...",
  "excerpt": "Short description...",
  "categoryId": "xxx",
  "tagIds": ["xxx", "yyy"],
  "status": "PUBLISHED",
  "isFeatured": true,
  "metaTitle": "SEO Title (max 70 chars)",
  "metaDescription": "SEO Description (max 160 chars)",
  "focusKeyword": "target keyword",
  "keywords": ["keyword1", "keyword2"],
  "featuredImage": File
}
```

#### Update Blog Post
```http
PUT /blog/:id
Authorization: Bearer {token}
Content-Type: multipart/form-data
```

#### Get Admin Blog List
```http
GET /blog/admin/list?page=1&limit=10&status=DRAFT&includeDeleted=true
Authorization: Bearer {token}
```

#### Get Blog by ID (Admin)
```http
GET /blog/admin/:id
Authorization: Bearer {token}
```

#### Soft Delete Blog
```http
DELETE /blog/:id
Authorization: Bearer {token}
```

#### Permanent Delete Blog
```http
DELETE /blog/permanent/:id
Authorization: Bearer {token}
```

## 🎯 SEO Optimization Features

### Automatic SEO Generation
The service automatically generates SEO fields if not provided:

1. **Meta Title** - Auto-generated from post title (max 70 chars)
2. **Meta Description** - Auto-generated from excerpt or content (max 160 chars)
3. **OG Tags** - Auto-populated from meta tags
4. **Twitter Cards** - Auto-populated from OG tags
5. **Reading Time** - Auto-calculated from word count
6. **Slug** - Auto-generated from title if not provided

### SEO Best Practices
- ✅ Optimal meta title length (70 characters)
- ✅ Optimal meta description length (160 characters)
- ✅ Clean URL slugs (lowercase, hyphen-separated)
- ✅ Focus keyword targeting
- ✅ Multiple keyword support
- ✅ Canonical URL support
- ✅ Robots meta control (indexable flag)
- ✅ Schema.org structured data

### Open Graph Tags
Complete social media optimization for:
- Facebook sharing
- LinkedIn posts
- Other OG-compatible platforms

### Twitter Card Tags
Optimized for Twitter with:
- Summary cards
- Large image cards
- Custom titles and descriptions

## 🔒 Permissions Required

### Blog Permissions
- `blog.create` - Create new blog posts
- `blog.update` - Update existing posts
- `blog.delete` - Soft delete posts
- `blog.delete.permanent` - Permanently delete posts
- `admin.blog.view` - View all posts including drafts

## 📊 Query Options

### Pagination
```typescript
page: string      // Page number (default: 1)
limit: string     // Items per page (default: 10)
```

### Sorting
```typescript
sortBy: 'createdAt' | 'updatedAt' | 'publishedAt' | 'title' | 'viewCount' | 'likeCount' | 'commentCount'
sortOrder: 'asc' | 'desc'
```

### Filters
```typescript
search: string           // Search in title, content, excerpt
status: 'DRAFT' | 'PUBLISHED' | 'SCHEDULED' | 'ARCHIVED'
categoryId: string       // Filter by category
tagId: string           // Filter by tag
authorId: string        // Filter by author
isFeatured: boolean     // Filter featured posts
focusKeyword: string    // Filter by SEO keyword
publishedFrom: string   // Date range start
publishedTo: string     // Date range end
```

### Admin-Only Filters
```typescript
includeDeleted: boolean  // Include soft-deleted posts
isIndexable: boolean     // Filter by SEO indexability
```

## 🚀 Getting Started

### 1. Run Prisma Migrations
```bash
npm run prisma:generate
npm run prisma:migrate
```

### 2. Add Permissions to Database
Add these permissions to your `Permission` table:
- `blog.create`
- `blog.update`
- `blog.delete`
- `blog.delete.permanent`
- `admin.blog.view`

### 3. Assign Permissions to Roles
Assign appropriate permissions to your admin/editor roles.

### 4. Import BlogModule
```typescript
import { BlogModule } from './blog/blog.module';

@Module({
  imports: [BlogModule],
})
export class AppModule {}
```

## 💡 Usage Examples

### Creating a Blog Post
```typescript
// Frontend/API Call
const formData = new FormData();
formData.append('title', 'My Amazing Blog Post');
formData.append('content', '<p>Full HTML content here...</p>');
formData.append('excerpt', 'A brief description of the post');
formData.append('categoryId', 'category-id');
formData.append('tagIds', JSON.stringify(['tag-id-1', 'tag-id-2']));
formData.append('status', 'PUBLISHED');
formData.append('isFeatured', 'true');
formData.append('metaTitle', 'SEO Optimized Title');
formData.append('metaDescription', 'SEO optimized description for search engines');
formData.append('focusKeyword', 'blog seo optimization');
formData.append('featuredImage', fileBlob);

const response = await fetch('/blog', {
  method: 'POST',
  headers: {
    'Authorization': 'Bearer ' + token
  },
  body: formData
});
```

### Fetching Published Blogs
```typescript
const response = await fetch('/blog?page=1&limit=10&categoryId=xxx');
const { data, meta } = await response.json();
```

### Getting SEO Data for Blog Detail Page
```typescript
const response = await fetch('/blog/slug/my-amazing-blog-post');
const { data: blog } = await response.json();

// Use SEO data in your meta tags
<meta name="title" content={blog.metaTitle} />
<meta name="description" content={blog.metaDescription} />
<meta property="og:title" content={blog.ogTitle} />
<meta property="og:description" content={blog.ogDescription} />
<meta property="og:image" content={blog.ogImage} />
<meta name="twitter:title" content={blog.twitterTitle} />
<meta name="twitter:description" content={blog.twitterDescription} />
<meta name="twitter:image" content={blog.twitterImage} />
```

## 🎨 Frontend Integration Tips

### SEO Meta Tags
Use the blog's SEO fields to populate your page meta tags for optimal search engine visibility.

### Reading Time Display
```typescript
{blog.readingTime} min read
```

### Engagement Metrics
```typescript
{blog.viewCount} views • {blog.likeCount} likes • {blog.commentCount} comments
```

### Author Attribution
```typescript
By {blog.author.name} on {formatDate(blog.publishedAt)}
```

## 🔧 Customization

### Adjust Reading Speed
Edit `calculateReadingTime()` in `blog.service.ts`:
```typescript
const wordsPerMinute = 200; // Change this value
```

### Modify SEO Limits
Edit validation schemas in DTOs to adjust character limits for SEO fields.

### Add Custom Filters
Extend `QueryBlogDto` to add more filter options.

## 📝 Notes

- All SEO field lengths follow Google's recommended limits
- Slug auto-generation creates SEO-friendly URLs
- View tracking is asynchronous to avoid performance impact
- Images are managed through UploadService (S3/local storage)
- Soft delete allows content recovery
- Comment system requires approval workflow
- Related posts use category and tag matching

## 🐛 Troubleshooting

### Prisma Client Errors
Run `npm run prisma:generate` after schema changes.

### Permission Denied
Ensure user has appropriate permissions assigned to their role.

### File Upload Issues
Check UploadService configuration and file size limits.

## 🤝 Contributing

Follow the existing code patterns and maintain SEO best practices when adding features.

## 📄 License

Part of the NestJS Starter Kit project.
