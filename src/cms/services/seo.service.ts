import { Injectable, Logger } from '@nestjs/common';
import { PrismaService } from 'src/prisma/prisma.service';

export interface SEOScore {
  score: number;
  maxScore: number;
  percentage: number;
  issues: string[];
  recommendations: string[];
}

export interface ContentSEOAnalysis {
  titleAnalysis: {
    length: number;
    optimal: boolean;
    score: number;
    issue?: string;
  };
  descriptionAnalysis: {
    length: number;
    optimal: boolean;
    score: number;
    issue?: string;
  };
  contentAnalysis: {
    wordCount: number;
    readingTime: number;
    keywordDensity?: number;
    headingsCount: number;
    score: number;
  };
  imageAnalysis: {
    hasFeatureImage: boolean;
    hasAltText: boolean;
    score: number;
  };
  urlAnalysis: {
    length: number;
    optimal: boolean;
    score: number;
  };
  overallScore: SEOScore;
}

@Injectable()
export class SeoService {
  constructor(private readonly prisma: PrismaService) {}
  private readonly logger = new Logger(SeoService.name);

  /**
   * Analyze blog post SEO
   */
  async analyzeBlogSEO(blogId: string): Promise<ContentSEOAnalysis> {
    const blog = await this.prisma.blog.findUnique({
      where: { id: blogId },
    });

    if (!blog) {
      throw new Error('Blog not found');
    }

    const issues: string[] = [];
    const recommendations: string[] = [];
    let totalScore = 0;
    const maxScore = 100;

    // Title Analysis (20 points)
    const titleAnalysis = this.analyzeTitleSEO(
      blog.title,
      blog.metaTitle,
      blog.focusKeyword,
    );
    totalScore += titleAnalysis.score;
    if (titleAnalysis.issue) issues.push(titleAnalysis.issue);

    // Description Analysis (20 points)
    const descriptionAnalysis = this.analyzeDescriptionSEO(
      blog.metaDescription,
      blog.focusKeyword,
    );
    totalScore += descriptionAnalysis.score;
    if (descriptionAnalysis.issue) issues.push(descriptionAnalysis.issue);

    // Content Analysis (30 points)
    const contentAnalysis = this.analyzeContentSEO(
      blog.content,
      blog.focusKeyword,
    );
    totalScore += contentAnalysis.score;

    // Image Analysis (15 points)
    const imageAnalysis = this.analyzeImageSEO(
      blog.featuredImage,
      blog.imageAlt,
    );
    totalScore += imageAnalysis.score;
    if (!imageAnalysis.hasFeatureImage) {
      issues.push('Missing featured image');
    }
    if (!imageAnalysis.hasAltText && imageAnalysis.hasFeatureImage) {
      issues.push('Featured image missing alt text');
    }

    // URL Analysis (15 points)
    const urlAnalysis = this.analyzeURLSEO(blog.slug, blog.focusKeyword);
    totalScore += urlAnalysis.score;
    if (urlAnalysis.issue) issues.push(urlAnalysis.issue);

    // Generate recommendations
    if (titleAnalysis.length < 30) {
      recommendations.push('Consider making your title more descriptive');
    }
    if (contentAnalysis.wordCount < 300) {
      recommendations.push(
        'Add more content. Aim for at least 300 words for better SEO',
      );
    }
    if (contentAnalysis.headingsCount === 0) {
      recommendations.push(
        'Add heading tags (H2, H3) to structure your content',
      );
    }
    if (!blog.focusKeyword) {
      recommendations.push('Set a focus keyword for better SEO targeting');
    }
    if (!blog.canonicalUrl) {
      recommendations.push(
        'Consider adding a canonical URL to avoid duplicate content',
      );
    }

    const percentage = Math.round((totalScore / maxScore) * 100);

    return {
      titleAnalysis,
      descriptionAnalysis,
      contentAnalysis,
      imageAnalysis,
      urlAnalysis,
      overallScore: {
        score: totalScore,
        maxScore,
        percentage,
        issues,
        recommendations,
      },
    };
  }

