import { Injectable, Logger } from '@nestjs/common';
import { Cron, CronExpression } from '@nestjs/schedule';
import { PrismaService } from '../../prisma/prisma.service';
import { AttendanceStatus, EmployeeStatus } from '@prisma/client';

@Injectable()
export class AttendanceCronService {
  private readonly logger = new Logger(AttendanceCronService.name);

  constructor(private readonly prisma: PrismaService) {}

  /**
   * Auto-mark absent employees
   * Runs every day at 11:59 PM
   * Marks all active employees who haven't checked in as ABSENT
   * Respects shift schedules: skips employees on off days
   */
  @Cron('59 23 * * *', {
    name: 'auto-mark-absent',
    timeZone: 'Asia/Dhaka', // Adjust to your timezone
  })
  async autoMarkAbsentEmployees() {
    this.logger.log('Starting auto-mark absent employees cronjob');

    try {
      const today = this.getStartOfDay(new Date());
      const dayOfWeek = today.getDay(); // 0=Sunday, 1=Monday, ..., 6=Saturday

      // Get all active employees with their shifts
      const activeEmployees = await this.prisma.employee.findMany({
        where: {
          status: EmployeeStatus.ACTIVE,
          deletedAt: null,
        },
        select: {
          id: true,
          name: true,
          employeeCode: true,
          shift: {
            include: {
              schedules: true,
            },
          },
          department: {
            include: {
              defaultShift: {
                include: {
                  schedules: true,
                },
              },
            },
          },
        },
      });

      this.logger.log(
        `Found ${activeEmployees.length} active employees to process`,
      );

      // Get employees who already have attendance records for today
      const todayAttendanceRecords =
        await this.prisma.employeeAttendance.findMany({
          where: {
            date: today,
          },
          select: {
            employeeId: true,
          },
        });

      const employeesWithAttendance = new Set(
        todayAttendanceRecords.map((record) => record.employeeId),
      );

      // Filter employees based on shift schedule
      const employeesToMark: Array<{
        id: string;
        name: string;
        employeeCode: string;
        shift: {
          id: string;
          schedules: Array<{
            id: string;
            shiftId: string;
            startTime: string | null;
            endTime: string | null;
            dayOfWeek: number;
            isOffDay: boolean;
            isHalfDay: boolean;
          }>;
        } | null;
        department: {
          defaultShift: {
            id: string;
            schedules: Array<{
              id: string;
              shiftId: string;
              startTime: string | null;
              endTime: string | null;
              dayOfWeek: number;
              isOffDay: boolean;
              isHalfDay: boolean;
            }>;
          } | null;
        } | null;
      }> = [];

      for (const employee of activeEmployees) {
        // Skip if employee already has attendance record
        if (employeesWithAttendance.has(employee.id)) {
          continue;
        }

        // Skip employees without valid employee code
        if (!employee.employeeCode) {
          this.logger.warn(
            `Skipping ${employee.name} - no employee code assigned`,
          );
          continue;
        }

        // Get effective shift (employee's shift or department's default shift)
        const effectiveShift =
          employee.shift || employee.department?.defaultShift;

        // If no shift assigned, mark as absent
        if (!effectiveShift) {
          employeesToMark.push({
            ...employee,
            employeeCode: employee.employeeCode, // Safe assertion after null check
          });
          continue;
        }

        // Check if today is an off day for this employee's shift
        const todaySchedule = effectiveShift.schedules?.find(
          (s) => s.dayOfWeek === dayOfWeek,
        );

        // If today is an off day, skip this employee
        if (todaySchedule?.isOffDay) {
          this.logger.log(`Skipping ${employee.name} - today is an off day`);
          continue;
        }

        // Mark as absent (including half days - they should still check in)
        employeesToMark.push({
          ...employee,
          employeeCode: employee.employeeCode, // Safe assertion after null check
        });
      }

      if (employeesToMark.length === 0) {
        this.logger.log('No employees to mark as absent');
        return;
      }

      this.logger.log(`Marking ${employeesToMark.length} employees as ABSENT`);

      // Create ABSENT records for employees
      const absentRecords = employeesToMark.map((employee) => ({
        employeeId: employee.id,
        date: today,
        status: AttendanceStatus.ABSENT,
        checkInAt: null,
        checkOutAt: null,
        workingHours: null,
      }));

      // Bulk insert absent records
      await this.prisma.employeeAttendance.createMany({
        data: absentRecords,
        skipDuplicates: true,
      });

      this.logger.log(
        `Successfully marked ${employeesToMark.length} employees as ABSENT`,
      );
    } catch (error) {
      this.logger.error(
        `Error in auto-mark absent cronjob: ${error.message}`,
        error.stack,
      );
    }
  }

