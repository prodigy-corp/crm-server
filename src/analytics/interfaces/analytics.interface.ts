export interface AnalyticsEvent {
  eventName: string;
  userId?: string;
  userEmail?: string;
  sessionId?: string;
  timestamp?: Date;
  properties?: Record<string, any>;
  userProperties?: Record<string, any>;
}

export interface PageViewEvent {
  url: string;
  title?: string;
  referrer?: string;
  userId?: string;
  sessionId?: string;
  properties?: Record<string, any>;
}

export interface ConversionEvent {
  conversionName: string;
  value?: number;
  currency?: string;
  userId?: string;
  userEmail?: string;
  properties?: Record<string, any>;
}

export interface AnalyticsConfig {
  enabled: boolean;
  googleAnalytics?: {
    enabled: boolean;
    measurementId: string;
    apiSecret: string;
  };
  facebookPixel?: {
    enabled: boolean;
    pixelId: string;
    accessToken: string;
  };
  customTracking?: {
    enabled: boolean;
    endpoint?: string;
  };
}
