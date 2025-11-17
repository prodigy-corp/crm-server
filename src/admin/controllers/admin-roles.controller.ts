import {
  Controller,
  Get,
  Post,
  Put,
  Delete,
  Body,
  Param,
  UseGuards,
  HttpStatus,
} from '@nestjs/common';
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiBearerAuth,
  ApiParam,
} from '@nestjs/swagger';
import { JwtAuthGuard } from '../../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../../common/guards/roles.guard';
import { Roles } from '../../common/decorators/roles.decorator';
import { AdminRolesService } from '../services/admin-roles.service';

@ApiTags('Admin - Roles')
@ApiBearerAuth('JWT-auth')
@Controller('admin/roles')
@UseGuards(JwtAuthGuard, RolesGuard)
@Roles('ADMIN', 'SUPER_ADMIN')
export class AdminRolesController {
  constructor(private readonly adminRolesService: AdminRolesService) {}

  @Get()
  @ApiOperation({ summary: 'Get all roles' })
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'Roles retrieved successfully',
  })
  async getAllRoles() {
    return this.adminRolesService.getAllRoles();
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get role by ID' })
  @ApiParam({ name: 'id', type: String })
  async getRoleById(@Param('id') id: string) {
    return this.adminRolesService.getRoleById(id);
  }

  @Post()
  @ApiOperation({ summary: 'Create a new role' })
  async createRole(
    @Body()
    body: {
      name: string;
      description?: string;
      permissions?: string[];
    },
  ) {
    return this.adminRolesService.createRole(body);
  }

  @Put(':id')
  @ApiOperation({ summary: 'Update role' })
  @ApiParam({ name: 'id', type: String })
  async updateRole(
    @Param('id') id: string,
    @Body()
    body: { name?: string; description?: string; permissions?: string[] },
  ) {
    return this.adminRolesService.updateRole(id, body);
  }

  @Delete(':id')
  @ApiOperation({ summary: 'Delete role' })
  @ApiParam({ name: 'id', type: String })
  async deleteRole(@Param('id') id: string) {
    return this.adminRolesService.deleteRole(id);
  }

  @Get('permissions/all')
  @ApiOperation({ summary: 'Get all permissions' })
  async getAllPermissions() {
    return this.adminRolesService.getAllPermissions();
  }
}
