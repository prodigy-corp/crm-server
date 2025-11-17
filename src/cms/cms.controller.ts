import {
  Controller,
  Get,
  Put,
  Post,
  Body,
  Param,
  Query,
  Res,
  UseGuards,
  HttpCode,
  HttpStatus,
  Header,
  Request,
  UseInterceptors,
  UploadedFile,
  BadRequestException,
  ParseFilePipe,
  MaxFileSizeValidator,
  FileTypeValidator,
} from '@nestjs/common';
import { Response } from 'express';
import { FileInterceptor } from '@nestjs/platform-express';
import { AuthGuard } from '@nestjs/passport';
import { Permissions } from 'src/common/decorators/permissions.decorator';
import { PermissionsGuard } from 'src/common/guards/permissions.guard';
import { SeoService } from './services/seo.service';
import { DashboardService } from './services/dashboard.service';
import { SitemapService } from './services/sitemap.service';
import { SettingsService } from './services/settings.service';
import { UploadService } from 'src/upload/upload.service';
import { UpdateSiteSettingsDto } from './dto/site-settings.dto';
import { UpdateSEOSettingsDto } from './dto/seo-settings.dto';
import {
  AnalyticsQueryDto,
  analyticsQuerySchema,
  TrafficSourcesQueryDto,
  trafficSourcesQuerySchema,
} from './dto/analytics.dto';
import { NotAcceptableException } from '@nestjs/common';
import { AuthenticateRequest } from 'src/auth/types/types';

@Controller('admin/cms')
export class CmsController {
  constructor(
    private readonly seoService: SeoService,
    private readonly dashboardService: DashboardService,
    private readonly sitemapService: SitemapService,
    private readonly settingsService: SettingsService,
    private readonly uploadService: UploadService,
  ) {}

  // ==================== Dashboard Endpoints ====================

  /**
   * Get comprehensive dashboard statistics
   */
  @UseGuards(AuthGuard('jwt'), PermissionsGuard)
  @Permissions('admin.dashboard.view')
  @Get('dashboard/stats')
  async getDashboardStats() {
    return this.dashboardService.getDashboardStats();
  }

  /**
   * Get analytics for date range
   */
  @UseGuards(AuthGuard('jwt'), PermissionsGuard)
  @Permissions('admin.analytics.view')
  @Get('dashboard/analytics')
  async getAnalytics(@Query() query: AnalyticsQueryDto) {
    const parsed = analyticsQuerySchema.safeParse(query);
    if (!parsed.success) {
      throw new NotAcceptableException(parsed.error);
    }
    return this.dashboardService.getAnalytics(
      parsed.data.startDate,
      parsed.data.endDate,
    );
  }

  /**
   * Get traffic sources
   */
  @UseGuards(AuthGuard('jwt'), PermissionsGuard)
  @Permissions('admin.analytics.view')
  @Get('dashboard/traffic-sources')
  async getTrafficSources(@Query() query: TrafficSourcesQueryDto) {
    const parsed = trafficSourcesQuerySchema.safeParse(query);
    if (!parsed.success) {
      throw new NotAcceptableException(parsed.error);
    }
    return this.dashboardService.getTrafficSources(parsed.data.days);
  }

  /**
   * Get content performance metrics
   */
  @UseGuards(AuthGuard('jwt'), PermissionsGuard)
  @Permissions('admin.analytics.view')
  @Get('dashboard/content-performance')
  async getContentPerformance() {
    return this.dashboardService.getContentPerformance();
  }

  /**
   * Get author statistics
   */
  @UseGuards(AuthGuard('jwt'), PermissionsGuard)
  @Permissions('admin.analytics.view')
  @Get('dashboard/author-stats')
  async getAuthorStats() {
    return this.dashboardService.getAuthorStats();
  }

  // ==================== SEO Endpoints ====================

  /**
   * Analyze specific blog SEO
   */
  @UseGuards(AuthGuard('jwt'), PermissionsGuard)
  @Permissions('admin.seo.view')
  @Get('seo/analyze/:blogId')
  async analyzeBlogSEO(@Param('blogId') blogId: string) {
    return this.seoService.generateSEOReport(blogId);
  }

  /**
   * Bulk SEO analysis for all blogs
   */
  @UseGuards(AuthGuard('jwt'), PermissionsGuard)
  @Permissions('admin.seo.view')
  @Get('seo/bulk-analyze')
  async bulkAnalyzeSEO() {
    return this.seoService.bulkAnalyzeSEO();
  }

  /**
   * Get SEO recommendations
   */
  @UseGuards(AuthGuard('jwt'), PermissionsGuard)
  @Permissions('admin.seo.view')
  @Get('seo/recommendations')
  async getSEORecommendations(@Query('type') type?: 'blog' | 'category') {
    return this.seoService.getSEORecommendations(type || 'blog');
  }

  // ==================== Settings Endpoints ====================

