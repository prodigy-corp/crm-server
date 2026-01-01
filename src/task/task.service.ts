import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateTaskDto } from './dto/create-task.dto';
import { UpdateTaskDto } from './dto/update-task.dto';

@Injectable()
export class TaskService {
  constructor(private prisma: PrismaService) {}

  async create(createTaskDto: CreateTaskDto) {
    return this.prisma.task.create({
      data: createTaskDto,
      include: {
        project: true,
        assignee: true,
        creator: true,
      },
    });
  }

  async findAll(filters: any = {}, user?: any) {
    const where: any = {
      ...filters,
      deletedAt: null,
    };

    // Permission-based filtering
    if (
      user &&
      !user.roles.includes('SUPER_ADMIN') &&
      !user.roles.includes('ADMIN')
    ) {
      if (user.roles.includes('CLIENT')) {
        where.project = { clientId: user.clientId };
      } else if (user.roles.includes('EMPLOYEE')) {
        where.OR = [
          { assigneeId: user.employeeId },
          { creatorId: user.userId || user.id },
        ];
      }
    }

    return this.prisma.task.findMany({
      where,
      include: {
        project: true,
        assignee: true,
        creator: true,
      },
    });
  }

  async findOne(id: string) {
    const task = await this.prisma.task.findUnique({
      where: { id, deletedAt: null },
      include: {
        project: true,
        assignee: true,
        creator: true,
      },
    });

    if (!task) {
      throw new NotFoundException(`Task with ID ${id} not found`);
    }

    return task;
  }

  async update(id: string, updateTaskDto: UpdateTaskDto) {
    await this.findOne(id);
    return this.prisma.task.update({
      where: { id },
      data: updateTaskDto,
      include: {
        project: true,
        assignee: true,
        creator: true,
      },
    });
  }

  async remove(id: string) {
    await this.findOne(id);
    return this.prisma.task.update({
      where: { id },
      data: { deletedAt: new Date() },
    });
  }

  // Comments & Collaboration
  async addComment(taskId: string, userId: string, content: string) {
    await this.findOne(taskId);
    return this.prisma.taskComment.create({
      data: {
        taskId,
        userId,
        content,
      },
      include: {
        user: {
          select: {
            id: true,
            name: true,
            avatar: true,
          },
        },
      },
    });
  }

  async getComments(taskId: string) {
    await this.findOne(taskId);
    return this.prisma.taskComment.findMany({
      where: { taskId, deletedAt: null },
      include: {
        user: {
          select: {
            id: true,
            name: true,
            avatar: true,
          },
        },
      },
      orderBy: { createdAt: 'desc' },
    });
  }

  // Time Tracking
  async addTimeLog(
    taskId: string,
    userId: string,
    hours: number,
    description?: string,
    logDate?: Date,
  ) {
    await this.findOne(taskId);
    return this.prisma.taskTimeLog.create({
      data: {
        taskId,
        userId,
        hours,
        description,
        logDate: logDate || new Date(),
      },
      include: {
        user: {
          select: {
            id: true,
            name: true,
          },
        },
      },
    });
  }

  async getTimeLogs(taskId: string) {
    await this.findOne(taskId);
    return this.prisma.taskTimeLog.findMany({
      where: { taskId },
      include: {
        user: {
          select: {
            id: true,
            name: true,
          },
        },
      },
      orderBy: { logDate: 'desc' },
    });
  }

  async getTaskAnalytics(filters: any = {}) {
    const totalTasks = await this.prisma.task.count({
      where: { ...filters, deletedAt: null },
    });
    const completedTasks = await this.prisma.task.count({
      where: { ...filters, status: 'COMPLETED', deletedAt: null },
    });
    const todoTasks = await this.prisma.task.count({
      where: { ...filters, status: 'TODO', deletedAt: null },
    });
    const inProgressTasks = await this.prisma.task.count({
      where: { ...filters, status: 'IN_PROGRESS', deletedAt: null },
    });

    const priorityBreakdown = await this.prisma.task.groupBy({
      by: ['priority'],
      where: { ...filters, deletedAt: null },
      _count: true,
    });

    return {
      totalTasks,
      completedTasks,
      todoTasks,
      inProgressTasks,
      priorityBreakdown,
      completionRate:
        totalTasks > 0 ? Math.round((completedTasks / totalTasks) * 100) : 0,
    };
  }
}
