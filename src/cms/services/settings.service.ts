import { Injectable, NotFoundException, Logger } from '@nestjs/common';
import { PrismaService } from 'src/prisma/prisma.service';
import { UpdateSiteSettingsDto } from '../dto/site-settings.dto';
import { UpdateSEOSettingsDto } from '../dto/seo-settings.dto';

@Injectable()
export class SettingsService {
  private readonly logger = new Logger(SettingsService.name);

  constructor(private readonly prisma: PrismaService) {}

  // ==================== Site Settings ====================

  /**
   * Get site settings (creates default if not exists)
   */
  async getSiteSettings() {
    this.logger.log('Fetching site settings');

    let settings = await this.prisma.siteSettings.findFirst({
      include: {
        updater: {
          select: {
            id: true,
            name: true,
            email: true,
          },
        },
      },
    });

    // Create default settings if none exist
    if (!settings) {
      this.logger.log('No site settings found, creating default');
      settings = await this.prisma.siteSettings.create({
        data: {
          siteName: 'My Site',
          siteUrl: 'https://example.com',
          socialLinks: {},
          timezone: 'UTC',
          language: 'en',
          currency: 'USD',
        },
        include: {
          updater: {
            select: {
              id: true,
              name: true,
              email: true,
            },
          },
        },
      });
    }

    return {
      id: settings.id,
      siteName: settings.siteName,
      siteUrl: settings.siteUrl,
      siteDescription: settings.siteDescription,
      logo: settings.logo,
      favicon: settings.favicon,
      contactEmail: settings.contactEmail,
      contactPhone: settings.contactPhone,
      contactAddress: settings.contactAddress,
      socialLinks: settings.socialLinks as any,
      businessHours: settings.businessHours,
      timezone: settings.timezone,
      language: settings.language,
      currency: settings.currency,
      updatedAt: settings.updatedAt,
      updatedBy: settings.updatedBy,
      updater: (settings as any).updater,
    };
  }

  /**
   * Update site settings
   */
  async updateSiteSettings(dto: UpdateSiteSettingsDto, userId?: string) {
    this.logger.log(`Updating site settings by user: ${userId}`);

    // Get existing settings or create if not exists
    let settings = await this.prisma.siteSettings.findFirst();

    if (!settings) {
      // Create new settings
      settings = await this.prisma.siteSettings.create({
        data: {
          siteName: dto.siteName || 'My Site',
          siteUrl: dto.siteUrl || 'https://example.com',
          siteDescription: dto.siteDescription,
          logo: dto.logo,
          favicon: dto.favicon,
          contactEmail: dto.contactEmail,
          contactPhone: dto.contactPhone,
          contactAddress: dto.contactAddress,
          socialLinks: (dto.socialLinks || {}) as any,
          businessHours: dto.businessHours,
          timezone: dto.timezone || 'UTC',
          language: dto.language || 'en',
          currency: dto.currency || 'USD',
          updatedBy: userId,
        },
        include: {
          updater: {
            select: {
              id: true,
              name: true,
              email: true,
            },
          },
        },
      });
    } else {
      // Update existing settings
      const updateData: any = { ...dto };
      if (userId) {
        updateData.updatedBy = userId;
      }

      settings = await this.prisma.siteSettings.update({
        where: { id: settings.id },
        data: updateData,
        include: {
          updater: {
            select: {
              id: true,
              name: true,
              email: true,
            },
          },
        },
      });
    }

    this.logger.log('Site settings updated successfully');

    return {
      id: settings.id,
      siteName: settings.siteName,
      siteUrl: settings.siteUrl,
      siteDescription: settings.siteDescription,
      logo: settings.logo,
      favicon: settings.favicon,
      contactEmail: settings.contactEmail,
      contactPhone: settings.contactPhone,
      contactAddress: settings.contactAddress,
      socialLinks: settings.socialLinks as any,
      businessHours: settings.businessHours,
      timezone: settings.timezone,
      language: settings.language,
      currency: settings.currency,
      updatedAt: settings.updatedAt,
      updatedBy: settings.updatedBy,
      updater: (settings as any).updater,
    };
  }

  // ==================== SEO Settings ====================

