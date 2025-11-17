import {
  Injectable,
  NestInterceptor,
  ExecutionContext,
  CallHandler,
  Logger,
} from '@nestjs/common';
import { Observable } from 'rxjs';
import { tap } from 'rxjs/operators';
import { Reflector } from '@nestjs/core';
import { AnalyticsService } from '../analytics.service';
import {
  TRACK_EVENT_KEY,
  TrackEventMetadata,
} from '../decorators/track-event.decorator';

@Injectable()
export class AnalyticsInterceptor implements NestInterceptor {
  private readonly logger = new Logger(AnalyticsInterceptor.name);

  constructor(
    private readonly reflector: Reflector,
    private readonly analyticsService: AnalyticsService,
  ) {}

  intercept(context: ExecutionContext, next: CallHandler): Observable<any> {
    const metadata = this.reflector.get<TrackEventMetadata>(
      TRACK_EVENT_KEY,
      context.getHandler(),
    );

    if (!metadata || !this.analyticsService.isEnabled()) {
      return next.handle();
    }

    const request = context.switchToHttp().getRequest();
    const userId = request.user?.id;
    const userEmail = request.user?.email;

    return next.handle().pipe(
      tap(() => {
        // Track the event after successful execution
        this.analyticsService
          .trackEvent({
            eventName: metadata.eventName,
            userId,
            userEmail,
            properties: {
              ...metadata.properties,
              path: request.path,
              method: request.method,
            },
          })
          .catch((error) => {
            this.logger.error(`Failed to track event: ${error.message}`);
          });
      }),
    );
  }
}
