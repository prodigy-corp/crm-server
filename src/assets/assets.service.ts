import {
  Injectable,
  NotFoundException,
  BadRequestException,
} from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateAssetDto } from './dto/create-asset.dto';
import { UpdateAssetDto } from './dto/update-asset.dto';
import { AssignAssetDto } from './dto/assign-asset.dto';
import { ReturnAssetDto } from './dto/return-asset.dto';
import { AssetStatus, AssetActivityType } from '@prisma/client';

@Injectable()
export class AssetsService {
  constructor(private prisma: PrismaService) {}

  async create(createAssetDto: CreateAssetDto) {
    return this.prisma.asset.create({
      data: createAssetDto,
    });
  }

  async findAll() {
    return this.prisma.asset.findMany({
      include: {
        assignments: {
          where: { isCurrent: true },
          include: {
            employee: {
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

  async findOne(id: string) {
    const asset = await this.prisma.asset.findUnique({
      where: { id },
      include: {
        assignments: {
          include: {
            employee: {
              select: {
                id: true,
                name: true,
              },
            },
          },
          orderBy: { assignedAt: 'desc' },
        },
        history: {
          orderBy: { date: 'desc' },
        },
      },
    });

    if (!asset) {
      throw new NotFoundException(`Asset with ID ${id} not found`);
    }

    return asset;
  }

  async update(id: string, updateAssetDto: UpdateAssetDto) {
    return this.prisma.asset.update({
      where: { id },
      data: updateAssetDto,
    });
  }

  async remove(id: string) {
    // Check if asset is assigned
    const assigned = await this.prisma.assetAssignment.findFirst({
      where: { assetId: id, isCurrent: true },
    });

    if (assigned) {
      throw new BadRequestException(
        'Cannot delete an assigned asset. Return it first.',
      );
    }

    return this.prisma.asset.delete({
      where: { id },
    });
  }

  async assign(
    id: string,
    assignAssetDto: AssignAssetDto,
    performedBy?: string,
  ) {
    const asset = await this.prisma.asset.findUnique({ where: { id } });

    if (!asset) {
      throw new NotFoundException(`Asset with ID ${id} not found`);
    }

    if (asset.status !== AssetStatus.AVAILABLE) {
      throw new BadRequestException(
        `Asset is not available for assignment. Current status: ${asset.status}`,
      );
    }

    return this.prisma.$transaction(async (tx) => {
      // Create assignment
      const assignment = await tx.assetAssignment.create({
        data: {
          assetId: id,
          employeeId: assignAssetDto.employeeId,
          condition: assignAssetDto.condition,
          isCurrent: true,
        },
      });

      // Update asset status
      await tx.asset.update({
        where: { id },
        data: { status: AssetStatus.ASSIGNED },
      });

      // Log history
      await tx.assetHistory.create({
        data: {
          assetId: id,
          activityType: AssetActivityType.ISSUE,
          description: `Asset assigned to employee ${assignAssetDto.employeeId}`,
          performedBy,
        },
      });

      return assignment;
    });
  }

  async return(
    id: string,
    returnAssetDto: ReturnAssetDto,
    performedBy?: string,
  ) {
    const assignment = await this.prisma.assetAssignment.findFirst({
      where: { assetId: id, isCurrent: true },
    });

    if (!assignment) {
      throw new BadRequestException(
        'Asset is not currently assigned to anyone.',
      );
    }

    return this.prisma.$transaction(async (tx) => {
      // End assignment
      await tx.assetAssignment.update({
        where: { id: assignment.id },
        data: {
          returnedAt: new Date(),
          returnNote: returnAssetDto.returnNote,
          isCurrent: false,
        },
      });

      // Update asset status
      await tx.asset.update({
        where: { id },
        data: { status: AssetStatus.AVAILABLE },
      });

      // Log history
      await tx.assetHistory.create({
        data: {
          assetId: id,
          activityType: AssetActivityType.RETURN,
          description: `Asset returned. Note: ${returnAssetDto.returnNote || 'None'}`,
          performedBy,
        },
      });

      return { message: 'Asset returned successfully' };
    });
  }

  async reportDamage(id: string, description: string, performedBy?: string) {
    return this.prisma.$transaction(async (tx) => {
      await tx.asset.update({
        where: { id },
        data: { status: AssetStatus.DAMAGED },
      });

      await tx.assetHistory.create({
        data: {
          assetId: id,
          activityType: AssetActivityType.DAMAGE_REPORT,
          description: `Damage reported: ${description}`,
          performedBy,
        },
      });

      return { message: 'Damage reported successfully' };
    });
  }

  async reportLoss(id: string, description: string, performedBy?: string) {
    return this.prisma.$transaction(async (tx) => {
      await tx.asset.update({
        where: { id },
        data: { status: AssetStatus.LOST },
      });

      await tx.assetHistory.create({
        data: {
          assetId: id,
          activityType: AssetActivityType.LOSS_REPORT,
          description: `Loss reported: ${description}`,
          performedBy,
        },
      });

      return { message: 'Loss reported successfully' };
    });
  }

  async getEmployeeAssets(employeeId: string) {
    return this.prisma.assetAssignment.findMany({
      where: { employeeId, isCurrent: true },
      include: {
        asset: true,
      },
    });
  }
}
