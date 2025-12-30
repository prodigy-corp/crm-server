import {
  Controller,
  Get,
  Query,
  UseGuards,
  Param,
  Request,
} from '@nestjs/common';
import { ProductivityService } from './productivity.service';
import { ProductivityFilterDto } from '../analytics/dto/productivity-filter.dto';
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { PermissionsGuard } from '../common/guards/permissions.guard';
import { Permissions } from '../common/decorators/permissions.decorator';
import { PrismaService } from '../prisma/prisma.service';

@ApiTags('Productivity')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard, PermissionsGuard)
@Controller('productivity')
export class ProductivityController {
  constructor(
    private readonly productivityService: ProductivityService,
    private readonly prisma: PrismaService,
  ) {}

  @Get('my')
  @Permissions('employee.profile.read')
  @ApiOperation({ summary: 'Get own productivity stats' })
  async getMyProductivity(
    @Request() req: any,
    @Query() filter: ProductivityFilterDto,
  ) {
    const userId = req.user.userId || req.user.id;
    const employee = await this.prisma.employee.findUnique({
      where: { userId },
    });

    if (!employee) {
      return {
        totalTasks: 0,
        completedTasks: 0,
        inProgressTasks: 0,
        todoTasks: 0,
        onTimeCompletion: 0,
        overdueTasks: 0,
        completionRate: 0,
        efficiencyRate: 0,
        message: 'Employee profile not found',
      };
    }

    return this.productivityService.getEmployeeProductivity({
      ...filter,
      employeeId: employee.id,
    });
  }

  @Get('overview')
  @Permissions('admin.dashboard.view')
  @ApiOperation({ summary: 'Get global productivity overview' })
  async getOverview() {
    return this.productivityService.getGlobalProductivity();
  }

  @Get('employee/:id')
  @Permissions('admin.employees.view')
  @ApiOperation({ summary: 'Get productivity for a specific employee' })
  async getEmployeeStats(
    @Param('id') id: string,
    @Query() filter: ProductivityFilterDto,
  ) {
    return this.productivityService.getEmployeeProductivity({
      ...filter,
      employeeId: id,
    });
  }
}
