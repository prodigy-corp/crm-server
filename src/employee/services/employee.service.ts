import {
  BadRequestException,
  Injectable,
  Logger,
  NotFoundException,
} from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import { UploadService } from 'src/upload/upload.service';
import {
  UpdateEmployeeProfileDto,
  EmployeeAttendanceCheckDto,
  EmployeeAttendanceQueryDto,
  EmployeeSalaryQueryDto,
} from '../dto/employee.dto';
import { AttendanceStatus } from '@prisma/client';

@Injectable()
export class EmployeeService {
  private readonly logger = new Logger(EmployeeService.name);

  constructor(
    private readonly prisma: PrismaService,
    private readonly uploadService: UploadService,
  ) {}

  /**
   * Get employee profile by user ID
   * Employees can only access their own profile
   */
  async getProfile(userId: string) {
    const employee = await this.prisma.employee.findFirst({
      where: {
        userId,
        deletedAt: null,
      },
      include: {
        user: {
          select: {
            id: true,
            email: true,
            name: true,
            avatar: true,
            status: true,
          },
        },
      },
    });

    if (!employee) {
      throw new NotFoundException('Employee profile not found');
    }

    return employee;
  }

  /**
   * Update employee profile (limited fields)
   * Employees can only update contact information
   */
  async updateProfile(userId: string, dto: UpdateEmployeeProfileDto) {
    const employee = await this.prisma.employee.findFirst({
      where: { userId, deletedAt: null },
    });

    if (!employee) {
      throw new NotFoundException('Employee profile not found');
    }

    const updated = await this.prisma.employee.update({
      where: { id: employee.id },
      data: {
        mobileNumber: dto.mobileNumber,
        alternativeContactNumber: dto.alternativeContactNumber,
        emergencyContactNumber: dto.emergencyContactNumber,
        facebookProfileLink: dto.facebookProfileLink,
      },
    });

    this.logger.log(`Employee ${employee.id} updated their profile`);
    return updated;
  }

  /**
   * Upload employee photo
   */
  async uploadPhoto(userId: string, file: Express.Multer.File) {
    const employee = await this.prisma.employee.findFirst({
      where: { userId, deletedAt: null },
    });

    if (!employee) {
      throw new NotFoundException('Employee profile not found');
    }

    const uploadResult = await this.uploadService.uploadFile(file, 'employees');
    const photoKey = uploadResult.Key as string;

    // Delete old photo if exists
    if (employee.photoUrl) {
      await this.uploadService.deleteFile(employee.photoUrl);
    }

    const updated = await this.prisma.employee.update({
      where: { id: employee.id },
      data: {
        photoUrl: photoKey,
      },
      select: {
        id: true,
        photoUrl: true,
      },
    });

    return {
      ...updated,
      key: photoKey,
    };
  }

  /**
   * Get employee's attendance records
   */
  async getAttendance(userId: string, query: EmployeeAttendanceQueryDto) {
    const employee = await this.prisma.employee.findFirst({
      where: { userId, deletedAt: null },
    });

    if (!employee) {
      throw new NotFoundException('Employee profile not found');
    }

    const { page = 1, limit = 10, fromDate, toDate, status } = query;

    const pageNum = Number(page) || 1;
    const limitNum = Number(limit) || 10;
    const skip = (pageNum - 1) * limitNum;

    const where: any = {
      employeeId: employee.id,
    };

    if (fromDate || toDate) {
      where.date = {};
      if (fromDate) {
        where.date.gte = new Date(fromDate);
      }
      if (toDate) {
        where.date.lte = new Date(toDate);
      }
    }

    if (status) {
      where.status = status;
    }

    const [data, total] = await this.prisma.$transaction([
      this.prisma.employeeAttendance.findMany({
        where,
        skip,
        take: limitNum,
        orderBy: { date: 'desc' },
      }),
      this.prisma.employeeAttendance.count({ where }),
    ]);

    return {
      data,
      meta: {
        total,
        page: pageNum,
        limit: limitNum,
        totalPages: Math.ceil(total / limitNum),
      },
    };
  }

  /**
   * Check-in for the day
   */
  async checkIn(userId: string, dto: EmployeeAttendanceCheckDto) {
    const employee = await this.prisma.employee.findFirst({
      where: { userId, deletedAt: null },
    });

    if (!employee) {
      throw new NotFoundException('Employee profile not found');
    }

    const attendanceDate = this.getStartOfDay(dto.date);

    // Check if already checked in today
    const existing = await this.prisma.employeeAttendance.findUnique({
      where: {
        employeeId_date: {
          employeeId: employee.id,
          date: attendanceDate,
        },
      },
    });

    if (existing && existing.checkInAt) {
      throw new BadRequestException('Already checked in for today');
    }

    const now = new Date();

    const attendance = await this.prisma.employeeAttendance.upsert({
      where: {
        employeeId_date: {
          employeeId: employee.id,
          date: attendanceDate,
        },
      },
      update: {
        checkInAt: now,
        status: AttendanceStatus.PRESENT,
      },
      create: {
        employeeId: employee.id,
        date: attendanceDate,
        checkInAt: now,
        status: AttendanceStatus.PRESENT,
      },
    });

    this.logger.log(
      `Employee ${employee.id} checked in at ${now.toISOString()}`,
    );
    return attendance;
  }

