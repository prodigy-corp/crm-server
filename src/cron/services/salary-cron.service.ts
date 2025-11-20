import { Injectable, Logger } from '@nestjs/common';
import { Cron } from '@nestjs/schedule';
import { PrismaService } from '../../prisma/prisma.service';
import {
  EmployeeStatus,
  SalaryPaymentStatus,
  AttendanceStatus,
} from '@prisma/client';
import { Decimal } from '@prisma/client/runtime/library';

@Injectable()
export class SalaryCronService {
  private readonly logger = new Logger(SalaryCronService.name);

  constructor(private readonly prisma: PrismaService) {}

  /**
   * Generate monthly salary payments
   * Runs on the 1st day of every month at 1:00 AM
   * Creates salary payment records for all active employees
   */
  @Cron('0 1 1 * *', {
    name: 'generate-monthly-salary',
    timeZone: 'Asia/Dhaka',
  })
  async generateMonthlySalary() {
    this.logger.log('Starting monthly salary generation cronjob');

    try {
      const now = new Date();
      const lastMonth = new Date(now.getFullYear(), now.getMonth() - 1, 1);
      const lastMonthEnd = new Date(now.getFullYear(), now.getMonth(), 0);

      const month = lastMonth.getMonth() + 1; // 1-12
      const year = lastMonth.getFullYear();

      this.logger.log(
        `Generating salary for ${year}-${String(month).padStart(2, '0')}`,
      );

      // Get all active employees
      const activeEmployees = await this.prisma.employee.findMany({
        where: {
          status: EmployeeStatus.ACTIVE,
          deletedAt: null,
        },
        select: {
          id: true,
          name: true,
          employeeCode: true,
          baseSalary: true,
          salaryIncrements: {
            where: {
              effectiveFrom: {
                lte: lastMonthEnd,
              },
            },
            orderBy: {
              effectiveFrom: 'desc',
            },
            take: 1,
          },
        },
      });

      this.logger.log(
        `Found ${activeEmployees.length} active employees for salary processing`,
      );

      // Check if salary already generated for this month
      const existingSalaries = await this.prisma.employeeSalaryPayment.findMany(
        {
          where: {
            month,
            year,
          },
          select: {
            employeeId: true,
          },
        },
      );

      const existingSalaryEmployeeIds = new Set(
        existingSalaries.map((s) => s.employeeId),
      );

      // Filter employees who don't have salary for this month
      const employeesNeedingSalary = activeEmployees.filter(
        (employee) => !existingSalaryEmployeeIds.has(employee.id),
      );

      if (employeesNeedingSalary.length === 0) {
        this.logger.log(
          `Salaries already generated for ${year}-${String(month).padStart(2, '0')}`,
        );
        return;
      }

      this.logger.log(
        `Generating salary for ${employeesNeedingSalary.length} employees`,
      );

      // Calculate salary for each employee
      const salaryPayments = [];

      for (const employee of employeesNeedingSalary) {
        // Get current salary (base salary or latest increment)
        const latestIncrement = employee.salaryIncrements[0];
        const currentSalary = latestIncrement?.newSalary ?? employee.baseSalary;

        // Get attendance data for the month
        const attendanceData = await this.getMonthlyAttendanceData(
          employee.id,
          lastMonth,
          lastMonthEnd,
        );

        // Calculate deductions based on absences
        const totalDeduction = this.calculateDeductions(
          currentSalary,
          attendanceData,
        );

        // Calculate gross salary (for now, same as basic, can add bonuses later)
        const grossSalary = Number(currentSalary);

        // Calculate net payable
        const netPayable = grossSalary - totalDeduction;

        salaryPayments.push({
          employeeId: employee.id,
          month,
          year,
          basicSalary: currentSalary,
          grossSalary: new Decimal(grossSalary),
          totalDeduction: new Decimal(totalDeduction),
          netPayable: new Decimal(netPayable),
          paymentDate: null,
          status: SalaryPaymentStatus.PENDING,
        });
      }

      // Bulk create salary payment records
      await this.prisma.employeeSalaryPayment.createMany({
        data: salaryPayments,
        skipDuplicates: true,
      });

      this.logger.log(
        `Successfully generated ${salaryPayments.length} salary payment records for ${year}-${String(month).padStart(2, '0')}`,
      );
    } catch (error) {
      this.logger.error(
        `Error in monthly salary generation cronjob: ${error.message}`,
        error.stack,
      );
    }
  }

