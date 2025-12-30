import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { ThrottlerModule, ThrottlerGuard } from '@nestjs/throttler';
import { APP_GUARD, APP_FILTER, APP_INTERCEPTOR } from '@nestjs/core';
import { LoggerModule } from 'nestjs-pino';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { AuthModule } from './auth/auth.module';
import { PrismaModule } from './prisma/prisma.module';
import { CommonModule } from './common/common.module';
import { validateEnv } from './config/env.config';
import { HealthModule } from './health/health.module';
import { AllExceptionsFilter } from './common/exceptions/http-exception.filter';
import { ResponseTransformInterceptor } from './common/interceptors/response-transform.interceptor';
import { BlogModule } from './blog/blog.module';
import { AdminModule } from './admin/admin.module';
import { AnalyticsModule } from './analytics/analytics.module';
import { CmsModule } from './cms/cms.module';
import { EmployeeModule } from './employee/employee.module';
import { CronModule } from './cron/cron.module';
import { DepartmentModule } from './department/department.module';
import { ShiftModule } from './shift/shift.module';
import { BullModule } from '@nestjs/bullmq';
import { redisConfig } from './config/redis.config';
import { QUEUES } from './queues/queue.constants';
import { MessageModule } from './message/message.module';
import { ProjectModule } from './project/project.module';
import { TaskModule } from './task/task.module';
import { PerformanceModule } from './performance/performance.module';
import { ProductivityModule } from './productivity/productivity.module';

@Module({
  imports: [
    // Configuration module with validation
    ConfigModule.forRoot({
      isGlobal: true,
      validate: validateEnv,
      envFilePath: ['.env.local', '.env'],
    }),
    BullModule.forRoot({
      connection: redisConfig,
    }),
    BullModule.registerQueue(
      { name: QUEUES.NOTIFICATION },
      { name: QUEUES.EMAIL },
      { name: QUEUES.ANALYTICS },
    ),

    // Pino logger
    LoggerModule.forRoot({
      pinoHttp: {
        transport:
          process.env.NODE_ENV !== 'production'
            ? {
                target: 'pino-pretty',
                options: {
                  singleLine: true,
                  colorize: true,
                  translateTime: 'SYS:standard',
                  ignore: 'pid,hostname',
                },
              }
            : undefined,
        level: process.env.LOG_LEVEL || 'info',
        serializers: {
          req(req: {
            id: string;
            method: string;
            url: string;
            headers: Record<string, string | undefined>;
          }) {
            return {
              id: req.id,
              method: req.method,
              url: req.url,
              // Remove sensitive headers
              headers: {
                ...req.headers,
                authorization: req.headers.authorization
                  ? '[REDACTED]'
                  : undefined,
                cookie: req.headers.cookie ? '[REDACTED]' : undefined,
              },
            };
          },
          res(res: { statusCode: number }) {
            return {
              statusCode: res.statusCode,
            };
          },
        },
      },
    }),

    // Rate limiting (global)
    ThrottlerModule.forRoot([
      {
        ttl: parseInt(process.env.THROTTLE_TTL || '60') * 1000,
        limit: parseInt(process.env.THROTTLE_LIMIT || '100'),
      },
    ]),

    // Application modules
    AuthModule,
    PrismaModule,
    CommonModule,
    HealthModule,
    BlogModule,
    AdminModule,
    AnalyticsModule,
    CmsModule,
    EmployeeModule,
    CronModule,
    DepartmentModule,
    ShiftModule,
    MessageModule,
    ProjectModule,
    TaskModule,
    ProductivityModule,
    PerformanceModule,
  ],
  controllers: [AppController],
  providers: [
    AppService,
    // Global exception filter
    {
      provide: APP_FILTER,
      useClass: AllExceptionsFilter,
    },
    // Global response transformer
    {
      provide: APP_INTERCEPTOR,
      useClass: ResponseTransformInterceptor,
    },
    // Apply rate limiting globally
    {
      provide: APP_GUARD,
      useClass: ThrottlerGuard,
    },
  ],
})
export class AppModule {}
