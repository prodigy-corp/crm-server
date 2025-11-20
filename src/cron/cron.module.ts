import { Module } from '@nestjs/common';
import { ScheduleModule } from '@nestjs/schedule';
import { AttendanceCronService } from './services/attendance-cron.service';
import { SalaryCronService } from './services/salary-cron.service';
import { PrismaModule } from '../prisma/prisma.module';
import { EmailModule } from '../email/email.module';

@Module({
  imports: [ScheduleModule.forRoot(), PrismaModule, EmailModule],
  providers: [AttendanceCronService, SalaryCronService],
  exports: [AttendanceCronService, SalaryCronService],
})
export class CronModule {}