  /**
   * Send checkout reminders
   * Runs every day at 6:00 PM
   * Reminds employees who checked in but haven't checked out
   */
  @Cron('0 18 * * *', {
    name: 'checkout-reminder',
    timeZone: 'Asia/Dhaka',
  })
  async sendCheckoutReminders() {
    this.logger.log('Starting checkout reminder cronjob');

    try {
      const today = this.getStartOfDay(new Date());

      // Find employees who checked in but haven't checked out
      const pendingCheckouts = await this.prisma.employeeAttendance.findMany({
        where: {
          date: today,
          checkInAt: { not: null },
          checkOutAt: null,
        },
        include: {
          employee: {
            select: {
              id: true,
              name: true,
              emailAddress: true,
              mobileNumber: true,
            },
          },
        },
      });

      this.logger.log(
        `Found ${pendingCheckouts.length} employees with pending checkouts`,
      );

      // TODO: Integrate with notification or email service
      // For now, just log the employees
      for (const attendance of pendingCheckouts) {
        this.logger.log(
          `Reminder needed for ${attendance.employee.name} (${attendance.employee.emailAddress})`,
        );
        // You can send email/SMS/push notification here
      }

      this.logger.log('Checkout reminder cronjob completed');
    } catch (error) {
      this.logger.error(
        `Error in checkout reminder cronjob: ${error.message}`,
        error.stack,
      );
    }
  }

  /**
   * Generate daily attendance summary
   * Runs every day at 12:30 AM
   * Generates and logs daily attendance statistics
   */
  @Cron('30 0 * * *', {
    name: 'daily-attendance-summary',
    timeZone: 'Asia/Dhaka',
  })
  async generateDailyAttendanceSummary() {
    this.logger.log('Starting daily attendance summary cronjob');

    try {
      const yesterday = this.getStartOfDay(
        new Date(Date.now() - 24 * 60 * 60 * 1000),
      );

      // Get attendance statistics for yesterday
      const stats = await this.prisma.employeeAttendance.groupBy({
        by: ['status'],
        where: {
          date: yesterday,
        },
        _count: {
          status: true,
        },
      });

      const summary = {
        date: yesterday.toISOString().split('T')[0],
        statistics: stats.reduce(
          (acc, stat) => {
            acc[stat.status] = stat._count.status;
            return acc;
          },
          {} as Record<string, number>,
        ),
      };

      this.logger.log(
        `Daily Attendance Summary for ${summary.date}: ${JSON.stringify(summary.statistics)}`,
      );

      // TODO: Store this summary or send to admin via email
      // await this.emailService.sendDailyAttendanceSummary(summary);

      this.logger.log('Daily attendance summary cronjob completed');
    } catch (error) {
      this.logger.error(
        `Error in daily attendance summary cronjob: ${error.message}`,
        error.stack,
      );
    }
  }

  /**
   * Generate weekly attendance report
   * Runs every Monday at 9:00 AM
   */
  @Cron('0 9 * * 1', {
    name: 'weekly-attendance-report',
    timeZone: 'Asia/Dhaka',
  })
  async generateWeeklyAttendanceReport() {
    this.logger.log('Starting weekly attendance report cronjob');

    try {
      const today = new Date();
      const lastWeekStart = this.getStartOfDay(
        new Date(today.getTime() - 7 * 24 * 60 * 60 * 1000),
      );
      const lastWeekEnd = this.getStartOfDay(
        new Date(today.getTime() - 1 * 24 * 60 * 60 * 1000),
      );

      // Get weekly attendance statistics
      const weeklyStats = await this.prisma.employeeAttendance.groupBy({
        by: ['status'],
        where: {
          date: {
            gte: lastWeekStart,
            lte: lastWeekEnd,
          },
        },
        _count: {
          status: true,
        },
      });

      // Get top absent employees
      const topAbsentees = await this.prisma.employeeAttendance.groupBy({
        by: ['employeeId'],
        where: {
          date: {
            gte: lastWeekStart,
            lte: lastWeekEnd,
          },
          status: AttendanceStatus.ABSENT,
        },
        _count: {
          employeeId: true,
        },
        orderBy: {
          _count: {
            employeeId: 'desc',
          },
        },
        take: 5,
      });

      const report = {
        weekStart: lastWeekStart.toISOString().split('T')[0],
        weekEnd: lastWeekEnd.toISOString().split('T')[0],
        statistics: weeklyStats.reduce(
          (acc, stat) => {
            acc[stat.status] = stat._count.status;
            return acc;
          },
          {} as Record<string, number>,
        ),
        topAbsenteeIds: topAbsentees.map((item) => ({
          employeeId: item.employeeId,
          absentCount: item._count.employeeId,
        })),
      };

      this.logger.log(
        `Weekly Attendance Report (${report.weekStart} to ${report.weekEnd}): ${JSON.stringify(report.statistics)}`,
      );

      // TODO: Send this report to admin
      // await this.emailService.sendWeeklyAttendanceReport(report);

      this.logger.log('Weekly attendance report cronjob completed');
    } catch (error) {
      this.logger.error(
        `Error in weekly attendance report cronjob: ${error.message}`,
        error.stack,
      );
    }
  }

