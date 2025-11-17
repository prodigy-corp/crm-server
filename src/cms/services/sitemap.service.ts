import { Injectable, Logger } from '@nestjs/common';
import { PrismaService } from 'src/prisma/prisma.service';
import { ConfigService } from '@nestjs/config';

interface SitemapUrl {
  loc: string;
  lastmod?: string;
  changefreq?:
    | 'always'
    | 'hourly'
    | 'daily'
    | 'weekly'
    | 'monthly'
    | 'yearly'
    | 'never';
  priority?: number;
}

@Injectable()
export class SitemapService {
  private readonly baseUrl: string;

  constructor(
    private readonly prisma: PrismaService,
    private readonly configService: ConfigService,
  ) {
    this.baseUrl =
      this.configService.get<string>('SITE_URL') || 'https://example.com';
  }
  private readonly logger = new Logger(SitemapService.name);

  /**
   * Generate XML sitemap for all published content
   */
  async generateSitemap(): Promise<string> {
    const urls: SitemapUrl[] = [];

    // Add homepage
    urls.push({
      loc: this.baseUrl,
      lastmod: new Date().toISOString(),
      changefreq: 'daily',
      priority: 1.0,
    });

    // Add blog list page
    urls.push({
      loc: `${this.baseUrl}/blog`,
      lastmod: new Date().toISOString(),
      changefreq: 'daily',
      priority: 0.9,
    });

    // Add all published blogs
    const blogs = await this.prisma.blog.findMany({
      where: {
        status: 'PUBLISHED',
        deletedAt: null,
        isIndexable: true,
      },
      select: {
        slug: true,
        updatedAt: true,
        publishedAt: true,
      },
      orderBy: {
        publishedAt: 'desc',
      },
    });

    blogs.forEach((blog) => {
      urls.push({
        loc: `${this.baseUrl}/blog/${blog.slug}`,
        lastmod: blog.updatedAt.toISOString(),
        changefreq: 'weekly',
        priority: 0.8,
      });
    });

    // Add categories
    const categories = await this.prisma.category.findMany({
      where: {
        status: 'ACTIVE',
      },
      select: {
        slug: true,
        updatedAt: true,
      },
    });

    categories.forEach((category) => {
      urls.push({
        loc: `${this.baseUrl}/category/${category.slug}`,
        lastmod: category.updatedAt.toISOString(),
        changefreq: 'weekly',
        priority: 0.7,
      });
    });

    // Add tags
    const tags = await this.prisma.tag.findMany({
      select: {
        slug: true,
        updatedAt: true,
      },
    });

    tags.forEach((tag) => {
      urls.push({
        loc: `${this.baseUrl}/tag/${tag.slug}`,
        lastmod: tag.updatedAt.toISOString(),
        changefreq: 'weekly',
        priority: 0.6,
      });
    });

    return this.generateXML(urls);
  }

  /**
   * Generate XML from URLs array
   */
  private generateXML(urls: SitemapUrl[]): string {
    const urlsXML = urls
      .map(
        (url) => `
  <url>
    <loc>${this.escapeXML(url.loc)}</loc>
    ${url.lastmod ? `<lastmod>${url.lastmod}</lastmod>` : ''}
    ${url.changefreq ? `<changefreq>${url.changefreq}</changefreq>` : ''}
    ${url.priority !== undefined ? `<priority>${url.priority}</priority>` : ''}
  </url>`,
      )
      .join('');

    return `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${urlsXML}
</urlset>`;
  }