  /**
   * Check-out for the day
   */
  async checkOut(userId: string, dto: EmployeeAttendanceCheckDto) {
    const employee = await this.prisma.employee.findFirst({
      where: { userId, deletedAt: null },
    });

    if (!employee) {
      throw new NotFoundException('Employee profile not found');
    }

    const attendanceDate = this.getStartOfDay(dto.date);

    const existing = await this.prisma.employeeAttendance.findUnique({
      where: {
        employeeId_date: {
          employeeId: employee.id,
          date: attendanceDate,
        },
      },
    });

    if (!existing || !existing.checkInAt) {
      throw new BadRequestException('Must check in before checking out');
    }

    if (existing.checkOutAt) {
      throw new BadRequestException('Already checked out for today');
    }

    const now = new Date();
    const workingHours =
      (now.getTime() - existing.checkInAt.getTime()) / (1000 * 60 * 60);

    const updated = await this.prisma.employeeAttendance.update({
      where: {
        employeeId_date: {
          employeeId: employee.id,
          date: attendanceDate,
        },
      },
      data: {
        checkOutAt: now,
        workingHours: Number(workingHours.toFixed(2)),
      },
    });

    this.logger.log(
      `Employee ${employee.id} checked out at ${now.toISOString()} (${workingHours.toFixed(2)} hours)`,
    );
    return updated;
  }

  /**
   * Get today's attendance status
   */
  async getTodayAttendance(userId: string) {
    const employee = await this.prisma.employee.findFirst({
      where: { userId, deletedAt: null },
    });

    if (!employee) {
      throw new NotFoundException('Employee profile not found');
    }

    const today = this.getStartOfDay();

    const attendance = await this.prisma.employeeAttendance.findUnique({
      where: {
        employeeId_date: {
          employeeId: employee.id,
          date: today,
        },
      },
    });

    return attendance || null;
  }

  /**
   * Get employee's salary payments
   */
  async getSalaryPayments(userId: string, query: EmployeeSalaryQueryDto) {
    const employee = await this.prisma.employee.findFirst({
      where: { userId, deletedAt: null },
    });

    if (!employee) {
      throw new NotFoundException('Employee profile not found');
    }

    const { page = 1, limit = 10, month, year } = query;

    const pageNum = Number(page) || 1;
    const limitNum = Number(limit) || 10;
    const skip = (pageNum - 1) * limitNum;

    const where: any = {
      employeeId: employee.id,
    };

    if (month) {
      where.month = month;
    }

    if (year) {
      where.year = year;
    }

    const [data, total] = await this.prisma.$transaction([
      this.prisma.employeeSalaryPayment.findMany({
        where,
        skip,
        take: limitNum,
        orderBy: [{ year: 'desc' }, { month: 'desc' }],
      }),
      this.prisma.employeeSalaryPayment.count({ where }),
    ]);

    return {
      data,
      meta: {
        total,
        page: pageNum,
        limit: limitNum,
        totalPages: Math.ceil(total / limitNum),
      },
    };
  }

  /**
   * Get employee's salary increments
   */
  async getSalaryIncrements(userId: string) {
    const employee = await this.prisma.employee.findFirst({
      where: { userId, deletedAt: null },
    });

    if (!employee) {
      throw new NotFoundException('Employee profile not found');
    }

    const increments = await this.prisma.employeeSalaryIncrement.findMany({
      where: {
        employeeId: employee.id,
      },
      orderBy: {
        effectiveFrom: 'desc',
      },
      take: 20,
    });

    return increments;
  }

  /**
   * Get attendance statistics for the employee
   */
  async getAttendanceStatistics(userId: string) {
    const employee = await this.prisma.employee.findFirst({
      where: { userId, deletedAt: null },
    });

    if (!employee) {
      throw new NotFoundException('Employee profile not found');
    }

    // Get current month stats
    const now = new Date();
    const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
    const endOfMonth = new Date(now.getFullYear(), now.getMonth() + 1, 0);

    const [present, absent, late, onLeave, total] = await Promise.all([
      this.prisma.employeeAttendance.count({
        where: {
          employeeId: employee.id,
          date: { gte: startOfMonth, lte: endOfMonth },
          status: AttendanceStatus.PRESENT,
        },
      }),
      this.prisma.employeeAttendance.count({
        where: {
          employeeId: employee.id,
          date: { gte: startOfMonth, lte: endOfMonth },
          status: AttendanceStatus.ABSENT,
        },
      }),
      this.prisma.employeeAttendance.count({
        where: {
          employeeId: employee.id,
          date: { gte: startOfMonth, lte: endOfMonth },
          status: AttendanceStatus.LATE,
        },
      }),
      this.prisma.employeeAttendance.count({
        where: {
          employeeId: employee.id,
          date: { gte: startOfMonth, lte: endOfMonth },
          status: AttendanceStatus.ON_LEAVE,
        },
      }),
      this.prisma.employeeAttendance.count({
        where: {
          employeeId: employee.id,
          date: { gte: startOfMonth, lte: endOfMonth },
        },
      }),
    ]);

    return {
      month: now.getMonth() + 1,
      year: now.getFullYear(),
      present,
      absent,
      late,
      onLeave,
      total,
      workingDays: endOfMonth.getDate(),
    };
  }

  /**
   * Helper: Get start of day (midnight)
   */
  private getStartOfDay(date?: string) {
    const d = date ? new Date(date) : new Date();
    return new Date(d.getFullYear(), d.getMonth(), d.getDate());
  }
}