  /**
   * Get site settings
   */
  @UseGuards(AuthGuard('jwt'), PermissionsGuard)
  @Permissions('admin.settings.view')
  @Get('site-settings')
  async getSiteSettings() {
    const settings = await this.settingsService.getSiteSettings();
    return {
      status: true,
      data: settings,
      message: 'Site settings retrieved successfully',
    };
  }

  /**
   * Update site settings
   */
  @UseGuards(AuthGuard('jwt'), PermissionsGuard)
  @Permissions('admin.settings.update')
  @Put('site-settings')
  async updateSiteSettings(
    @Body() dto: UpdateSiteSettingsDto,
    @Request() req: any,
  ) {
    const userId = req.user?.userId || req.user?.id;
    const settings = await this.settingsService.updateSiteSettings(dto, userId);
    return {
      status: true,
      data: settings,
      message: 'Site settings updated successfully',
    };
  }

  /**
   * Get SEO settings
   */
  @UseGuards(AuthGuard('jwt'), PermissionsGuard)
  @Permissions('admin.settings.view')
  @Get('seo-settings')
  async getSEOSettings() {
    const settings = await this.settingsService.getSEOSettings();
    return {
      status: true,
      data: settings,
      message: 'SEO settings retrieved successfully',
    };
  }

  /**
   * Update SEO settings
   */
  @UseGuards(AuthGuard('jwt'), PermissionsGuard)
  @Permissions('admin.settings.update')
  @Put('seo-settings')
  async updateSEOSettings(
    @Body() dto: UpdateSEOSettingsDto,
    @Request() req: any,
  ) {
    const userId = req.user?.userId || req.user?.id;
    const settings = await this.settingsService.updateSEOSettings(dto, userId);
    return {
      status: true,
      data: settings,
      message: 'SEO settings updated successfully',
    };
  }

  // ==================== File Upload Endpoints ====================

  /**
   * Upload logo image
   */
  @UseGuards(AuthGuard('jwt'), PermissionsGuard)
  @Permissions('admin.settings.update')
  @Post('upload/logo')
  @UseInterceptors(FileInterceptor('file'))
  async uploadLogo(@UploadedFile() file: Express.Multer.File) {
    if (!file) {
      throw new BadRequestException('No file uploaded');
    }

    // Validate file type
    const allowedTypes = [
      'image/jpeg',
      'image/jpg',
      'image/png',
      'image/webp',
      'image/svg+xml',
    ];
    if (!allowedTypes.includes(file.mimetype)) {
      throw new BadRequestException(
        'Invalid file type. Only JPEG, PNG, WebP, and SVG are allowed',
      );
    }

    // Validate file size (max 5MB)
    const maxSize = 5 * 1024 * 1024;
    if (file.size > maxSize) {
      throw new BadRequestException('File size exceeds 5MB limit');
    }

    const result = await this.uploadService.uploadFile(file, 'cms/logos');
    const fileUrl = result.Location || `${process.env.APP_URL}/${result.Key}`;

    return {
      status: true,
      data: {
        url: fileUrl,
        key: result.Key,
      },
      message: 'Logo uploaded successfully',
    };
  }

  /**
   * Upload favicon image
   */
  @UseGuards(AuthGuard('jwt'), PermissionsGuard)
  @Permissions('admin.settings.update')
  @Post('upload/favicon')
  @UseInterceptors(FileInterceptor('file'))
  async uploadFavicon(@UploadedFile() file: Express.Multer.File) {
    if (!file) {
      throw new BadRequestException('No file uploaded');
    }

    // Validate file type
    const allowedTypes = [
      'image/x-icon',
      'image/vnd.microsoft.icon',
      'image/png',
      'image/svg+xml',
    ];
    if (!allowedTypes.includes(file.mimetype)) {
      throw new BadRequestException(
        'Invalid file type. Only ICO, PNG, and SVG are allowed for favicon',
      );
    }

    // Validate file size (max 1MB)
    const maxSize = 1 * 1024 * 1024;
    if (file.size > maxSize) {
      throw new BadRequestException('File size exceeds 1MB limit');
    }

    const result = await this.uploadService.uploadFile(file, 'cms/favicons');
    const fileUrl = result.Location || `${process.env.APP_URL}/${result.Key}`;

    return {
      status: true,
      data: {
        url: fileUrl,
        key: result.Key,
      },
      message: 'Favicon uploaded successfully',
    };
  }

  /**
   * Upload OG/Twitter image
   */
  @UseGuards(AuthGuard('jwt'), PermissionsGuard)
  @Permissions('admin.settings.update')
  @Post('upload/seo-image')
  @UseInterceptors(FileInterceptor('file'))
  async uploadSeoImage(@UploadedFile() file: Express.Multer.File) {
    if (!file) {
      throw new BadRequestException('No file uploaded');
    }

    // Validate file type
    const allowedTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp'];
    if (!allowedTypes.includes(file.mimetype)) {
      throw new BadRequestException(
        'Invalid file type. Only JPEG, PNG, and WebP are allowed',
      );
    }

    // Validate file size (max 5MB)
    const maxSize = 5 * 1024 * 1024;
    if (file.size > maxSize) {
      throw new BadRequestException('File size exceeds 5MB limit');
    }

    const result = await this.uploadService.uploadFile(file, 'cms/seo-images');
    const fileUrl = result.Location || `${process.env.APP_URL}/${result.Key}`;

    return {
      status: true,
      data: {
        url: fileUrl,
        key: result.Key,
      },
      message: 'SEO image uploaded successfully',
    };
  }

