import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { ProductivityFilterDto } from '../analytics/dto/productivity-filter.dto';
import { TaskStatus } from '@prisma/client';

@Injectable()
export class ProductivityService {
  constructor(private prisma: PrismaService) {}

  async getEmployeeProductivity(filter: ProductivityFilterDto) {
    const { employeeId, startDate, endDate } = filter;

    const where: any = {
      deletedAt: null,
    };

    if (employeeId) {
      where.assigneeId = employeeId;
    }

    if (startDate || endDate) {
      where.createdAt = {};
      if (startDate) where.createdAt.gte = new Date(startDate);
      if (endDate) where.createdAt.lte = new Date(endDate);
    }

    const tasks = await this.prisma.task.findMany({
      where,
      select: {
        status: true,
        dueDate: true,
        updatedAt: true,
      },
    });

    const totalTasks = tasks.length;
    const completedTasks = tasks.filter(
      (t) => t.status === TaskStatus.COMPLETED,
    ).length;
    const inProgressTasks = tasks.filter(
      (t) => t.status === TaskStatus.IN_PROGRESS,
    ).length;
    const todoTasks = tasks.filter((t) => t.status === TaskStatus.TODO).length;

    const onTimeCompletion = tasks.filter((t) => {
      return (
        t.status === TaskStatus.COMPLETED &&
        t.dueDate &&
        new Date(t.updatedAt) <= new Date(t.dueDate)
      );
    }).length;

    const overdueTasks = tasks.filter((t) => {
      return (
        t.status !== TaskStatus.COMPLETED &&
        t.dueDate &&
        new Date() > new Date(t.dueDate)
      );
    }).length;

    const completionRate =
      totalTasks > 0 ? (completedTasks / totalTasks) * 100 : 0;
    const efficiencyRate =
      totalTasks > 0 ? (onTimeCompletion / totalTasks) * 100 : 0;

    return {
      totalTasks,
      completedTasks,
      inProgressTasks,
      todoTasks,
      onTimeCompletion,
      overdueTasks,
      completionRate: Math.round(completionRate * 100) / 100,
      efficiencyRate: Math.round(efficiencyRate * 100) / 100,
    };
  }

  async getGlobalProductivity() {
    // Get stats for all employees
    const employees = await this.prisma.employee.findMany({
      where: { status: 'ACTIVE', deletedAt: null },
      select: {
        id: true,
        name: true,
        photoUrl: true,
      },
    });

    const productivityData = await Promise.all(
      employees.map(async (emp) => {
        const stats = await this.getEmployeeProductivity({
          employeeId: emp.id,
        });
        return {
          employeeId: emp.id,
          name: emp.name,
          photoUrl: emp.photoUrl,
          ...stats,
        };
      }),
    );

    return productivityData;
  }
}
