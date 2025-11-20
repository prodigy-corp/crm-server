import {
  Injectable,
  NestInterceptor,
  ExecutionContext,
  CallHandler,
} from '@nestjs/common';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';
import { Response } from 'express';

export interface ApiResponse<T> {
  success: boolean;
  statusCode: number;
  message?: string;
  data?: T;
  timestamp: string;
  path: string;
}

/**
 * Transform all successful responses to a standard format
 * Excludes file downloads and streaming responses
 */
@Injectable()
export class ResponseTransformInterceptor<T>
  implements NestInterceptor<T, ApiResponse<T>>
{
  intercept(
    context: ExecutionContext,
    next: CallHandler,
  ): Observable<ApiResponse<T>> {
    const ctx = context.switchToHttp();
    const response = ctx.getResponse<Response>();
    const request = ctx.getRequest();

    // Skip transformation for streaming/file responses
    if (response.getHeader('Content-Type')?.toString().includes('stream')) {
      return next.handle();
    }

    return next.handle().pipe(
      map((data) => {
        // If data already has a status or success field, it might be a custom response
        // Preserve it while ensuring standard structure
        if (
          data &&
          typeof data === 'object' &&
          ('status' in data || 'success' in data)
        ) {
          return {
            success: data.status === true || data.success === true,
            statusCode: response.statusCode,
            message: data.message || 'Success',
            data: data.data !== undefined ? data.data : data,
            timestamp: new Date().toISOString(),
            path: request.url,
          };
        }

        // Standard transformation for all other responses
        return {
          success: true,
          statusCode: response.statusCode,
          data,
          timestamp: new Date().toISOString(),
          path: request.url,
        };
      }),
    );
  }
}