  /**
   * Upload hero background image
   */
  @UseGuards(AuthGuard('jwt'), PermissionsGuard)
  @Permissions('admin.settings.update')
  @Post('upload/hero-image')
  @UseInterceptors(FileInterceptor('file'))
  async uploadHeroImage(
    @UploadedFile(
      new ParseFilePipe({
        validators: [
          new MaxFileSizeValidator({ maxSize: 10 * 1024 * 1024 }),
          new FileTypeValidator({ fileType: /(jpg|jpeg|png|webp|mp4|mov)$/ }),
        ],
        fileIsRequired: true,
      }),
    )
    file: Express.Multer.File,
  ) {
    const result = await this.uploadService.uploadFile(file, 'cms/hero');
    const fileUrl = result.Location || `${process.env.APP_URL}/${result.Key}`;
    return {
      status: true,
      data: { url: fileUrl, key: result.Key },
      message: 'Hero image uploaded successfully',
    };
  }

  /**
   * Upload testimonial avatar
   */
  @UseGuards(AuthGuard('jwt'), PermissionsGuard)
  @Permissions('admin.settings.update')
  @Post('upload/testimonial-avatar')
  @UseInterceptors(FileInterceptor('file'))
  async uploadTestimonialAvatar(
    @UploadedFile(
      new ParseFilePipe({
        validators: [
          new MaxFileSizeValidator({ maxSize: 5 * 1024 * 1024 }),
          new FileTypeValidator({ fileType: /(jpg|jpeg|png|webp)$/ }),
        ],
        fileIsRequired: true,
      }),
    )
    file: Express.Multer.File,
  ) {
    const result = await this.uploadService.uploadFile(
      file,
      'cms/testimonials',
    );
    const fileUrl = result.Location || `${process.env.APP_URL}/${result.Key}`;
    return {
      status: true,
      data: { url: fileUrl, key: result.Key },
      message: 'Testimonial avatar uploaded successfully',
    };
  }

  /**
   * Upload generic content image
   */
  @UseGuards(AuthGuard('jwt'), PermissionsGuard)
  @Permissions('admin.settings.update')
  @Post('upload/content-image')
  @UseInterceptors(FileInterceptor('file'))
  async uploadContentImage(
    @UploadedFile(
      new ParseFilePipe({
        validators: [
          new MaxFileSizeValidator({ maxSize: 5 * 1024 * 1024 }),
          new FileTypeValidator({ fileType: /(jpg|jpeg|png|webp|svg)$/ }),
        ],
        fileIsRequired: true,
      }),
    )
    file: Express.Multer.File,
  ) {
    const result = await this.uploadService.uploadFile(file, 'cms/content');
    const fileUrl = result.Location || `${process.env.APP_URL}/${result.Key}`;
    return {
      status: true,
      data: { url: fileUrl, key: result.Key },
      message: 'Content image uploaded successfully',
    };
  }

  // ==================== Sitemap Endpoints ====================

  /**
   * Get XML sitemap (Public)
   */
  @Get('sitemap.xml')
  @HttpCode(HttpStatus.OK)
  @Header('Content-Type', 'application/xml')
  async getSitemap(@Res() res: Response) {
    const sitemap = await this.sitemapService.generateSitemap();
    res.send(sitemap);
  }

  /**
   * Get robots.txt (Public)
   */
  @Get('robots.txt')
  @HttpCode(HttpStatus.OK)
  @Header('Content-Type', 'text/plain')
  async getRobotsTxt(@Res() res: Response) {
    const robotsTxt = await this.sitemapService.generateRobotsTxt();
    res.send(robotsTxt);
  }

  /**
   * Get RSS feed (Public)
   */
  @Get('rss.xml')
  @HttpCode(HttpStatus.OK)
  @Header('Content-Type', 'application/rss+xml')
  async getRSSFeed(@Res() res: Response) {
    const rss = await this.sitemapService.generateRSSFeed();
    res.send(rss);
  }

  /**
   * Get HTML sitemap (Public)
   */
  @Get('sitemap.html')
  @HttpCode(HttpStatus.OK)
  @Header('Content-Type', 'text/html')
  async getHTMLSitemap(@Res() res: Response) {
    const sitemap = await this.sitemapService.generateHTMLSitemap();
    res.send(sitemap);
  }

  /**
   * Get sitemap statistics (Admin)
   */
  @UseGuards(AuthGuard('jwt'), PermissionsGuard)
  @Permissions('admin.seo.view')
  @Get('sitemap/stats')
  async getSitemapStats() {
    return this.sitemapService.getSitemapStats();
  }
}
