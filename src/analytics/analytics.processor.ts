import { Logger, Injectable } from '@nestjs/common';
import { WorkerHost, Processor } from '@nestjs/bullmq';
import { Job } from 'bullmq';
import { ConfigService } from '@nestjs/config';
import { QUEUES } from 'src/queues/queue.constants';
import * as crypto from 'crypto';

@Injectable()
@Processor(QUEUES.ANALYTICS)
export class AnalyticsProcessor extends WorkerHost {
  private readonly logger = new Logger(AnalyticsProcessor.name);
  private readonly gaEnabled: boolean;
  private readonly gaMeasurementId: string;
  private readonly gaApiSecret: string;
  private readonly fbEnabled: boolean;
  private readonly fbPixelId: string;
  private readonly fbAccessToken: string;

  constructor(private readonly configService: ConfigService) {
    super();

    // Load configuration
    this.gaEnabled =
      this.configService.get<string>('GA_ENABLED') === 'true' &&
      !!this.configService.get<string>('GA_MEASUREMENT_ID');
    this.gaMeasurementId = this.configService.get<string>(
      'GA_MEASUREMENT_ID',
      '',
    );
    this.gaApiSecret = this.configService.get<string>('GA_API_SECRET', '');

    this.fbEnabled =
      this.configService.get<string>('FB_PIXEL_ENABLED') === 'true' &&
      !!this.configService.get<string>('FB_PIXEL_ID');
    this.fbPixelId = this.configService.get<string>('FB_PIXEL_ID', '');
    this.fbAccessToken = this.configService.get<string>(
      'FB_PIXEL_ACCESS_TOKEN',
      '',
    );
  }

  async process(
    job: Job<Record<string, unknown>, unknown, string>,
  ): Promise<void> {
    try {
      switch (job.name) {
        case 'track-event':
          await this.handleTrackEvent(job.data);
          break;
        case 'track-pageview':
          await this.handleTrackPageView(job.data);
          break;
        case 'track-conversion':
          await this.handleTrackConversion(job.data);
          break;
        default:
          this.logger.warn(`Unknown job type: ${job.name}`);
      }
    } catch (error: unknown) {
      this.logger.error(
        `Failed processing analytics job ${job.name}: ${error instanceof Error ? error.message : String(error)}`,
      );
      throw error;
    }
  }

  private async handleTrackEvent(data: Record<string, unknown>): Promise<void> {
    const {
      eventName,
      userId,
      userEmail,
      sessionId,
      properties,
      userProperties,
      timestamp,
    } = data as {
      eventName: string;
      userId?: string;
      userEmail?: string;
      sessionId?: string;
      properties?: Record<string, unknown>;
      userProperties?: Record<string, unknown>;
      timestamp?: Date;
    };

    this.logger.debug(`Processing event: ${eventName}`);

    // Send to Google Analytics 4
    if (this.gaEnabled) {
      await this.sendToGoogleAnalytics({
        eventName,
        userId,
        sessionId,
        properties,
        userProperties,
        timestamp,
      });
    }

    // Send to Facebook Pixel
    if (this.fbEnabled) {
      await this.sendToFacebookPixel({
        eventName,
        userId,
        userEmail,
        properties,
        timestamp,
      });
    }

    this.logger.log(`✅ Event tracked: ${eventName}`);
  }

  private async handleTrackPageView(
    data: Record<string, unknown>,
  ): Promise<void> {
    const { url, title, referrer, userId, sessionId, properties, timestamp } =
      data as {
        url: string;
        title?: string;
        referrer?: string;
        userId?: string;
        sessionId?: string;
        properties?: Record<string, unknown>;
        timestamp?: Date;
      };

    this.logger.debug(`Processing page view: ${url}`);

    // Send to Google Analytics 4
    if (this.gaEnabled) {
      await this.sendToGoogleAnalytics({
        eventName: 'page_view',
        userId,
        sessionId,
        properties: {
          page_location: url,
          page_title: title,
          page_referrer: referrer,
          ...properties,
        },
        timestamp,
      });
    }

    // Send to Facebook Pixel
    if (this.fbEnabled) {
      await this.sendToFacebookPixel({
        eventName: 'PageView',
        userId,
        properties: {
          url,
          title,
          referrer,
          ...properties,
        },
        timestamp,
      });
    }

    this.logger.log(`✅ Page view tracked: ${url}`);
  }

