import {
  BadRequestException,
  Injectable,
  Logger,
  NotFoundException,
} from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import { UploadService } from 'src/upload/upload.service';
import {
  AdminEmployeeQueryDto,
  CreateAdminEmployeeDto,
  CreateEmployeeSalaryIncrementDto,
  CreateEmployeeSalaryPaymentDto,
  EmployeeAttendanceActionDto,
  EmployeeAttendanceQueryDto,
  EmployeeSalaryPaymentQueryDto,
  ResignEmployeeDto,
  UpsertEmployeeAttendanceDto,
  UpdateAdminEmployeeDto,
} from '../dto/admin-employee.dto';
import {
  AttendanceStatus,
  EmployeeStatus,
  SalaryPaymentStatus,
} from '@prisma/client';

@Injectable()
export class AdminEmployeeService {
  private readonly logger = new Logger(AdminEmployeeService.name);

  constructor(
    private readonly prisma: PrismaService,
    private readonly uploadService: UploadService,
  ) {}

  async getAllEmployees(query: AdminEmployeeQueryDto) {
    const {
      page = 1,
      limit = 10,
      search,
      status,
      sortBy = 'createdAt',
      sortOrder = 'desc',
    } = query;

    const pageNum = Number(page) || 1;
    const limitNum = Number(limit) || 10;
    const skip = (pageNum - 1) * limitNum;

    const where: any = {
      deletedAt: null,
    };

    if (search) {
      where.OR = [
        { name: { contains: search, mode: 'insensitive' } },
        { emailAddress: { contains: search, mode: 'insensitive' } },
        { mobileNumber: { contains: search, mode: 'insensitive' } },
        { employeeCode: { contains: search, mode: 'insensitive' } },
      ];
    }

    if (status) {
      where.status = status;
    }

    // ✅ FIX: Only include employees whose linked users have the 'employee' role
    // This ensures we only show actual employees, not all user records
    where.user = {
      roles: {
        some: {
          role: {
            name: 'employee',
          },
        },
      },
    };

    const [data, total] = await this.prisma.$transaction([
      this.prisma.employee.findMany({
        where,
        skip,
        take: limitNum,
        orderBy: { [sortBy]: sortOrder },
        select: {
          id: true,
          employeeCode: true,
          name: true,
          designation: true,
          mobileNumber: true,
          emailAddress: true,
          joiningDate: true,
          resignDate: true,
          status: true,
          baseSalary: true,
          createdAt: true,
          // Include user info to verify role
          user: {
            select: {
              id: true,
              email: true,
              name: true,
              status: true,
            },
          },
        },
      }),
      this.prisma.employee.count({ where }),
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

  async getEmployeeById(id: string) {
    const employee = await this.prisma.employee.findFirst({
      where: { id, deletedAt: null },
      include: {
        user: {
          select: {
            id: true,
            email: true,
            name: true,
            status: true,
          },
        },
        attendanceRecords: {
          orderBy: { date: 'desc' },
          take: 30,
        },
        salaryIncrements: {
          orderBy: { effectiveFrom: 'desc' },
          take: 10,
        },
        salaryPayments: {
          orderBy: [{ year: 'desc' }, { month: 'desc' }],
          take: 12,
        },
      },
    });

    if (!employee) {
      throw new NotFoundException('Employee not found');
    }

    return employee;
  }

  async createEmployee(dto: CreateAdminEmployeeDto) {
    console.log(dto);

    // ✅ FIX: If userId is provided, verify/assign employee role
    if (dto.userId) {
      const user = await this.prisma.user.findUnique({
        where: { id: dto.userId },
        include: {
          roles: {
            include: {
              role: true,
            },
          },
        },
      });

      if (!user) {
        throw new NotFoundException('User not found');
      }

      // Check if user already linked to another employee
      const existingEmployee = await this.prisma.employee.findFirst({
        where: {
          userId: dto.userId,
          deletedAt: null,
        },
      });

      if (existingEmployee) {
        throw new BadRequestException(
          'This user is already linked to another employee',
        );
      }

      // Check if user has employee role
      const hasEmployeeRole = user.roles.some(
        (ur) => ur.role.name === 'employee',
      );

      // If user doesn't have employee role, auto-assign it
      if (!hasEmployeeRole) {
        this.logger.warn(
          `User ${dto.userId} doesn't have employee role. Auto-assigning...`,
        );

        const employeeRole = await this.prisma.role.findUnique({
          where: { name: 'employee' },
        });

        if (!employeeRole) {
          throw new BadRequestException(
            'Employee role not found in system. Please contact administrator.',
          );
        }

        await this.prisma.userRole.create({
          data: {
            userId: dto.userId,
            roleId: employeeRole.id,
          },
        });

        this.logger.log(`Assigned employee role to user ${dto.userId}`);
      }
    }

    const employee = await this.prisma.employee.create({
      data: {
        userId: dto.userId,
        employeeCode: dto.employeeCode,
        name: dto.name,
        designation: dto.designation,
        fatherName: dto.fatherName,
        motherName: dto.motherName,
        dateOfBirth: dto.dateOfBirth ? new Date(dto.dateOfBirth) : null,
        nationalId: dto.nationalId,
        bloodGroup: dto.bloodGroup,
        joiningDate: new Date(dto.joiningDate),
        baseSalary: dto.baseSalary,
        mobileNumber: dto.mobileNumber,
        alternativeContactNumber: dto.alternativeContactNumber,
        corporateContactNumber: dto.corporateContactNumber,
        emailAddress: dto.emailAddress,
        facebookProfileLink: dto.facebookProfileLink,
        bankAccountNumber: dto.bankAccountNumber,
        branchName: dto.branchName,
        bankName: dto.bankName,
        fatherContactNumber: dto.fatherContactNumber,
        motherContactNumber: dto.motherContactNumber,
        emergencyContactNumber: dto.emergencyContactNumber,
        sscRoll: dto.sscRoll,
        sscRegistrationNumber: dto.sscRegistrationNumber,
        sscPassingYear: dto.sscPassingYear,
        sscBoard: dto.sscBoard,
        sscResult: dto.sscResult,
        hscRoll: dto.hscRoll,
        hscRegistrationNumber: dto.hscRegistrationNumber,
        hscPassingYear: dto.hscPassingYear,
        hscBoard: dto.hscBoard,
        hscResult: dto.hscResult,
        honorsRoll: dto.honorsRoll,
        honorsRegistrationNumber: dto.honorsRegistrationNumber,
        honorsPassingYear: dto.honorsPassingYear,
        honorsInstitutionName: dto.honorsInstitutionName,
        honorsSubject: dto.honorsSubject,
        honorsResult: dto.honorsResult,
        status: dto.status ?? EmployeeStatus.ACTIVE,
      },
    });

    this.logger.log(`Created employee with id: ${employee.id}`);
    return employee;
  }

  async updateEmployee(id: string, dto: UpdateAdminEmployeeDto) {
    const existing = await this.prisma.employee.findFirst({
      where: { id, deletedAt: null },
    });

    if (!existing) {
      throw new NotFoundException('Employee not found');
    }

    if (dto.userId) {
      const user = await this.prisma.user.findUnique({
        where: { id: dto.userId },
        include: {
          roles: {
            include: {
              role: true,
            },
          },
        },
      });

      if (!user) {
        throw new NotFoundException('User not found');
      }

      // ✅ FIX: Check if user has employee role
      const hasEmployeeRole = user.roles.some(
        (ur) => ur.role.name === 'employee',
      );

      // If user doesn't have employee role, auto-assign it
      if (!hasEmployeeRole) {
        this.logger.warn(
          `User ${dto.userId} doesn't have employee role. Auto-assigning...`,
        );

        const employeeRole = await this.prisma.role.findUnique({
          where: { name: 'employee' },
        });

        if (!employeeRole) {
          throw new BadRequestException(
            'Employee role not found in system. Please contact administrator.',
          );
        }

        await this.prisma.userRole.create({
          data: {
            userId: dto.userId,
            roleId: employeeRole.id,
          },
        });

        this.logger.log(`Assigned employee role to user ${dto.userId}`);
      }

      const linkedEmployee = await this.prisma.employee.findFirst({
        where: {
          userId: dto.userId,
          id: { not: id },
          deletedAt: null,
        },
      });

      if (linkedEmployee) {
        throw new BadRequestException(
          'This user is already linked to another employee',
        );
      }
    }

    const data: any = { ...dto };

    if (dto.dateOfBirth) {
      data.dateOfBirth = new Date(dto.dateOfBirth);
    }

    if (dto.joiningDate) {
      data.joiningDate = new Date(dto.joiningDate);
    }

    if (dto.resignDate) {
      data.resignDate = new Date(dto.resignDate);
    }

    const updated = await this.prisma.employee.update({
      where: { id },
      data,
    });

    this.logger.log(`Updated employee with id: ${id}`);
    return updated;
  }

  async deleteEmployee(id: string) {
    const existing = await this.prisma.employee.findFirst({
      where: { id, deletedAt: null },
    });

    if (!existing) {
      throw new NotFoundException('Employee not found');
    }

    await this.prisma.employee.update({
      where: { id },
      data: {
        deletedAt: new Date(),
        status: EmployeeStatus.INACTIVE,
      },
    });

    this.logger.log(`Soft deleted employee with id: ${id}`);
    return { message: 'Employee deleted successfully' };
  }

  async resignEmployee(id: string, dto: ResignEmployeeDto) {
    const existing = await this.prisma.employee.findFirst({
      where: { id, deletedAt: null },
    });

    if (!existing) {
      throw new NotFoundException('Employee not found');
    }

    const resignDate = dto.resignDate ? new Date(dto.resignDate) : new Date();

    const updated = await this.prisma.employee.update({
      where: { id },
      data: {
        resignDate,
        status: EmployeeStatus.RESIGNED,
      },
    });

    this.logger.log(`Employee resigned with id: ${id}`);
    return updated;
  }

  async updateEmployeePhoto(id: string, file: Express.Multer.File) {
    const employee = await this.prisma.employee.findFirst({
      where: { id, deletedAt: null },
    });

    if (!employee) {
      throw new NotFoundException('Employee not found');
    }

    const uploadResult = await this.uploadService.uploadFile(file, 'employees');
    const photoKey = uploadResult.Key as string;

    if (employee.photoUrl) {
      await this.uploadService.deleteFile(employee.photoUrl);
    }

    const updated = await this.prisma.employee.update({
      where: { id },
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

  async getAttendance(employeeId: string, query: EmployeeAttendanceQueryDto) {
    const employee = await this.prisma.employee.findFirst({
      where: { id: employeeId, deletedAt: null },
    });

    if (!employee) {
      throw new NotFoundException('Employee not found');
    }

    const { page = 1, limit = 10, fromDate, toDate, status } = query;

    const pageNum = Number(page) || 1;
    const limitNum = Number(limit) || 10;
    const skip = (pageNum - 1) * limitNum;

    const where: any = {
      employeeId,
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

  private getStartOfDay(date?: string) {
    const d = date ? new Date(date) : new Date();
    return new Date(d.getFullYear(), d.getMonth(), d.getDate());
  }

  async checkIn(employeeId: string, dto: EmployeeAttendanceActionDto) {
    const employee = await this.prisma.employee.findFirst({
      where: { id: employeeId, deletedAt: null },
    });

    if (!employee) {
      throw new NotFoundException('Employee not found');
    }

    const attendanceDate = this.getStartOfDay(dto.date);

    const existing = await this.prisma.employeeAttendance.findUnique({
      where: {
        employeeId_date: {
          employeeId,
          date: attendanceDate,
        },
      },
    });

    if (existing && existing.checkInAt) {
      throw new BadRequestException('Employee already checked in for this day');
    }

    const now = new Date();

    const attendance = await this.prisma.employeeAttendance.upsert({
      where: {
        employeeId_date: {
          employeeId,
          date: attendanceDate,
        },
      },
      update: {
        checkInAt: now,
        status: AttendanceStatus.PRESENT,
      },
      create: {
        employeeId,
        date: attendanceDate,
        checkInAt: now,
        status: AttendanceStatus.PRESENT,
      },
    });

    return attendance;
  }

  async checkOut(employeeId: string, dto: EmployeeAttendanceActionDto) {
    const employee = await this.prisma.employee.findFirst({
      where: { id: employeeId, deletedAt: null },
    });

    if (!employee) {
      throw new NotFoundException('Employee not found');
    }

    const attendanceDate = this.getStartOfDay(dto.date);

    const existing = await this.prisma.employeeAttendance.findUnique({
      where: {
        employeeId_date: {
          employeeId,
          date: attendanceDate,
        },
      },
    });

    if (!existing || !existing.checkInAt) {
      throw new BadRequestException('Employee has not checked in for this day');
    }

    if (existing.checkOutAt) {
      throw new BadRequestException(
        'Employee already checked out for this day',
      );
    }

    const now = new Date();
    const workingHours =
      (now.getTime() - existing.checkInAt.getTime()) / (1000 * 60 * 60);

    const updated = await this.prisma.employeeAttendance.update({
      where: {
        employeeId_date: {
          employeeId,
          date: attendanceDate,
        },
      },
      data: {
        checkOutAt: now,
        workingHours: Number(workingHours.toFixed(2)),
      },
    });

    return updated;
  }

  async upsertAttendance(employeeId: string, dto: UpsertEmployeeAttendanceDto) {
    const employee = await this.prisma.employee.findFirst({
      where: { id: employeeId, deletedAt: null },
    });

    if (!employee) {
      throw new NotFoundException('Employee not found');
    }

    const attendanceDate = this.getStartOfDay(dto.date);

    const checkInAt = dto.checkInAt ? new Date(dto.checkInAt) : null;
    const checkOutAt = dto.checkOutAt ? new Date(dto.checkOutAt) : null;

    let workingHours: number | undefined = dto.workingHours;

    if (workingHours === undefined && checkInAt && checkOutAt) {
      const diffHours =
        (checkOutAt.getTime() - checkInAt.getTime()) / (1000 * 60 * 60);
      workingHours = Number(diffHours.toFixed(2));
    }

    const attendance = await this.prisma.employeeAttendance.upsert({
      where: {
        employeeId_date: {
          employeeId,
          date: attendanceDate,
        },
      },
      update: {
        status: dto.status,
        checkInAt,
        checkOutAt,
        workingHours: workingHours ?? null,
      },
      create: {
        employeeId,
        date: attendanceDate,
        status: dto.status,
        checkInAt,
        checkOutAt,
        workingHours: workingHours ?? null,
      },
    });

    this.logger.log(
      `Upserted attendance for employee id: ${employeeId} on ${attendanceDate.toISOString()}`,
    );

    return attendance;
  }

  async createSalaryIncrement(
    employeeId: string,
    dto: CreateEmployeeSalaryIncrementDto,
    approvedById?: string,
  ) {
    const employee = await this.prisma.employee.findFirst({
      where: { id: employeeId, deletedAt: null },
    });

    if (!employee) {
      throw new NotFoundException('Employee not found');
    }

    const previousSalary = Number(employee.baseSalary);
    const newSalary = dto.newSalary;

    if (newSalary <= 0) {
      throw new BadRequestException('New salary must be greater than zero');
    }

    const incrementAmount = newSalary - previousSalary;

    const increment = await this.prisma.employeeSalaryIncrement.create({
      data: {
        employeeId,
        previousSalary,
        newSalary,
        incrementAmount,
        effectiveFrom: new Date(dto.effectiveFrom),
        reason: dto.reason,
        approvedById,
      },
    });

    await this.prisma.employee.update({
      where: { id: employeeId },
      data: {
        baseSalary: newSalary,
      },
    });

    this.logger.log(`Created salary increment for employee id: ${employeeId}`);
    return increment;
  }

  async getSalaryPayments(
    employeeId: string,
    query: EmployeeSalaryPaymentQueryDto,
  ) {
    const employee = await this.prisma.employee.findFirst({
      where: { id: employeeId, deletedAt: null },
    });

    if (!employee) {
      throw new NotFoundException('Employee not found');
    }

    const { page = 1, limit = 10, month, year, status } = query;

    const pageNum = Number(page) || 1;
    const limitNum = Number(limit) || 10;
    const skip = (pageNum - 1) * limitNum;

    const where: any = {
      employeeId,
    };

    if (month) {
      where.month = month;
    }

    if (year) {
      where.year = year;
    }

    if (status) {
      where.status = status;
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

  async createSalaryPayment(
    employeeId: string,
    dto: CreateEmployeeSalaryPaymentDto,
  ) {
    const employee = await this.prisma.employee.findFirst({
      where: { id: employeeId, deletedAt: null },
    });

    if (!employee) {
      throw new NotFoundException('Employee not found');
    }

    const existing = await this.prisma.employeeSalaryPayment.findUnique({
      where: {
        employeeId_month_year: {
          employeeId,
          month: dto.month,
          year: dto.year,
        },
      },
    });

    if (existing) {
      throw new BadRequestException(
        'Salary payment already exists for this month and year',
      );
    }

    const payment = await this.prisma.employeeSalaryPayment.create({
      data: {
        employeeId,
        month: dto.month,
        year: dto.year,
        basicSalary: dto.basicSalary,
        grossSalary: dto.grossSalary,
        totalDeduction: dto.totalDeduction,
        netPayable: dto.netPayable,
        paymentDate: dto.paymentDate ? new Date(dto.paymentDate) : null,
        status: dto.status ?? SalaryPaymentStatus.PENDING,
      },
    });

    this.logger.log(`Created salary payment for employee id: ${employeeId}`);
    return payment;
  }
}
