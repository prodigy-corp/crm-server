import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateKPIDto } from './dto/create-kpi.dto';
import { UpdateKPIDto } from './dto/update-kpi.dto';
import { CreateGoalDto } from './dto/create-goal.dto';
import { CreateReviewDto } from './dto/create-review.dto';
import { ReviewStatus } from '@prisma/client';

@Injectable()
export class PerformanceService {
  constructor(private prisma: PrismaService) {}

  // ==================== KPI Methods ====================
  async createKPI(data: CreateKPIDto) {
    return this.prisma.kPI.create({
      data,
    });
  }

  async getEmployeeKPIs(employeeId: string) {
    return this.prisma.kPI.findMany({
      where: { employeeId },
      orderBy: { createdAt: 'desc' },
    });
  }

  async updateKPI(id: string, data: UpdateKPIDto) {
    return this.prisma.kPI.update({
      where: { id },
      data,
    });
  }

  async deleteKPI(id: string) {
    return this.prisma.kPI.delete({
      where: { id },
    });
  }

  // ==================== Goal Methods ====================
  async createGoal(data: CreateGoalDto) {
    return this.prisma.goal.create({
      data,
    });
  }

  async getEmployeeGoals(employeeId: string) {
    return this.prisma.goal.findMany({
      where: { employeeId },
      orderBy: { endDate: 'asc' },
    });
  }

  async updateGoal(id: string, data: any) {
    return this.prisma.goal.update({
      where: { id },
      data,
    });
  }

  async deleteGoal(id: string) {
    return this.prisma.goal.delete({
      where: { id },
    });
  }

  // ==================== Review Methods ====================
  async createReview(reviewerId: string, data: CreateReviewDto) {
    const review = await this.prisma.performanceReview.create({
      data: {
        ...data,
        reviewerId,
      },
    });

    // If status is FINALIZED, create Appraisal History
    if (data.status === ReviewStatus.FINALIZED) {
      await this.prisma.appraisalHistory.create({
        data: {
          employeeId: data.employeeId,
          reviewId: review.id,
        },
      });
    }

    return review;
  }

  async getEmployeeReviews(employeeId: string) {
    return this.prisma.performanceReview.findMany({
      where: { employeeId },
      include: {
        reviewer: {
          select: {
            id: true,
            name: true,
          },
        },
      },
      orderBy: { reviewDate: 'desc' },
    });
  }

  async finalizeReview(id: string) {
    const review = await this.prisma.performanceReview.update({
      where: { id },
      data: { status: ReviewStatus.FINALIZED },
    });

    await this.prisma.appraisalHistory.create({
      data: {
        employeeId: review.employeeId,
        reviewId: review.id,
      },
    });

    return review;
  }

  // ==================== Appraisal History ====================
  async getEmployeeAppraisalHistory(employeeId: string) {
    return this.prisma.appraisalHistory.findMany({
      where: { employeeId },
      include: {
        review: {
          include: {
            reviewer: {
              select: {
                id: true,
                name: true,
              },
            },
          },
        },
      },
      orderBy: { createdAt: 'desc' },
    });
  }
}
