import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateProjectDto } from './dto/create-project.dto';
import { UpdateProjectDto } from './dto/update-project.dto';

@Injectable()
export class ProjectService {
  constructor(private prisma: PrismaService) {}

  async create(createProjectDto: CreateProjectDto) {
    return this.prisma.project.create({
      data: createProjectDto,
      include: {
        manager: true,
        client: true,
      },
    });
  }

  async findAll(user?: any) {
    const where: any = { deletedAt: null };

    // Permission-based filtering
    if (
      user &&
      !user.roles.includes('SUPER_ADMIN') &&
      !user.roles.includes('ADMIN')
    ) {
      if (user.roles.includes('CLIENT')) {
        where.clientId = user.clientId;
      } else if (user.roles.includes('EMPLOYEE')) {
        // Employees see projects where they are managers OR projects that have tasks assigned to them
        where.OR = [
          { managerId: user.employeeId },
          { tasks: { some: { assigneeId: user.employeeId } } },
        ];
      }
    }

    return this.prisma.project.findMany({
      where,
      include: {
        manager: true,
        client: true,
        _count: {
          select: { tasks: true },
        },
      },
    });
  }

  async findOne(id: string) {
    const project = await this.prisma.project.findUnique({
      where: { id, deletedAt: null },
      include: {
        manager: true,
        client: true,
        tasks: {
          include: {
            assignee: true,
          },
        },
      },
    });

    if (!project) {
      throw new NotFoundException(`Project with ID ${id} not found`);
    }

    return project;
  }

  async update(id: string, updateProjectDto: UpdateProjectDto) {
    await this.findOne(id);
    return this.prisma.project.update({
      where: { id },
      data: updateProjectDto,
      include: {
        manager: true,
        client: true,
      },
    });
  }

  async remove(id: string) {
    await this.findOne(id);
    return this.prisma.project.update({
      where: { id },
      data: { deletedAt: new Date() },
    });
  }

  // Analytics & Additional Features
  async getDashboardStats() {
    const totalProjects = await this.prisma.project.count({
      where: { deletedAt: null },
    });
    const activeProjects = await this.prisma.project.count({
      where: {
        status: 'IN_PROGRESS',
        deletedAt: null,
      },
    });
    const completedProjects = await this.prisma.project.count({
      where: {
        status: 'COMPLETED',
        deletedAt: null,
      },
    });

    const statusBreakdown = await this.prisma.project.groupBy({
      by: ['status'],
      where: { deletedAt: null },
      _count: true,
    });

    return {
      totalProjects,
      activeProjects,
      completedProjects,
      statusBreakdown,
    };
  }

  async getProjectAnalytics(id: string) {
    const project = await this.findOne(id);
    const totalTasks = await this.prisma.task.count({
      where: { projectId: id, deletedAt: null },
    });
    const completedTasks = await this.prisma.task.count({
      where: { projectId: id, status: 'COMPLETED', deletedAt: null },
    });

    const taskStatusBreakdown = await this.prisma.task.groupBy({
      by: ['status'],
      where: { projectId: id, deletedAt: null },
      _count: true,
    });

    const taskPriorityBreakdown = await this.prisma.task.groupBy({
      by: ['priority'],
      where: { projectId: id, deletedAt: null },
      _count: true,
    });

    const progress = totalTasks > 0 ? (completedTasks / totalTasks) * 100 : 0;

    return {
      projectName: project.name,
      totalTasks,
      completedTasks,
      progress: Math.round(progress),
      taskStatusBreakdown,
      taskPriorityBreakdown,
      budget: project.budget,
      actualCost: project.actualCost,
    };
  }

  async addComment(projectId: string, userId: string, content: string) {
    await this.findOne(projectId);
    return this.prisma.projectComment.create({
      data: {
        projectId,
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

  async getComments(projectId: string) {
    await this.findOne(projectId);
    return this.prisma.projectComment.findMany({
      where: { projectId, deletedAt: null },
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
}