  /**
   * Auto-checkout employees
   * Runs every day at 11:55 PM
   * Automatically checkout employees who forgot to check out
   */
  @Cron('55 23 * * *', {
    name: 'auto-checkout',
    timeZone: 'Asia/Dhaka',
  })
  async autoCheckoutEmployees() {
    this.logger.log('Starting auto-checkout cronjob');

    try {
      const today = this.getStartOfDay(new Date());
      const now = new Date();

      // Find employees who checked in but haven't checked out
      const pendingCheckouts = await this.prisma.employeeAttendance.findMany({
        where: {
          date: today,
          checkInAt: { not: null },
          checkOutAt: null,
        },
        include: {
          employee: {
            select: {
              id: true,
              name: true,
            },
          },
        },
      });

      this.logger.log(
        `Found ${pendingCheckouts.length} employees with pending checkouts`,
      );

      // Auto-checkout each employee
      for (const attendance of pendingCheckouts) {
        const workingHours =
          (now.getTime() - attendance.checkInAt!.getTime()) / (1000 * 60 * 60);

        await this.prisma.employeeAttendance.update({
          where: {
            id: attendance.id,
          },
          data: {
            checkOutAt: now,
            workingHours: Number(workingHours.toFixed(2)),
          },
        });

        this.logger.log(
          `Auto checked-out ${attendance.employee.name} with ${workingHours.toFixed(2)} working hours`,
        );
      }

      this.logger.log('Auto-checkout cronjob completed');
    } catch (error) {
      this.logger.error(
        `Error in auto-checkout cronjob: ${error.message}`,
        error.stack,
      );
    }
  }

  /**
   * Clean old attendance records
   * Runs on the 1st day of every month at 2:00 AM
   * Archives or cleans attendance records older than 2 years
   */
  @Cron('0 2 1 * *', {
    name: 'clean-old-attendance',
    timeZone: 'Asia/Dhaka',
  })
  async cleanOldAttendanceRecords() {
    this.logger.log('Starting clean old attendance records cronjob');

    try {
      const twoYearsAgo = new Date();
      twoYearsAgo.setFullYear(twoYearsAgo.getFullYear() - 2);

      // Count old records
      const oldRecordsCount = await this.prisma.employeeAttendance.count({
        where: {
          date: {
            lt: twoYearsAgo,
          },
        },
      });

      this.logger.log(
        `Found ${oldRecordsCount} attendance records older than 2 years`,
      );

      if (oldRecordsCount > 0) {
        // TODO: Archive to a separate table or external storage before deleting
        // For now, just log
        this.logger.log(
          `Would archive/delete ${oldRecordsCount} old attendance records`,
        );

        // Uncomment to actually delete
        // await this.prisma.employeeAttendance.deleteMany({
        //   where: {
        //     date: {
        //       lt: twoYearsAgo,
        //     },
        //   },
        // });
      }

      this.logger.log('Clean old attendance records cronjob completed');
    } catch (error) {
      this.logger.error(
        `Error in clean old attendance records cronjob: ${error.message}`,
        error.stack,
      );
    }
  }

  /**
   * Helper method to get start of day (midnight)
   */
  private getStartOfDay(date: Date): Date {
    return new Date(date.getFullYear(), date.getMonth(), date.getDate());
  }
}