  private async handleTrackConversion(
    data: Record<string, unknown>,
  ): Promise<void> {
    const {
      conversionName,
      value,
      currency,
      userId,
      userEmail,
      properties,
      timestamp,
    } = data as {
      conversionName: string;
      value?: number;
      currency?: string;
      userId?: string;
      userEmail?: string;
      properties?: Record<string, unknown>;
      timestamp?: Date;
    };

    this.logger.debug(`Processing conversion: ${conversionName}`);

    // Send to Google Analytics 4
    if (this.gaEnabled) {
      await this.sendToGoogleAnalytics({
        eventName: conversionName,
        userId,
        properties: {
          value,
          currency: currency || 'USD',
          ...properties,
        },
        timestamp,
      });
    }

    // Send to Facebook Pixel
    if (this.fbEnabled) {
      await this.sendToFacebookPixel({
        eventName: 'Purchase',
        userId,
        userEmail,
        properties: {
          value,
          currency: currency || 'USD',
          content_name: conversionName,
          ...properties,
        },
        timestamp,
      });
    }

    this.logger.log(`✅ Conversion tracked: ${conversionName}`);
  }

  /**
   * Send event to Google Analytics 4 Measurement Protocol
   * https://developers.google.com/analytics/devguides/collection/protocol/ga4
   */
  private async sendToGoogleAnalytics(data: {
    eventName: string;
    userId?: string;
    sessionId?: string;
    properties?: Record<string, unknown>;
    userProperties?: Record<string, unknown>;
    timestamp?: Date;
  }): Promise<void> {
    try {
      const clientId = data.userId || this.generateClientId();
      const timestamp = data.timestamp
        ? new Date(data.timestamp).getTime() * 1000
        : Date.now() * 1000;

      const payload = {
        client_id: clientId,
        user_id: data.userId,
        timestamp_micros: timestamp,
        events: [
          {
            name: data.eventName,
            params: {
              session_id: data.sessionId,
              engagement_time_msec: '100',
              ...data.properties,
            },
          },
        ],
        user_properties: data.userProperties,
      };

      const url = `https://www.google-analytics.com/mp/collect?measurement_id=${this.gaMeasurementId}&api_secret=${this.gaApiSecret}`;

      const response = await fetch(url, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(payload),
      });

      if (!response.ok) {
        throw new Error(
          `GA4 API error: ${response.status} ${response.statusText}`,
        );
      }

      this.logger.debug(`✅ Sent to Google Analytics: ${data.eventName}`);
    } catch (error: unknown) {
      this.logger.error(
        `Failed to send to Google Analytics: ${error instanceof Error ? error.message : String(error)}`,
      );
    }
  }

  /**
   * Send event to Facebook Conversions API
   * https://developers.facebook.com/docs/marketing-api/conversions-api
   */
  private async sendToFacebookPixel(data: {
    eventName: string;
    userId?: string;
    userEmail?: string;
    properties?: Record<string, unknown>;
    timestamp?: Date;
  }): Promise<void> {
    try {
      const timestamp = data.timestamp
        ? Math.floor(new Date(data.timestamp).getTime() / 1000)
        : Math.floor(Date.now() / 1000);

      const eventData: {
        event_name: string;
        event_time: number;
        action_source: string;
        event_source_url: string;
        user_data: Record<string, string>;
        custom_data: Record<string, unknown>;
      } = {
        event_name: data.eventName,
        event_time: timestamp,
        action_source: 'website',
        event_source_url:
          (data.properties?.url as string) || 'https://api.yoursite.com',
        user_data: {},
        custom_data: data.properties || {},
      };

      // Add user data if available
      if (data.userEmail) {
        eventData.user_data.em = this.hashData(data.userEmail);
      }
      if (data.userId) {
        eventData.user_data.external_id = this.hashData(data.userId);
      }

      const payload = {
        data: [eventData],
      };

      const url = `https://graph.facebook.com/v18.0/${this.fbPixelId}/events?access_token=${this.fbAccessToken}`;

      const response = await fetch(url, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(payload),
      });

      const result = await response.json();

      if (!response.ok || result.error) {
        throw new Error(`Facebook API error: ${JSON.stringify(result)}`);
      }

      this.logger.debug(`✅ Sent to Facebook Pixel: ${data.eventName}`);
    } catch (error: unknown) {
      this.logger.error(
        `Failed to send to Facebook Pixel: ${error instanceof Error ? error.message : String(error)}`,
      );
    }
  }

  /**
   * Generate a random client ID for GA4
   */
  private generateClientId(): string {
    return `${Date.now()}.${Math.random().toString(36).substring(2, 15)}`;
  }

  /**
   * Hash data for Facebook Pixel (SHA256)
   */
  private hashData(data: string): string {
    return crypto
      .createHash('sha256')
      .update(data.toLowerCase().trim())
      .digest('hex');
  }
}
