import { Controller, Get, HttpStatus, Query, UseGuards } from '@nestjs/common';
import {
  ApiBearerAuth,
  ApiOperation,
  ApiResponse,
  ApiTags,
} from '@nestjs/swagger';
import { JwtAuthGuard } from '../../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../../common/guards/roles.guard';
import { Roles } from '../../common/decorators/roles.decorator';
import { AdminAttendanceService } from '../services/admin-attendance.service';
import { AdminAttendanceQueryDto } from '../dto/admin-attendance.dto';

@ApiTags('Admin - Attendance')
@ApiBearerAuth('JWT-auth')
@Controller('admin/attendance')
@UseGuards(JwtAuthGuard, RolesGuard)
@Roles('ADMIN', 'SUPER_ADMIN')
export class AdminAttendanceController {
  constructor(
    private readonly adminAttendanceService: AdminAttendanceService,
  ) {}

  @Get()
  @ApiOperation({
    summary: 'Get all attendance records with pagination and filters',
  })
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'Attendance records retrieved successfully',
  })
  async getAllAttendance(@Query() query: AdminAttendanceQueryDto) {
    return this.adminAttendanceService.getAllAttendance(query);
  }
}
