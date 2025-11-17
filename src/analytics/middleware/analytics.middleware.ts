import { Injectable, NestMiddleware, Logger } from '@nestjs/common';
import { Request, Response, NextFunction } from 'express';
import { AnalyticsService } from '../analytics.service';

@Injectable()
export class AnalyticsMiddleware implements NestMiddleware {
  private readonly logger = new Logger(AnalyticsMiddleware.name);

  constructor(private readonly analyticsService: AnalyticsService) {}

  use(req: Request, res: Response, next: NextFunction) {
    if (!this.analyticsService.isEnabled()) {
      return next();
    }

    const startTime = Date.now();

    // Capture response finish event
    res.on('finish', () => {
      const duration = Date.now() - startTime;
      const userId = (req as any).user?.id;

      // Track API call
      this.analyticsService
        .trackApiCall(req.path, req.method, res.statusCode, userId, duration)
        .catch((error) => {
          this.logger.error(`Failed to track API call: ${error.message}`);
        });
    });

    next();
  }
}
