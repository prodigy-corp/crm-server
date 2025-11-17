import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { InjectQueue } from '@nestjs/bullmq';
import { Queue } from 'bullmq';
import { QUEUES } from 'src/queues/queue.constants';
import {
  AnalyticsEvent,
  PageViewEvent,
  ConversionEvent,
  AnalyticsConfig,
} from './interfaces/analytics.interface';

@Injectable()
export class AnalyticsService {
  private readonly logger = new Logger(AnalyticsService.name);
  private readonly config: AnalyticsConfig;

  constructor(
    @InjectQueue(QUEUES.ANALYTICS) private readonly analyticsQueue: Queue,
    private readonly configService: ConfigService,
  ) {
    // Load analytics configuration
    this.config = {
      enabled: this.configService.get<string>('ANALYTICS_ENABLED') === 'true',
      googleAnalytics: {
        enabled:
          this.configService.get<string>('GA_ENABLED') === 'true' &&
          !!this.configService.get<string>('GA_MEASUREMENT_ID'),
        measurementId: this.configService.get<string>('GA_MEASUREMENT_ID', ''),
        apiSecret: this.configService.get<string>('GA_API_SECRET', ''),
      },
      facebookPixel: {
        enabled:
          this.configService.get<string>('FB_PIXEL_ENABLED') === 'true' &&
          !!this.configService.get<string>('FB_PIXEL_ID'),
        pixelId: this.configService.get<string>('FB_PIXEL_ID', ''),
        accessToken: this.configService.get<string>(
          'FB_PIXEL_ACCESS_TOKEN',
          '',
        ),
      },
    };

    if (this.config.enabled) {
      this.logger.log('✅ Analytics service initialized');
      if (this.config.googleAnalytics?.enabled) {
        this.logger.log('✅ Google Analytics 4 enabled');
      }
      if (this.config.facebookPixel?.enabled) {
        this.logger.log('✅ Facebook Pixel enabled');
      }
    } else {
      this.logger.warn('⚠️ Analytics service is disabled');
    }
  }

  /**
   * Track a custom event
   */
  async trackEvent(event: AnalyticsEvent): Promise<void> {
    if (!this.config.enabled) return;

    try {
      await this.analyticsQueue.add('track-event', {
        ...event,
        timestamp: event.timestamp || new Date(),
      });
      this.logger.debug(`📊 Event queued: ${event.eventName}`);
    } catch (error) {
      this.logger.error(
        `Failed to queue event: ${error instanceof Error ? error.message : String(error)}`,
      );
    }
  }

  /**
   * Track a page view
   */
  async trackPageView(pageView: PageViewEvent): Promise<void> {
    if (!this.config.enabled) return;

    try {
      await this.analyticsQueue.add('track-pageview', {
        ...pageView,
        timestamp: new Date(),
      });
      this.logger.debug(`📄 Page view queued: ${pageView.url}`);
    } catch (error) {
      this.logger.error(
        `Failed to queue page view: ${error instanceof Error ? error.message : String(error)}`,
      );
    }
  }

  /**
   * Track a conversion event
   */
  async trackConversion(conversion: ConversionEvent): Promise<void> {
    if (!this.config.enabled) return;

    try {
      await this.analyticsQueue.add('track-conversion', {
        ...conversion,
        timestamp: new Date(),
      });
      this.logger.debug(`💰 Conversion queued: ${conversion.conversionName}`);
    } catch (error) {
      this.logger.error(
        `Failed to queue conversion: ${error instanceof Error ? error.message : String(error)}`,
      );
    }
  }

  /**
   * Track user signup
   */
  async trackSignup(
    userId: string,
    email: string,
    properties?: Record<string, any>,
  ): Promise<void> {
    await this.trackEvent({
      eventName: 'user_signup',
      userId,
      userEmail: email,
      properties,
    });
  }

  /**
   * Track user login
   */
  async trackLogin(
    userId: string,
    email: string,
    properties?: Record<string, any>,
  ): Promise<void> {
    await this.trackEvent({
      eventName: 'user_login',
      userId,
      userEmail: email,
      properties,
    });
  }

  /**
   * Track API endpoint usage
   */
  async trackApiCall(
    endpoint: string,
    method: string,
    statusCode: number,
    userId?: string,
    duration?: number,
  ): Promise<void> {
    await this.trackEvent({
      eventName: 'api_call',
      userId,
      properties: {
        endpoint,
        method,
        statusCode,
        duration,
      },
    });
  }

  /**
   * Track errors
   */
  async trackError(
    error: Error,
    context?: string,
    userId?: string,
    properties?: Record<string, any>,
  ): Promise<void> {
    await this.trackEvent({
      eventName: 'error',
      userId,
      properties: {
        errorMessage: error.message,
        errorStack: error.stack,
        context,
        ...properties,
      },
    });
  }

  /**
   * Get analytics configuration
   */
  getConfig(): AnalyticsConfig {
    return this.config;
  }

  /**
   * Check if analytics is enabled
   */
  isEnabled(): boolean {
    return this.config.enabled;
  }
}