  /**
   * Send salary payment reminders
   * Runs on the 25th day of every month at 10:00 AM
   * Reminds admin to process pending salary payments
   */
  @Cron('0 10 25 * *', {
    name: 'salary-payment-reminder',
    timeZone: 'Asia/Dhaka',
  })
  async sendSalaryPaymentReminders() {
    this.logger.log('Starting salary payment reminder cronjob');

    try {
      const now = new Date();
      const currentMonth = now.getMonth() + 1;
      const currentYear = now.getFullYear();

      // Get pending salary payments for current month
      const pendingPayments = await this.prisma.employeeSalaryPayment.findMany({
        where: {
          month: currentMonth,
          year: currentYear,
          status: SalaryPaymentStatus.PENDING,
        },
        include: {
          employee: {
            select: {
              id: true,
              name: true,
              employeeCode: true,
            },
          },
        },
      });

      if (pendingPayments.length === 0) {
        this.logger.log('No pending salary payments for this month');
        return;
      }

      const totalAmount = pendingPayments.reduce(
        (sum, payment) => sum + Number(payment.netPayable),
        0,
      );

      this.logger.log(
        `Found ${pendingPayments.length} pending salary payments totaling ${totalAmount.toFixed(2)}`,
      );

      // TODO: Send notification to admin
      // await this.emailService.sendSalaryPaymentReminder({
      //   month: `${currentYear}-${String(currentMonth).padStart(2, '0')}`,
      //   count: pendingPayments.length,
      //   totalAmount,
      //   employees: pendingPayments.map(p => p.employee)
      // });

      this.logger.log('Salary payment reminder cronjob completed');
    } catch (error) {
      this.logger.error(
        `Error in salary payment reminder cronjob: ${error.message}`,
        error.stack,
      );
    }
  }

  /**
   * Generate salary increment recommendations
   * Runs on the 1st day of every quarter at 8:00 AM (January, April, July, October)
   * Analyzes employee performance and attendance to recommend salary increments
   */
  @Cron('0 8 1 1,4,7,10 *', {
    name: 'salary-increment-recommendations',
    timeZone: 'Asia/Dhaka',
  })
  async generateSalaryIncrementRecommendations() {
    this.logger.log('Starting salary increment recommendations cronjob');

    try {
      const now = new Date();
      const threeMonthsAgo = new Date(now.getFullYear(), now.getMonth() - 3, 1);

      // Get employees who haven't received increment in last 6 months
      const employees = await this.prisma.employee.findMany({
        where: {
          status: EmployeeStatus.ACTIVE,
          deletedAt: null,
        },
        include: {
          salaryIncrements: {
            where: {
              effectiveFrom: {
                gte: new Date(now.getFullYear(), now.getMonth() - 6, 1),
              },
            },
          },
          attendanceRecords: {
            where: {
              date: {
                gte: threeMonthsAgo,
              },
            },
          },
        },
      });

      const recommendations = [];

      for (const employee of employees) {
        // Skip if received increment in last 6 months
        if (employee.salaryIncrements.length > 0) {
          continue;
        }

        // Calculate attendance score (0-100)
        const totalDays = employee.attendanceRecords.length;
        const presentDays = employee.attendanceRecords.filter(
          (a) => a.status === AttendanceStatus.PRESENT,
        ).length;

        if (totalDays === 0) continue;

        const attendanceScore = (presentDays / totalDays) * 100;

        // Recommend increment if attendance > 90%
        if (attendanceScore >= 90) {
          const recommendedIncrement = Number(employee.baseSalary) * 0.1; // 10% increment

          recommendations.push({
            employeeId: employee.id,
            employeeName: employee.name,
            currentSalary: Number(employee.baseSalary),
            recommendedIncrement,
            newSalary: Number(employee.baseSalary) + recommendedIncrement,
            attendanceScore: attendanceScore.toFixed(2),
            reason: `Excellent attendance (${attendanceScore.toFixed(2)}%) over the last 3 months`,
          });
        }
      }

      this.logger.log(
        `Generated ${recommendations.length} salary increment recommendations`,
      );

      if (recommendations.length > 0) {
        this.logger.log(
          `Recommendations: ${JSON.stringify(recommendations, null, 2)}`,
        );

        // TODO: Send this to admin
        // await this.emailService.sendSalaryIncrementRecommendations(recommendations);
      }

      this.logger.log('Salary increment recommendations cronjob completed');
    } catch (error) {
      this.logger.error(
        `Error in salary increment recommendations cronjob: ${error.message}`,
        error.stack,
      );
    }
  }

