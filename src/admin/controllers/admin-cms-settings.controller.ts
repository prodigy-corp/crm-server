import {
  Body,
  Controller,
  FileTypeValidator,
  Get,
  MaxFileSizeValidator,
  NotAcceptableException,
  ParseFilePipe,
  Post,
  Put,
  Query,
  Request,
  UploadedFile,
  UseGuards,
  UseInterceptors,
} from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { FileInterceptor } from '@nestjs/platform-express';
import {
  AnalyticsQueryDto,
  analyticsQuerySchema,
  TrafficSourcesQueryDto,
  trafficSourcesQuerySchema,
} from 'src/cms/dto/analytics.dto';
import { UpdateSEOSettingsDto } from 'src/cms/dto/seo-settings.dto';
import { UpdateSiteSettingsDto } from 'src/cms/dto/site-settings.dto';
import { DashboardService } from 'src/cms/services/dashboard.service';
import { SeoService } from 'src/cms/services/seo.service';
import { SettingsService } from 'src/cms/services/settings.service';
import { Permissions } from 'src/common/decorators/permissions.decorator';
import { PermissionsGuard } from 'src/common/guards/permissions.guard';
import { UploadService } from 'src/upload/upload.service';

@UseGuards(AuthGuard('jwt'), PermissionsGuard)
@Controller('admin/cms')
export class AdminCmsSettingsController {
  constructor(
    private readonly seoService: SeoService,
    private readonly dashboardService: DashboardService,
    private readonly settingsService: SettingsService,
    private readonly uploadService: UploadService,
  ) {}

  // Dashboard
  @Permissions('admin.dashboard.view')
  @Get('dashboard/stats')
  async getDashboardStats() {
    return this.dashboardService.getDashboardStats();
  }

  @Permissions('admin.analytics.view')
  @Get('dashboard/analytics')
  async getAnalytics(@Query() query: AnalyticsQueryDto) {
    const parsed = analyticsQuerySchema.safeParse(query);
    if (!parsed.success) throw new NotAcceptableException(parsed.error);
    return this.dashboardService.getAnalytics(
      parsed.data.startDate,
      parsed.data.endDate,
    );
  }

  @Permissions('admin.analytics.view')
  @Get('dashboard/traffic-sources')
  async getTrafficSources(@Query() query: TrafficSourcesQueryDto) {
    const parsed = trafficSourcesQuerySchema.safeParse(query);
    if (!parsed.success) throw new NotAcceptableException(parsed.error);
    return this.dashboardService.getTrafficSources(parsed.data.days);
  }

  @Permissions('admin.analytics.view')
  @Get('dashboard/content-performance')
  async getContentPerformance() {
    return this.dashboardService.getContentPerformance();
  }

  @Permissions('admin.analytics.view')
  @Get('dashboard/author-stats')
  async getAuthorStats() {
    return this.dashboardService.getAuthorStats();
  }

  // Site Settings
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

  // SEO Settings
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

  // Uploads
  @Permissions('admin.settings.update')
  @Post('upload/logo')
  @UseInterceptors(FileInterceptor('file'))
  async uploadLogo(
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
    const result = await this.uploadService.uploadFile(file, 'cms/logos');
    const fileUrl = result.Location || `${process.env.APP_URL}/${result.Key}`;
    return {
      status: true,
      data: { url: fileUrl, key: result.Key },
      message: 'Logo uploaded successfully',
    };
  }

  @Permissions('admin.settings.update')
  @Post('upload/favicon')
  @UseInterceptors(FileInterceptor('file'))
  async uploadFavicon(
    @UploadedFile(
      new ParseFilePipe({
        validators: [
          new MaxFileSizeValidator({ maxSize: 1 * 1024 * 1024 }),
          new FileTypeValidator({ fileType: /(ico|png|svg)$/ }),
        ],
        fileIsRequired: true,
      }),
    )
    file: Express.Multer.File,
  ) {
    const result = await this.uploadService.uploadFile(file, 'cms/favicons');
    const fileUrl = result.Location || `${process.env.APP_URL}/${result.Key}`;
    return {
      status: true,
      data: { url: fileUrl, key: result.Key },
      message: 'Favicon uploaded successfully',
    };
  }

  @Permissions('admin.settings.update')
  @Post('upload/seo-image')
  @UseInterceptors(FileInterceptor('file'))
  async uploadSeoImage(
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
    const result = await this.uploadService.uploadFile(file, 'cms/seo-images');
    const fileUrl = result.Location || `${process.env.APP_URL}/${result.Key}`;
    return {
      status: true,
      data: { url: fileUrl, key: result.Key },
      message: 'SEO image uploaded successfully',
    };
  }

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
}
