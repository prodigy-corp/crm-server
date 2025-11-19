import { Injectable, Logger } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import { AdminAttendanceQueryDto } from '../dto/admin-attendance.dto';
import { Prisma } from '@prisma/client';

@Injectable()
export class AdminAttendanceService {
  private readonly logger = new Logger(AdminAttendanceService.name);

  constructor(private readonly prisma: PrismaService) {}

  async getAllAttendance(query: AdminAttendanceQueryDto) {
    const {
      page = 1,
      limit = 10,
      search,
      status,
      date,
      fromDate,
      toDate,
    } = query;

    const pageNum = Number(page) || 1;
    const limitNum = Number(limit) || 10;
    const skip = (pageNum - 1) * limitNum;

    const where: Prisma.EmployeeAttendanceWhereInput = {};

    if (search) {
      where.employee = {
        OR: [
          { name: { contains: search, mode: 'insensitive' } },
          { employeeCode: { contains: search, mode: 'insensitive' } },
        ],
      };
    }

    if (status) {
      where.status = status;
    }

    if (date) {
      const searchDate = new Date(date);
      const nextDate = new Date(searchDate);
      nextDate.setDate(nextDate.getDate() + 1);

      where.date = {
        gte: searchDate,
        lt: nextDate,
      };
    } else if (fromDate || toDate) {
      where.date = {};
      if (fromDate) {
        where.date.gte = new Date(fromDate);
      }
      if (toDate) {
        // If toDate is provided, we want to include that day, so we check < toDate + 1 day
        // OR we assume the client sends the correct range.
        // Let's assume standard inclusive date filtering if it's a date string 'YYYY-MM-DD'
        const end = new Date(toDate);
        end.setHours(23, 59, 59, 999);
        where.date.lte = end;
      }
    }

    const [data, total] = await this.prisma.$transaction([
      this.prisma.employeeAttendance.findMany({
        where,
        skip,
        take: limitNum,
        orderBy: {
          date: 'desc',
        },
        include: {
          employee: {
            select: {
              id: true,
              name: true,
              employeeCode: true,
              designation: true,
            },
          },
        },
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
}
