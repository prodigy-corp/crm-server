import { Module } from '@nestjs/common';
import { BullModule } from '@nestjs/bullmq';

import { QUEUES } from 'src/queues/queue.constants';
import { AnalyticsController } from './analytics.controller';
import { AnalyticsService } from './analytics.service';
import { AnalyticsProcessor } from './analytics.processor';

@Module({
  imports: [BullModule.registerQueue({ name: QUEUES.ANALYTICS })],
  controllers: [AnalyticsController],
  providers: [AnalyticsService, AnalyticsProcessor],
  exports: [AnalyticsService],
})
export class AnalyticsModule {}
