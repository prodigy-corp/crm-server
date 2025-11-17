import { Controller, Get, UseGuards } from '@nestjs/common';
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiBearerAuth,
} from '@nestjs/swagger';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../common/guards/roles.guard';
import { Roles } from '../common/decorators/roles.decorator';
import { AdminService } from './admin.service';

@ApiTags('Admin')
@ApiBearerAuth('JWT-auth')
@Controller('admin')
@UseGuards(JwtAuthGuard, RolesGuard)
@Roles('ADMIN', 'SUPER_ADMIN')
export class AdminController {
  constructor(private readonly adminService: AdminService) {}

  @Get()
  @ApiOperation({ summary: 'Get admin panel information' })
  @ApiResponse({
    status: 200,
    description: 'Admin panel information retrieved successfully',
    schema: {
      type: 'object',
      properties: {
        message: { type: 'string', example: 'Welcome to Admin Panel' },
        version: { type: 'string', example: '1.0.0' },
        timestamp: { type: 'string', example: '2025-01-29T12:00:00.000Z' },
        availableEndpoints: {
          type: 'array',
          items: { type: 'string' },
          example: [
            '/admin/users',
            '/admin/blogs',
            '/admin/roles',
            '/admin/dashboard',
            '/admin/system',
          ],
        },
      },
    },
  })
  getAdminInfo() {
    return this.adminService.getAdminInfo();
  }
}
