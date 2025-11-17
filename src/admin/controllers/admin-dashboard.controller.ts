import { Controller, Get, UseGuards } from '@nestjs/common';
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiBearerAuth,
} from '@nestjs/swagger';
import { JwtAuthGuard } from '../../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../../common/guards/roles.guard';
import { Roles } from '../../common/decorators/roles.decorator';
import { AdminDashboardService } from '../services/admin-dashboard.service';

@ApiTags('Admin - Dashboard')
@ApiBearerAuth('JWT-auth')
@Controller('admin/dashboard')
@UseGuards(JwtAuthGuard, RolesGuard)
@Roles('ADMIN', 'SUPER_ADMIN')
export class AdminDashboardController {
  constructor(private readonly adminDashboardService: AdminDashboardService) {}

  @Get('stats')
  @ApiOperation({ summary: 'Get dashboard statistics' })
  @ApiResponse({
    status: 200,
    description: 'Dashboard stats retrieved successfully',
  })
  async getDashboardStats() {
    return this.adminDashboardService.getDashboardStats();
  }

  @Get('recent-activities')
  @ApiOperation({ summary: 'Get recent activities' })
  async getRecentActivities() {
    return this.adminDashboardService.getRecentActivities();
  }

  @Get('analytics')
  @ApiOperation({ summary: 'Get analytics data' })
  async getAnalytics() {
    return this.adminDashboardService.getAnalytics();
  }
}