  /**
   * Archive old salary payments
   * Runs on the 1st day of every year at 3:00 AM
   * Archives salary payment records older than 3 years
   */
  @Cron('0 3 1 1 *', {
    name: 'archive-old-salaries',
    timeZone: 'Asia/Dhaka',
  })
  async archiveOldSalaryPayments() {
    this.logger.log('Starting archive old salary payments cronjob');

    try {
      const threeYearsAgo = new Date();
      threeYearsAgo.setFullYear(threeYearsAgo.getFullYear() - 3);

      // Count old records
      const oldRecordsCount = await this.prisma.employeeSalaryPayment.count({
        where: {
          year: {
            lt: threeYearsAgo.getFullYear(),
          },
        },
      });

      this.logger.log(
        `Found ${oldRecordsCount} salary payment records older than 3 years`,
      );

      if (oldRecordsCount > 0) {
        // TODO: Archive to a separate table or external storage before deleting
        this.logger.log(
          `Would archive ${oldRecordsCount} old salary payment records`,
        );

        // Uncomment to actually archive
        // await this.archiveToExternalStorage(...);
      }

      this.logger.log('Archive old salary payments cronjob completed');
    } catch (error) {
      this.logger.error(
        `Error in archive old salary payments cronjob: ${error.message}`,
        error.stack,
      );
    }
  }

  /**
   * Helper method to get monthly attendance data
   */
  private async getMonthlyAttendanceData(
    employeeId: string,
    startDate: Date,
    endDate: Date,
  ) {
    const attendanceRecords = await this.prisma.employeeAttendance.findMany({
      where: {
        employeeId,
        date: {
          gte: startDate,
          lte: endDate,
        },
      },
    });

    const total = attendanceRecords.length;
    const present = attendanceRecords.filter(
      (a) => a.status === AttendanceStatus.PRESENT,
    ).length;
    const absent = attendanceRecords.filter(
      (a) => a.status === AttendanceStatus.ABSENT,
    ).length;
    const late = attendanceRecords.filter(
      (a) => a.status === AttendanceStatus.LATE,
    ).length;
    const onLeave = attendanceRecords.filter(
      (a) => a.status === AttendanceStatus.ON_LEAVE,
    ).length;

    return {
      total,
      present,
      absent,
      late,
      onLeave,
    };
  }

  /**
   * Helper method to calculate deductions based on absences
   * Returns deduction amount
   */
  private calculateDeductions(
    baseSalary: Decimal,
    attendanceData: {
      total: number;
      present: number;
      absent: number;
      late: number;
      onLeave: number;
    },
  ): number {
    // Assume 30 working days per month
    const workingDaysPerMonth = 30;
    const dailySalary = Number(baseSalary) / workingDaysPerMonth;

    // Deduct full day salary for each absent day
    const absentDeduction = attendanceData.absent * dailySalary;

    // Deduct half day salary for each late day (you can adjust this)
    const lateDeduction = attendanceData.late * (dailySalary * 0.5);

    const totalDeduction = absentDeduction + lateDeduction;

    return Number(totalDeduction.toFixed(2));
  }
}