  /**
   * Escape XML special characters
   */
  private escapeXML(str: string): string {
    return str
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;')
      .replace(/'/g, '&apos;');
  }

  /**
   * Generate robots.txt content
   */
  async generateRobotsTxt(): Promise<string> {
    const sitemapUrl = `${this.baseUrl}/sitemap.xml`;

    return `# Robots.txt for ${this.baseUrl}
User-agent: *
Allow: /

# Disallow admin and API routes
Disallow: /admin/
Disallow: /api/auth/
Disallow: /api/users/

# Allow specific bot access
User-agent: Googlebot
Allow: /

User-agent: Bingbot
Allow: /

# Sitemap location
Sitemap: ${sitemapUrl}

# Crawl-delay (optional)
# Crawl-delay: 10
`;
  }

  /**
   * Generate RSS feed for blog posts
   */
  async generateRSSFeed(): Promise<string> {
    const blogs = await this.prisma.blog.findMany({
      where: {
        status: 'PUBLISHED',
        deletedAt: null,
      },
      take: 20,
      orderBy: {
        publishedAt: 'desc',
      },
      select: {
        title: true,
        slug: true,
        excerpt: true,
        content: true,
        publishedAt: true,
        author: {
          select: {
            name: true,
            email: true,
          },
        },
        category: {
          select: {
            name: true,
          },
        },
      },
    });

    const items = blogs
      .map((blog) => {
        const link = `${this.baseUrl}/blog/${blog.slug}`;
        const pubDate = blog.publishedAt
          ? new Date(blog.publishedAt).toUTCString()
          : new Date().toUTCString();

        // Strip HTML for description
        const description =
          blog.excerpt || this.stripHTML(blog.content).substring(0, 200);

        return `
    <item>
      <title>${this.escapeXML(blog.title)}</title>
      <link>${this.escapeXML(link)}</link>
      <description>${this.escapeXML(description)}</description>
      <pubDate>${pubDate}</pubDate>
      <author>${this.escapeXML(blog.author.email)} (${this.escapeXML(blog.author.name)})</author>
      ${blog.category ? `<category>${this.escapeXML(blog.category.name)}</category>` : ''}
      <guid isPermaLink="true">${this.escapeXML(link)}</guid>
    </item>`;
      })
      .join('');

    const buildDate = new Date().toUTCString();

    return `<?xml version="1.0" encoding="UTF-8"?>
<rss version="2.0" xmlns:atom="http://www.w3.org/2005/Atom">
  <channel>
    <title>Blog Feed</title>
    <link>${this.baseUrl}</link>
    <description>Latest blog posts</description>
    <language>en-us</language>
    <lastBuildDate>${buildDate}</lastBuildDate>
    <atom:link href="${this.baseUrl}/rss.xml" rel="self" type="application/rss+xml" />
${items}
  </channel>
</rss>`;
  }

  /**
   * Strip HTML tags from content
   */
  private stripHTML(html: string): string {
    return html.replace(/<[^>]*>/g, '').trim();
  }

  /**
   * Get sitemap statistics
   */
  async getSitemapStats() {
    const [blogsCount, categoriesCount, tagsCount] = await Promise.all([
      this.prisma.blog.count({
        where: {
          status: 'PUBLISHED',
          deletedAt: null,
          isIndexable: true,
        },
      }),
      this.prisma.category.count({
        where: {
          status: 'ACTIVE',
        },
      }),
      this.prisma.tag.count(),
    ]);

    const totalUrls = blogsCount + categoriesCount + tagsCount + 2; // +2 for home and blog list

    return {
      status: true,
      data: {
        totalUrls,
        blogs: blogsCount,
        categories: categoriesCount,
        tags: tagsCount,
        sitemapUrl: `${this.baseUrl}/sitemap.xml`,
        lastGenerated: new Date().toISOString(),
      },
    };
  }

  /**
   * Generate HTML sitemap (user-friendly version)
   */
  async generateHTMLSitemap(): Promise<string> {
    const [blogs, categories, tags] = await Promise.all([
      this.prisma.blog.findMany({
        where: {
          status: 'PUBLISHED',
          deletedAt: null,
        },
        select: {
          title: true,
          slug: true,
          publishedAt: true,
        },
        orderBy: {
          publishedAt: 'desc',
        },
      }),
      this.prisma.category.findMany({
        where: {
          status: 'ACTIVE',
        },
        select: {
          name: true,
          slug: true,
        },
        orderBy: {
          name: 'asc',
        },
      }),
      this.prisma.tag.findMany({
        select: {
          name: true,
          slug: true,
        },
        orderBy: {
          name: 'asc',
        },
      }),
    ]);

    const blogLinks = blogs
      .map(
        (blog) =>
          `        <li><a href="${this.baseUrl}/blog/${blog.slug}">${this.escapeXML(blog.title)}</a></li>`,
      )
      .join('\n');

    const categoryLinks = categories
      .map(
        (cat) =>
          `        <li><a href="${this.baseUrl}/category/${cat.slug}">${this.escapeXML(cat.name)}</a></li>`,
      )
      .join('\n');

    const tagLinks = tags
      .map(
        (tag) =>
          `        <li><a href="${this.baseUrl}/tag/${tag.slug}">${this.escapeXML(tag.name)}</a></li>`,
      )
      .join('\n');

    return `<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Sitemap</title>
    <style>
        body { font-family: Arial, sans-serif; max-width: 1200px; margin: 0 auto; padding: 20px; }
        h1 { color: #333; }
        h2 { color: #666; margin-top: 30px; }
        ul { list-style-type: none; padding: 0; }
        li { margin: 8px 0; }
        a { color: #0066cc; text-decoration: none; }
        a:hover { text-decoration: underline; }
        .section { margin-bottom: 40px; }
    </style>
</head>
<body>
    <h1>Sitemap</h1>
    
    <div class="section">
        <h2>Main Pages</h2>
        <ul>
            <li><a href="${this.baseUrl}">Home</a></li>
            <li><a href="${this.baseUrl}/blog">Blog</a></li>
        </ul>
    </div>
    
    <div class="section">
        <h2>Blog Posts (${blogs.length})</h2>
        <ul>
${blogLinks}
        </ul>
    </div>
    
    <div class="section">
        <h2>Categories (${categories.length})</h2>
        <ul>
${categoryLinks}
        </ul>
    </div>
    
    <div class="section">
        <h2>Tags (${tags.length})</h2>
        <ul>
${tagLinks}
        </ul>
    </div>
</body>
</html>`;
  }
}