  /**
   * Get SEO settings (creates default if not exists)
   */
  async getSEOSettings() {
    this.logger.log('Fetching SEO settings');

    let settings = await this.prisma.sEOSettings.findFirst({
      include: {
        updater: {
          select: {
            id: true,
            name: true,
            email: true,
          },
        },
      },
    });

    // Create default settings if none exist
    if (!settings) {
      this.logger.log('No SEO settings found, creating default');
      settings = await this.prisma.sEOSettings.create({
        data: {
          twitterCard: 'summary_large_image',
          robotsDirectives: {
            index: true,
            follow: true,
            noarchive: false,
            nosnippet: false,
            noimageindex: false,
          },
          metaKeywords: [],
        },
        include: {
          updater: {
            select: {
              id: true,
              name: true,
              email: true,
            },
          },
        },
      });
    }

    return {
      id: settings.id,
      metaTitle: settings.metaTitle,
      metaDescription: settings.metaDescription,
      metaKeywords: settings.metaKeywords,
      ogTitle: settings.ogTitle,
      ogDescription: settings.ogDescription,
      ogImage: settings.ogImage,
      twitterCard: settings.twitterCard,
      twitterTitle: settings.twitterTitle,
      twitterDescription: settings.twitterDescription,
      twitterImage: settings.twitterImage,
      twitterSite: settings.twitterSite,
      twitterCreator: settings.twitterCreator,
      canonicalUrl: settings.canonicalUrl,
      robotsDirectives: settings.robotsDirectives as any,
      structuredData: settings.structuredData,
      googleSiteVerification: settings.googleSiteVerification,
      googleAnalyticsId: settings.googleAnalyticsId,
      googleTagManagerId: settings.googleTagManagerId,
      facebookPixelId: settings.facebookPixelId,
      facebookAppId: settings.facebookAppId,
      updatedAt: settings.updatedAt,
      updatedBy: settings.updatedBy,
      updater: (settings as any).updater,
    };
  }

  /**
   * Update SEO settings
   */
  async updateSEOSettings(dto: UpdateSEOSettingsDto, userId?: string) {
    this.logger.log(`Updating SEO settings by user: ${userId}`);

    // Get existing settings or create if not exists
    let settings = await this.prisma.sEOSettings.findFirst();

    if (!settings) {
      // Create new settings
      settings = await this.prisma.sEOSettings.create({
        data: {
          metaTitle: dto.metaTitle,
          metaDescription: dto.metaDescription,
          metaKeywords: dto.metaKeywords || [],
          ogTitle: dto.ogTitle,
          ogDescription: dto.ogDescription,
          ogImage: dto.ogImage,
          twitterCard: dto.twitterCard || 'summary_large_image',
          twitterTitle: dto.twitterTitle,
          twitterDescription: dto.twitterDescription,
          twitterImage: dto.twitterImage,
          twitterSite: dto.twitterSite,
          twitterCreator: dto.twitterCreator,
          canonicalUrl: dto.canonicalUrl,
          robotsDirectives: (dto.robotsDirectives || {
            index: true,
            follow: true,
            noarchive: false,
            nosnippet: false,
            noimageindex: false,
          }) as any,
          structuredData: dto.structuredData,
          googleSiteVerification: dto.googleSiteVerification,
          googleAnalyticsId: dto.googleAnalyticsId,
          googleTagManagerId: dto.googleTagManagerId,
          facebookPixelId: dto.facebookPixelId,
          facebookAppId: dto.facebookAppId,
          updatedBy: userId,
        },
        include: {
          updater: {
            select: {
              id: true,
              name: true,
              email: true,
            },
          },
        },
      });
    } else {
      // Update existing settings
      const updateData: any = { ...dto };
      if (userId) {
        updateData.updatedBy = userId;
      }

      settings = await this.prisma.sEOSettings.update({
        where: { id: settings.id },
        data: updateData,
        include: {
          updater: {
            select: {
              id: true,
              name: true,
              email: true,
            },
          },
        },
      });
    }

    this.logger.log('SEO settings updated successfully');

    return {
      id: settings.id,
      metaTitle: settings.metaTitle,
      metaDescription: settings.metaDescription,
      metaKeywords: settings.metaKeywords,
      ogTitle: settings.ogTitle,
      ogDescription: settings.ogDescription,
      ogImage: settings.ogImage,
      twitterCard: settings.twitterCard,
      twitterTitle: settings.twitterTitle,
      twitterDescription: settings.twitterDescription,
      twitterImage: settings.twitterImage,
      twitterSite: settings.twitterSite,
      twitterCreator: settings.twitterCreator,
      canonicalUrl: settings.canonicalUrl,
      robotsDirectives: settings.robotsDirectives as any,
      structuredData: settings.structuredData,
      googleSiteVerification: settings.googleSiteVerification,
      googleAnalyticsId: settings.googleAnalyticsId,
      googleTagManagerId: settings.googleTagManagerId,
      facebookPixelId: settings.facebookPixelId,
      facebookAppId: settings.facebookAppId,
      updatedAt: settings.updatedAt,
      updatedBy: settings.updatedBy,
      updater: (settings as any).updater,
    };
  }
}
