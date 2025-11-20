import {
  Body,
  Controller,
  Get,
  HttpStatus,
  Post,
  Put,
  Query,
  Request,
  UploadedFile,
  UseGuards,
  UseInterceptors,
  ParseFilePipe,
  MaxFileSizeValidator,
  FileTypeValidator,
} from '@nestjs/common';
import {
  ApiBearerAuth,
  ApiConsumes,
  ApiOperation,
  ApiResponse,
  ApiTags,
  ApiQuery,
} from '@nestjs/swagger';
import { FileInterceptor } from '@nestjs/platform-express';
import { JwtAuthGuard } from '../../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../../common/guards/roles.guard';
import { PermissionsGuard } from '../../common/guards/permissions.guard';
import { Roles } from '../../common/decorators/roles.decorator';
import { Permissions } from '../../common/decorators/permissions.decorator';
import { EmployeeService } from '../services/employee.service';
import {
  UpdateEmployeeProfileDto,
  EmployeeAttendanceCheckDto,
  EmployeeAttendanceQueryDto,
  EmployeeSalaryQueryDto,
} from '../dto/employee.dto';

@ApiTags('Employee - Self Service')
@ApiBearerAuth('JWT-auth')
@Controller('employee')
@UseGuards(JwtAuthGuard, RolesGuard, PermissionsGuard)
@Roles('EMPLOYEE')
export class EmployeeController {
  constructor(private readonly employeeService: EmployeeService) {}

  @Get('profile')
  @Permissions('employee.profile.read')
  @ApiOperation({ summary: 'Get own employee profile' })
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'Profile retrieved successfully',
  })
  async getProfile(@Request() req: any) {
    const userId = req.user?.userId || req.user?.id;
    return this.employeeService.getProfile(userId);
  }

  @Put('profile')
  @Permissions('employee.profile.update')
  @ApiOperation({ summary: 'Update own profile (limited fields)' })
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'Profile updated successfully',
  })
  async updateProfile(
    @Request() req: any,
    @Body() dto: UpdateEmployeeProfileDto,
  ) {
    const userId = req.user?.userId || req.user?.id;
    return this.employeeService.updateProfile(userId, dto);
  }

  @Post('profile/photo')
  @Permissions('employee.profile.update')
  @ApiOperation({ summary: 'Upload or update profile photo (max 300KB)' })
  @ApiConsumes('multipart/form-data')
  @UseInterceptors(FileInterceptor('file'))
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'Photo uploaded successfully',
  })
  async uploadPhoto(
    @Request() req: any,
    @UploadedFile(
      new ParseFilePipe({
        validators: [
          new MaxFileSizeValidator({ maxSize: 300 * 1024 }),
          new FileTypeValidator({ fileType: /(jpg|jpeg|png|webp)$/ }),
        ],
        fileIsRequired: true,
      }),
    )
    file: Express.Multer.File,
  ) {
    const userId = req.user?.userId || req.user?.id;
    return this.employeeService.uploadPhoto(userId, file);
  }

  @Get('attendance')
  @Permissions('employee.attendance.read')
  @ApiOperation({ summary: 'Get own attendance records' })
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'Attendance records retrieved successfully',
  })
  @ApiQuery({ name: 'page', required: false, type: Number })
  @ApiQuery({ name: 'limit', required: false, type: Number })
  @ApiQuery({ name: 'fromDate', required: false, type: String })
  @ApiQuery({ name: 'toDate', required: false, type: String })
  @ApiQuery({ name: 'status', required: false, type: String })
  async getAttendance(
    @Request() req: any,
    @Query() query: EmployeeAttendanceQueryDto,
  ) {
    const userId = req.user?.userId || req.user?.id;
    return this.employeeService.getAttendance(userId, query);
  }

  @Get('attendance/today')
  @Permissions('employee.attendance.read')
  @ApiOperation({ summary: "Get today's attendance status" })
  @ApiResponse({
    status: HttpStatus.OK,
    description: "Today's attendance retrieved",
  })
  async getTodayAttendance(@Request() req: any) {
    const userId = req.user?.userId || req.user?.id;
    return this.employeeService.getTodayAttendance(userId);
  }

  @Get('attendance/statistics')
  @Permissions('employee.attendance.read')
  @ApiOperation({ summary: 'Get attendance statistics for current month' })
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'Statistics retrieved successfully',
  })
  async getAttendanceStatistics(@Request() req: any) {
    const userId = req.user?.userId || req.user?.id;
    return this.employeeService.getAttendanceStatistics(userId);
  }

  @Post('attendance/check-in')
  @Permissions('employee.attendance.checkin')
  @ApiOperation({ summary: 'Check-in for the day' })
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'Check-in recorded successfully',
  })
  async checkIn(@Request() req: any, @Body() dto: EmployeeAttendanceCheckDto) {
    const userId = req.user?.userId || req.user?.id;
    return this.employeeService.checkIn(userId, dto);
  }

  @Post('attendance/check-out')
  @Permissions('employee.attendance.checkin')
  @ApiOperation({ summary: 'Check-out for the day' })
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'Check-out recorded successfully',
  })
  async checkOut(@Request() req: any, @Body() dto: EmployeeAttendanceCheckDto) {
    const userId = req.user?.userId || req.user?.id;
    return this.employeeService.checkOut(userId, dto);
  }

  @Get('salary/payments')
  @Permissions('employee.salary.read')
  @ApiOperation({ summary: 'Get own salary payment history' })
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'Salary payments retrieved successfully',
  })
  @ApiQuery({ name: 'page', required: false, type: Number })
  @ApiQuery({ name: 'limit', required: false, type: Number })
  @ApiQuery({ name: 'month', required: false, type: Number })
  @ApiQuery({ name: 'year', required: false, type: Number })
  async getSalaryPayments(
    @Request() req: any,
    @Query() query: EmployeeSalaryQueryDto,
  ) {
    const userId = req.user?.userId || req.user?.id;
    return this.employeeService.getSalaryPayments(userId, query);
  }

  @Get('salary/increments')
  @Permissions('employee.salary.read')
  @ApiOperation({ summary: 'Get own salary increment history' })
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'Salary increments retrieved successfully',
  })
  async getSalaryIncrements(@Request() req: any) {
    const userId = req.user?.userId || req.user?.id;
    return this.employeeService.getSalaryIncrements(userId);
  }
}
