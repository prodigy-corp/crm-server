import {
  Injectable,
  NotFoundException,
  ConflictException,
} from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import { CreateShiftDto, UpdateShiftDto } from '../dto/shift.dto';
import { Prisma } from '@prisma/client';

@Injectable()
export class ShiftService {
  constructor(private readonly prisma: PrismaService) {}

  async create(createShiftDto: CreateShiftDto) {
    try {
      const { schedules, ...shiftData } = createShiftDto;

      const shift = await this.prisma.shift.create({
        data: {
          ...shiftData,
          schedules: schedules
            ? {
                create: schedules.map((schedule) => ({
                  dayOfWeek: schedule.dayOfWeek,
                  startTime: schedule.startTime,
                  endTime: schedule.endTime,
                  isOffDay: schedule.isOffDay,
                  isHalfDay: schedule.isHalfDay,
                })),
              }
            : undefined,
        },
        include: {
          schedules: {
            orderBy: {
              dayOfWeek: 'asc',
            },
          },
          _count: {
            select: {
              employees: true,
              departments: true,
            },
          },
        },
      });

      return {
        success: true,
        message: 'Shift created successfully',
        data: shift,
      };
    } catch (error) {
      if (error instanceof Prisma.PrismaClientKnownRequestError) {
        if (error.code === 'P2002') {
          throw new ConflictException('Shift with this name already exists');
        }
      }
      throw error;
    }
  }

  async findAll() {
    const shifts = await this.prisma.shift.findMany({
      include: {
        schedules: {
          orderBy: {
            dayOfWeek: 'asc',
          },
        },
        _count: {
          select: {
            employees: true,
            departments: true,
          },
        },
      },
      orderBy: {
        createdAt: 'desc',
      },
    });

    return {
      success: true,
      data: shifts,
    };
  }

  async findOne(id: string) {
    const shift = await this.prisma.shift.findUnique({
      where: { id },
      include: {
        schedules: {
          orderBy: {
            dayOfWeek: 'asc',
          },
        },
        employees: {
          select: {
            id: true,
            name: true,
            designation: true,
            status: true,
          },
        },
        departments: {
          select: {
            id: true,
            name: true,
          },
        },
      },
    });

    if (!shift) {
      throw new NotFoundException('Shift not found');
    }

    return {
      success: true,
      data: shift,
    };
  }

  async update(id: string, updateShiftDto: UpdateShiftDto) {
    await this.findOne(id);

    try {
      const { schedules, ...shiftData } = updateShiftDto;

      // Update shift and handle schedules separately if provided
      const shift = await this.prisma.shift.update({
        where: { id },
        data: shiftData,
        include: {
          schedules: {
            orderBy: {
              dayOfWeek: 'asc',
            },
          },
          _count: {
            select: {
              employees: true,
              departments: true,
            },
          },
        },
      });

      // If schedules are provided, update them
      if (schedules) {
        // Delete existing schedules and recreate
        await this.prisma.shiftSchedule.deleteMany({
          where: { shiftId: id },
        });

        await this.prisma.shiftSchedule.createMany({
          data: schedules.map((schedule) => ({
            shiftId: id,
            dayOfWeek: schedule.dayOfWeek,
            startTime: schedule.startTime,
            endTime: schedule.endTime,
            isOffDay: schedule.isOffDay,
            isHalfDay: schedule.isHalfDay,
          })),
        });

        // Fetch updated shift with new schedules
        const updatedShift = await this.prisma.shift.findUnique({
          where: { id },
          include: {
            schedules: {
              orderBy: {
                dayOfWeek: 'asc',
              },
            },
            _count: {
              select: {
                employees: true,
                departments: true,
              },
            },
          },
        });

        return {
          success: true,
          message: 'Shift updated successfully',
          data: updatedShift,
        };
      }

      return {
        success: true,
        message: 'Shift updated successfully',
        data: shift,
      };
    } catch (error) {
      if (error instanceof Prisma.PrismaClientKnownRequestError) {
        if (error.code === 'P2002') {
          throw new ConflictException('Shift with this name already exists');
        }
      }
      throw error;
    }
  }

  async remove(id: string) {
    await this.findOne(id);

    // Check if shift is assigned to employees or departments
    const employeeCount = await this.prisma.employee.count({
      where: { shiftId: id },
    });

    const departmentCount = await this.prisma.department.count({
      where: { defaultShiftId: id },
    });

    if (employeeCount > 0 || departmentCount > 0) {
      throw new ConflictException(
        `Cannot delete shift assigned to ${employeeCount} employees and ${departmentCount} departments. Please reassign them first.`,
      );
    }

    await this.prisma.shift.delete({
      where: { id },
    });

    return {
      success: true,
      message: 'Shift deleted successfully',
    };
  }

  /**
   * Get effective shift for an employee (considers employee's shift or department's default shift)
   */
  async getEffectiveShiftForEmployee(employeeId: string) {
    const employee = await this.prisma.employee.findUnique({
      where: { id: employeeId },
      include: {
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

    if (!employee) {
      throw new NotFoundException('Employee not found');
    }

    // Return employee's shift if assigned, otherwise department's default shift
    return employee.shift || employee.department?.defaultShift || null;
  }

  /**
   * Get schedule for a specific day
   */
  getScheduleForDay(shift: any, dayOfWeek: number) {
    if (!shift) return null;

    const schedule = shift.schedules?.find(
      (s: any) => s.dayOfWeek === dayOfWeek,
    );

    return {
      startTime: schedule?.startTime || shift.startTime,
      endTime: schedule?.endTime || shift.endTime,
      isOffDay: schedule?.isOffDay || false,
      isHalfDay: schedule?.isHalfDay || false,
      lateToleranceMinutes: shift.lateToleranceMinutes,
      earlyDepartureToleranceMinutes: shift.earlyDepartureToleranceMinutes,
    };
  }
}