  /**
   * Analyze title SEO
   */
  private analyzeTitleSEO(
    title: string,
    metaTitle?: string | null,
    focusKeyword?: string | null,
  ) {
    const titleToAnalyze = metaTitle || title;
    const length = titleToAnalyze.length;
    let score = 0;
    let issue: string | undefined;

    // Length check (10 points)
    if (length >= 30 && length <= 70) {
      score += 10;
    } else if (length < 30) {
      score += 5;
      issue = 'Title is too short (should be 30-70 characters)';
    } else {
      score += 5;
      issue = 'Title is too long (should be 30-70 characters)';
    }

    // Keyword check (10 points)
    if (
      focusKeyword &&
      titleToAnalyze.toLowerCase().includes(focusKeyword.toLowerCase())
    ) {
      score += 10;
    } else if (focusKeyword) {
      issue = issue
        ? `${issue}. Title doesn't contain focus keyword`
        : "Title doesn't contain focus keyword";
    }

    return {
      length,
      optimal: length >= 30 && length <= 70,
      score,
      issue,
    };
  }

  /**
   * Analyze description SEO
   */
  private analyzeDescriptionSEO(
    metaDescription?: string | null,
    focusKeyword?: string | null,
  ) {
    if (!metaDescription) {
      return {
        length: 0,
        optimal: false,
        score: 0,
        issue: 'Missing meta description',
      };
    }

    const length = metaDescription.length;
    let score = 0;
    let issue: string | undefined;

    // Length check (10 points)
    if (length >= 120 && length <= 160) {
      score += 10;
    } else if (length < 120) {
      score += 5;
      issue = 'Meta description is too short (should be 120-160 characters)';
    } else {
      score += 5;
      issue = 'Meta description is too long (should be 120-160 characters)';
    }

    // Keyword check (10 points)
    if (
      focusKeyword &&
      metaDescription.toLowerCase().includes(focusKeyword.toLowerCase())
    ) {
      score += 10;
    } else if (focusKeyword) {
      issue = issue
        ? `${issue}. Description doesn't contain focus keyword`
        : "Description doesn't contain focus keyword";
    }

    return {
      length,
      optimal: length >= 120 && length <= 160,
      score,
      issue,
    };
  }

  /**
   * Analyze content SEO
   */
  private analyzeContentSEO(content: string, focusKeyword?: string | null) {
    // Remove HTML tags for analysis
    const plainText = content.replace(/<[^>]*>/g, '');
    const words = plainText.trim().split(/\s+/);
    const wordCount = words.length;
    const readingTime = Math.ceil(wordCount / 200);

    // Count headings
    const headingsCount = (content.match(/<h[2-6][^>]*>/gi) || []).length;

    let score = 0;

    // Word count (15 points)
    if (wordCount >= 300) {
      score += 15;
    } else if (wordCount >= 150) {
      score += 10;
    } else {
      score += 5;
    }

    // Headings structure (10 points)
    if (headingsCount >= 3) {
      score += 10;
    } else if (headingsCount >= 1) {
      score += 5;
    }

    // Keyword density (5 points)
    let keywordDensity = 0;
    if (focusKeyword) {
      const keywordCount = (
        plainText.match(new RegExp(focusKeyword, 'gi')) || []
      ).length;
      keywordDensity = (keywordCount / wordCount) * 100;

      // Optimal keyword density is 1-3%
      if (keywordDensity >= 1 && keywordDensity <= 3) {
        score += 5;
      } else if (keywordDensity > 0 && keywordDensity < 1) {
        score += 3;
      }
    }

    return {
      wordCount,
      readingTime,
      keywordDensity: focusKeyword
        ? Number(keywordDensity.toFixed(2))
        : undefined,
      headingsCount,
      score,
    };
  }

  /**
   * Analyze image SEO
   */
  private analyzeImageSEO(
    featuredImage?: string | null,
    imageAlt?: string | null,
  ) {
    let score = 0;
    const hasFeatureImage = !!featuredImage;
    const hasAltText = !!imageAlt;

    if (hasFeatureImage) {
      score += 10;
    }

    if (hasAltText) {
      score += 5;
    }

    return {
      hasFeatureImage,
      hasAltText,
      score,
    };
  }

  /**
   * Analyze URL SEO
   */
  private analyzeURLSEO(slug: string, focusKeyword?: string | null) {
    const length = slug.length;
    let score = 0;
    let issue: string | undefined;

    // Length check (8 points)
    if (length <= 75) {
      score += 8;
    } else {
      issue = 'URL is too long (should be under 75 characters)';
      score += 4;
    }

    // Keyword in URL (7 points)
    if (
      focusKeyword &&
      slug
        .toLowerCase()
        .includes(focusKeyword.toLowerCase().replace(/\s+/g, '-'))
    ) {
      score += 7;
    } else if (focusKeyword) {
      issue = issue
        ? `${issue}. URL doesn't contain focus keyword`
        : "URL doesn't contain focus keyword";
    }

    return {
      length,
      optimal: length <= 75,
      score,
      issue,
    };
  }

