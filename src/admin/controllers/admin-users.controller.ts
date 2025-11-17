import {
  Controller,
  Get,
  Post,
  Put,
  Delete,
  Body,
  Param,
  Query,
  UseGuards,
  HttpStatus,
} from '@nestjs/common';
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiBearerAuth,
  ApiParam,
  ApiQuery,
} from '@nestjs/swagger';
import { JwtAuthGuard } from '../../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../../common/guards/roles.guard';
import { Roles } from '../../common/decorators/roles.decorator';
import { AdminUsersService } from '../services/admin-users.service';
import {
  CreateAdminUserDto,
  UpdateAdminUserDto,
  AdminUserQueryDto,
} from '../dto/admin-user.dto';

@ApiTags('Admin - Users')
@ApiBearerAuth('JWT-auth')
@Controller('admin/users')
@UseGuards(JwtAuthGuard, RolesGuard)
@Roles('ADMIN', 'SUPER_ADMIN')
export class AdminUsersController {
  constructor(private readonly adminUsersService: AdminUsersService) {}

  @Get()
  @ApiOperation({ summary: 'Get all users with pagination and filters' })
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'Users retrieved successfully',
  })
  @ApiQuery({ name: 'page', required: false, type: Number })
  @ApiQuery({ name: 'limit', required: false, type: Number })
  @ApiQuery({ name: 'search', required: false, type: String })
  @ApiQuery({
    name: 'status',
    required: false,
    enum: ['ACTIVE', 'INACTIVE', 'BLOCKED', 'PENDING'],
  })
  @ApiQuery({ name: 'role', required: false, type: String })
  @ApiQuery({ name: 'sortBy', required: false, type: String })
  @ApiQuery({ name: 'sortOrder', required: false, enum: ['asc', 'desc'] })
  async getAllUsers(@Query() query: AdminUserQueryDto) {
    return this.adminUsersService.getAllUsers(query);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get user by ID' })
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'User retrieved successfully',
  })
  @ApiResponse({
    status: HttpStatus.NOT_FOUND,
    description: 'User not found',
  })
  @ApiParam({ name: 'id', type: String })
  async getUserById(@Param('id') id: string) {
    return this.adminUsersService.getUserById(id);
  }

  @Post()
  @ApiOperation({ summary: 'Create a new user' })
  @ApiResponse({
    status: HttpStatus.CREATED,
    description: 'User created successfully',
  })
  @ApiResponse({
    status: HttpStatus.BAD_REQUEST,
    description: 'Invalid input data',
  })
  async createUser(@Body() createUserDto: CreateAdminUserDto) {
    return this.adminUsersService.createUser(createUserDto);
  }

  @Put(':id')
  @ApiOperation({ summary: 'Update user by ID' })
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'User updated successfully',
  })
  @ApiResponse({
    status: HttpStatus.NOT_FOUND,
    description: 'User not found',
  })
  @ApiParam({ name: 'id', type: String })
  async updateUser(
    @Param('id') id: string,
    @Body() updateUserDto: UpdateAdminUserDto,
  ) {
    return this.adminUsersService.updateUser(id, updateUserDto);
  }

  @Delete(':id')
  @ApiOperation({ summary: 'Delete user by ID (soft delete)' })
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'User deleted successfully',
  })
  @ApiResponse({
    status: HttpStatus.NOT_FOUND,
    description: 'User not found',
  })
  @ApiParam({ name: 'id', type: String })
  async deleteUser(@Param('id') id: string) {
    return this.adminUsersService.deleteUser(id);
  }

  @Put(':id/block')
  @ApiOperation({ summary: 'Block user' })
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'User blocked successfully',
  })
  @ApiParam({ name: 'id', type: String })
  async blockUser(@Param('id') id: string) {
    return this.adminUsersService.blockUser(id);
  }

  @Put(':id/unblock')
  @ApiOperation({ summary: 'Unblock user' })
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'User unblocked successfully',
  })
  @ApiParam({ name: 'id', type: String })
  async unblockUser(@Param('id') id: string) {
    return this.adminUsersService.unblockUser(id);
  }

  @Put(':id/verify-email')
  @ApiOperation({ summary: 'Verify user email' })
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'User email verified successfully',
  })
  @ApiParam({ name: 'id', type: String })
  async verifyUserEmail(@Param('id') id: string) {
    return this.adminUsersService.verifyUserEmail(id);
  }

  @Get(':id/login-history')
  @ApiOperation({ summary: 'Get user login history' })
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'Login history retrieved successfully',
  })
  @ApiParam({ name: 'id', type: String })
  async getUserLoginHistory(@Param('id') id: string) {
    return this.adminUsersService.getUserLoginHistory(id);
  }
}
