import {
  Controller,
  Get,
  Post,
  Put,
  Delete,
  Body,
  Param,
  UseGuards,
} from '@nestjs/common';
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiBearerAuth,
} from '@nestjs/swagger';
import { JwtAuthGuard } from '../../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../../common/guards/roles.guard';
import { Roles } from '../../common/decorators/roles.decorator';
import { AdminSystemService } from '../services/admin-system.service';

@ApiTags('Admin - System')
@ApiBearerAuth('JWT-auth')
@Controller('admin/system')
@UseGuards(JwtAuthGuard, RolesGuard)
@Roles('ADMIN', 'SUPER_ADMIN')
export class AdminSystemController {
  constructor(private readonly adminSystemService: AdminSystemService) {}

  @Get('health')
  @ApiOperation({ summary: 'Get system health status' })
  async getSystemHealth() {
    return this.adminSystemService.getSystemHealth();
  }

  @Get('logs')
  @ApiOperation({ summary: 'Get system logs' })
  async getSystemLogs() {
    return this.adminSystemService.getSystemLogs();
  }

  @Get('audit-logs')
  @ApiOperation({ summary: 'Get audit logs' })
  async getAuditLogs() {
    return this.adminSystemService.getAuditLogs();
  }

  @Post('cache/clear')
  @ApiOperation({ summary: 'Clear system cache' })
  async clearCache() {
    return this.adminSystemService.clearCache();
  }

  @Get('database/stats')
  @ApiOperation({ summary: 'Get database statistics' })
  async getDatabaseStats() {
    return this.adminSystemService.getDatabaseStats();
  }
}