  /**
   * Get SEO recommendations for improving content
   */
  async getSEORecommendations(type: 'blog' | 'category') {
    const recommendations = {
      general: [
        'Use focus keywords strategically in titles, descriptions, and content',
        'Keep meta titles between 30-70 characters',
        'Keep meta descriptions between 120-160 characters',
        'Use heading tags (H1, H2, H3) to structure content',
        'Add alt text to all images',
        'Create SEO-friendly URLs with keywords',
        'Write comprehensive content (300+ words minimum)',
        'Use internal and external links',
        'Optimize page load speed',
        'Make content mobile-friendly',
      ],
      technical: [
        'Set canonical URLs to avoid duplicate content',
        'Use schema.org structured data',
        'Optimize images (compress, lazy load)',
        'Create an XML sitemap',
        'Configure robots.txt properly',
        'Use HTTPS for security',
        'Implement breadcrumbs navigation',
        'Add Open Graph tags for social sharing',
        'Add Twitter Card tags',
        'Monitor and fix broken links',
      ],
      content: [
        'Write unique, valuable content',
        'Target long-tail keywords',
        'Update old content regularly',
        'Use multimedia (images, videos)',
        'Include call-to-actions',
        'Write for your audience, not just search engines',
        'Use bullet points and lists for readability',
        'Keep paragraphs short (2-3 sentences)',
        'Include relevant keywords naturally',
        'Proofread for grammar and spelling',
      ],
    };

    return {
      status: true,
      data: recommendations,
    };
  }

  /**
   * Bulk SEO analysis for all published blogs
   */
  async bulkAnalyzeSEO() {
    const blogs = await this.prisma.blog.findMany({
      where: {
        status: 'PUBLISHED',
        deletedAt: null,
      },
      select: {
        id: true,
        title: true,
        slug: true,
        metaTitle: true,
        metaDescription: true,
        focusKeyword: true,
      },
    });

    const analyses = [];

    for (const blog of blogs) {
      try {
        const analysis = await this.analyzeBlogSEO(blog.id);
        analyses.push({
          blogId: blog.id,
          title: blog.title,
          slug: blog.slug,
          seoScore: analysis.overallScore.percentage,
          issues: analysis.overallScore.issues.length,
          hasIssues: analysis.overallScore.issues.length > 0,
        });
      } catch (error) {
        this.logger.error(
          `Failed to analyze blog ${blog.id}: ${error.message}`,
        );
      }
    }

    // Sort by SEO score (lowest first to highlight problems)
    analyses.sort((a, b) => a.seoScore - b.seoScore);

    const summary = {
      total: analyses.length,
      averageScore:
        analyses.reduce((sum, a) => sum + a.seoScore, 0) / analyses.length,
      needsImprovement: analyses.filter((a) => a.seoScore < 70).length,
      good: analyses.filter((a) => a.seoScore >= 70 && a.seoScore < 90).length,
      excellent: analyses.filter((a) => a.seoScore >= 90).length,
    };

    return {
      status: true,
      data: {
        summary,
        analyses,
      },
    };
  }

  /**
   * Generate SEO report for specific blog
   */
  async generateSEOReport(blogId: string) {
    const analysis = await this.analyzeBlogSEO(blogId);
    const blog = await this.prisma.blog.findUnique({
      where: { id: blogId },
      include: {
        author: {
          select: { name: true },
        },
        category: {
          select: { name: true },
        },
      },
    });

    return {
      status: true,
      data: {
        blog: {
          id: blog?.id,
          title: blog?.title,
          slug: blog?.slug,
          author: blog?.author?.name,
          category: blog?.category?.name,
          publishedAt: blog?.publishedAt,
        },
        analysis,
        grade: this.getSEOGrade(analysis.overallScore.percentage),
      },
    };
  }

  /**
   * Get SEO grade based on score
   */
  private getSEOGrade(percentage: number): string {
    if (percentage >= 90) return 'A+ (Excellent)';
    if (percentage >= 80) return 'A (Very Good)';
    if (percentage >= 70) return 'B (Good)';
    if (percentage >= 60) return 'C (Average)';
    if (percentage >= 50) return 'D (Needs Improvement)';
    return 'F (Poor)';
  }
}
