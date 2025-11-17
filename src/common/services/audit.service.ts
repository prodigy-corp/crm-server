import { Injectable, Logger } from '@nestjs/common';
import { PrismaService } from 'src/prisma/prisma.service';

export interface AuditLogData {
  userId?: string;
  action: string;
  entity: string;
  entityId: string;
  changes?: any;
  ip?: string;
  userAgent?: string;
}

@Injectable()
export class AuditService {
  private readonly logger = new Logger(AuditService.name);

  constructor(private prisma: PrismaService) {}

  async log(data: AuditLogData): Promise<void> {
    try {
      const auditData: any = {
        userId: data.userId,
        action: data.action,
        entity: data.entity,
        entityId: data.entityId,
        ip: data.ip,
        userAgent: data.userAgent,
      };

      // Only add changes if it's defined
      if (data.changes !== undefined) {
        auditData.changes = data.changes;
      }

      await this.prisma.auditLog.create({
        data: auditData,
      });
    } catch (error) {
      this.logger.error('Failed to create audit log', error);
    }
  }

  async logBookingAction(
    userId: string,
    action: 'CREATE' | 'UPDATE' | 'CANCEL' | 'CONFIRM',
    bookingId: string,
    changes?: any,
  ): Promise<void> {
    await this.log({
      userId,
      action,
      entity: 'Booking',
      entityId: bookingId,
      changes,
    });
  }

  async logPaymentAction(
    userId: string,
    action: 'INITIATE' | 'SUCCESS' | 'FAILED' | 'REFUND',
    transactionId: string,
    changes?: any,
  ): Promise<void> {
    await this.log({
      userId,
      action,
      entity: 'Payment',
      entityId: transactionId,
      changes,
    });
  }

  async logAdminAction(
    adminId: string,
    action: string,
    entity: string,
    entityId: string,
    changes?: any,
  ): Promise<void> {
    await this.log({
      userId: adminId,
      action: `ADMIN_${action}`,
      entity,
      entityId,
      changes,
    });
  }
}
