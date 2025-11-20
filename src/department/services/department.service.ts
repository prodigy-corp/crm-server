import {
  Injectable,
  NotFoundException,
  ConflictException,
} from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import {
  CreateDepartmentDto,
  UpdateDepartmentDto,
} from '../dto/department.dto';
import { Prisma } from '@prisma/client';

@Injectable()
export class DepartmentService {
  constructor(private readonly prisma: PrismaService) {}

  async create(createDepartmentDto: CreateDepartmentDto) {
    try {
      const department = await this.prisma.department.create({
        data: {
          name: createDepartmentDto.name,
          description: createDepartmentDto.description,
          defaultShiftId: createDepartmentDto.defaultShiftId,
        },
        include: {
          defaultShift: true,
          _count: {
            select: { employees: true },
          },
        },
      });

      return {
        success: true,
        message: 'Department created successfully',
        data: department,
      };
    } catch (error) {
      if (error instanceof Prisma.PrismaClientKnownRequestError) {
        if (error.code === 'P2002') {
          throw new ConflictException(
            'Department with this name already exists',
          );
        }
      }
      throw error;
    }
  }

  async findAll() {
    const departments = await this.prisma.department.findMany({
      include: {
        defaultShift: true,
        _count: {
          select: { employees: true },
        },
      },
      orderBy: {
        createdAt: 'desc',
      },
    });

    return {
      success: true,
      data: departments,
    };
  }

  async findOne(id: string) {
    const department = await this.prisma.department.findUnique({
      where: { id },
      include: {
        defaultShift: {
          include: {
            schedules: {
              orderBy: {
                dayOfWeek: 'asc',
              },
            },
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
      },
    });

    if (!department) {
      throw new NotFoundException('Department not found');
    }

    return {
      success: true,
      data: department,
    };
  }

  async update(id: string, updateDepartmentDto: UpdateDepartmentDto) {
    await this.findOne(id);

    try {
      const department = await this.prisma.department.update({
        where: { id },
        data: {
          name: updateDepartmentDto.name,
          description: updateDepartmentDto.description,
          defaultShiftId: updateDepartmentDto.defaultShiftId,
        },
        include: {
          defaultShift: true,
          _count: {
            select: { employees: true },
          },
        },
      });

      return {
        success: true,
        message: 'Department updated successfully',
        data: department,
      };
    } catch (error) {
      if (error instanceof Prisma.PrismaClientKnownRequestError) {
        if (error.code === 'P2002') {
          throw new ConflictException(
            'Department with this name already exists',
          );
        }
      }
      throw error;
    }
  }

  async remove(id: string) {
    await this.findOne(id);

    // Check if department has employees
    const employeeCount = await this.prisma.employee.count({
      where: { departmentId: id },
    });

    if (employeeCount > 0) {
      throw new ConflictException(
        `Cannot delete department with ${employeeCount} active employees. Please reassign them first.`,
      );
    }

    await this.prisma.department.delete({
      where: { id },
    });

    return {
      success: true,
      message: 'Department deleted successfully',
    };
  }
}
