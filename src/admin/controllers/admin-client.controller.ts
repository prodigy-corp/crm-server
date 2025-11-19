import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  Query,
  UseGuards,
  HttpCode,
  HttpStatus,
} from '@nestjs/common';
import { AdminClientService } from '../services/admin-client.service';
import {
  CreateClientDto,
  UpdateClientDto,
  ClientQueryDto,
} from '../dto/admin-client.dto';
import { JwtAuthGuard } from '../../auth/guards/jwt-auth.guard';
import { PermissionsGuard } from '../../common/guards/permissions.guard';
import { Permissions } from '../../common/decorators/permissions.decorator';

@Controller('admin/clients')
@UseGuards(JwtAuthGuard, PermissionsGuard)
export class AdminClientController {
  constructor(private readonly adminClientService: AdminClientService) {}

  /**
   * Get all clients
   * GET /admin/clients
   */
  @Get()
  @Permissions('admin.clients.view')
  async findAll(@Query() query: ClientQueryDto) {
    const result = await this.adminClientService.findAll(query);
    return {
      status: true,
      message: 'Clients retrieved successfully',
      data: result,
    };
  }

  /**
   * Get client statistics
   * GET /admin/clients/statistics
   */
  @Get('statistics')
  @Permissions('admin.clients.view')
  async getStatistics() {
    const stats = await this.adminClientService.getStatistics();
    return {
      status: true,
      message: 'Client statistics retrieved successfully',
      data: stats,
    };
  }

  /**
   * Get single client by ID
   * GET /admin/clients/:id
   */
  @Get(':id')
  @Permissions('admin.clients.view')
  async findOne(@Param('id') id: string) {
    const client = await this.adminClientService.findOne(id);
    return {
      status: true,
      message: 'Client retrieved successfully',
      data: client,
    };
  }

  /**
   * Create new client
   * POST /admin/clients
   */
  @Post()
  @Permissions('admin.clients.manage')
  async create(@Body() createClientDto: CreateClientDto) {
    const client = await this.adminClientService.create(createClientDto);
    return {
      status: true,
      message: 'Client created successfully',
      data: client,
    };
  }

  /**
   * Update client
   * PATCH /admin/clients/:id
   */
  @Patch(':id')
  @Permissions('admin.clients.manage')
  async update(
    @Param('id') id: string,
    @Body() updateClientDto: UpdateClientDto,
  ) {
    const client = await this.adminClientService.update(id, updateClientDto);
    return {
      status: true,
      message: 'Client updated successfully',
      data: client,
    };
  }

  /**
   * Delete client (soft delete)
   * DELETE /admin/clients/:id
   */
  @Delete(':id')
  @Permissions('admin.clients.manage')
  @HttpCode(HttpStatus.OK)
  async remove(@Param('id') id: string) {
    const result = await this.adminClientService.remove(id);
    return {
      status: true,
      ...result,
    };
  }

  /**
   * Suspend client
   * POST /admin/clients/:id/suspend
   */
  @Post(':id/suspend')
  @Permissions('admin.clients.manage')
  async suspend(@Param(' id') id: string) {
    const client = await this.adminClientService.suspend(id);
    return {
      status: true,
      message: 'Client suspended successfully',
      data: client,
    };
  }

  /**
   * Activate client
   * POST /admin/clients/:id/activate
   */
  @Post(':id/activate')
  @Permissions('admin.clients.manage')
  async activate(@Param('id') id: string) {
    const client = await this.adminClientService.activate(id);
    return {
      status: true,
      message: 'Client activated successfully',
      data: client,
    };
  }

  /**
   * Link client to user account
   * POST /admin/clients/:id/link-user
   */
  @Post(':id/link-user')
  @Permissions('admin.clients.manage')
  async linkUserAccount(
    @Param('id') id: string,
    @Body('userId') userId: string,
  ) {
    const client = await this.adminClientService.linkUserAccount(id, userId);
    return {
      status: true,
      message: 'User account linked successfully',
      data: client,
    };
  }

  /**
   * Unlink client from user account
   * POST /admin/clients/:id/unlink-user
   */
  @Post(':id/unlink-user')
  @Permissions('admin.clients.manage')
  async unlinkUserAccount(@Param('id') id: string) {
    const client = await this.adminClientService.unlinkUserAccount(id);
    return {
      status: true,
      message: 'User account unlinked successfully',
      data: client,
    };
  }
}
