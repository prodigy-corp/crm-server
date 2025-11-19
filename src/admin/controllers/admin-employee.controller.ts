import {
  Body,
  Controller,
  Delete,
  Get,
  HttpStatus,
  Param,
  Patch,
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
  ApiParam,
  ApiQuery,
  ApiResponse,
  ApiTags,
} from '@nestjs/swagger';
import { FileInterceptor } from '@nestjs/platform-express';
import { JwtAuthGuard } from '../../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../../common/guards/roles.guard';
import { Roles } from '../../common/decorators/roles.decorator';
import { AdminEmployeeService } from '../services/admin-employee.service';
import {
  AdminEmployeeQueryDto,
  CreateAdminEmployeeDto,
  CreateEmployeeSalaryIncrementDto,
  CreateEmployeeSalaryPaymentDto,
  EmployeeAttendanceActionDto,
  EmployeeAttendanceQueryDto,
  EmployeeSalaryPaymentQueryDto,
  ResignEmployeeDto,
  UpsertEmployeeAttendanceDto,
  UpdateAdminEmployeeDto,
  UpdateEmployeeSalaryPaymentStatusDto,
} from '../dto/admin-employee.dto';

@ApiTags('Admin - Employees')
@ApiBearerAuth('JWT-auth')
@Controller('admin/employees')
@UseGuards(JwtAuthGuard, RolesGuard)
@Roles('ADMIN', 'SUPER_ADMIN')
export class AdminEmployeeController {
  constructor(private readonly adminEmployeeService: AdminEmployeeService) {}

  @Get()
  @ApiOperation({ summary: 'Get all employees with pagination and filters' })
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'Employees retrieved successfully',
  })
  @ApiQuery({ name: 'page', required: false, type: Number })
  @ApiQuery({ name: 'limit', required: false, type: Number })
  @ApiQuery({ name: 'search', required: false, type: String })
  @ApiQuery({ name: 'status', required: false, type: String })
  @ApiQuery({ name: 'sortBy', required: false, type: String })
  @ApiQuery({ name: 'sortOrder', required: false, enum: ['asc', 'desc'] })
  async getAllEmployees(@Query() query: AdminEmployeeQueryDto) {
    return this.adminEmployeeService.getAllEmployees(query);
  }

  @Get('salary/payments')
  @ApiOperation({ summary: 'Get all salary payments' })
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'Salary payments retrieved successfully',
  })
  async getAllSalaryPayments(@Query() query: EmployeeSalaryPaymentQueryDto) {
    return this.adminEmployeeService.getAllSalaryPayments(query);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get employee by ID' })
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'Employee retrieved successfully',
  })
  @ApiResponse({
    status: HttpStatus.NOT_FOUND,
    description: 'Employee not found',
  })
  @ApiParam({ name: 'id', type: String })
  async getEmployeeById(@Param('id') id: string) {
    return this.adminEmployeeService.getEmployeeById(id);
  }

  @Post()
  @ApiOperation({ summary: 'Create a new employee' })
  @ApiResponse({
    status: HttpStatus.CREATED,
    description: 'Employee created successfully',
  })
  @ApiResponse({
    status: HttpStatus.BAD_REQUEST,
    description: 'Invalid input data',
  })
  async createEmployee(@Body() dto: CreateAdminEmployeeDto) {
    return this.adminEmployeeService.createEmployee(dto);
  }

  @Put(':id')
  @ApiOperation({ summary: 'Update employee by ID' })
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'Employee updated successfully',
  })
  @ApiResponse({
    status: HttpStatus.NOT_FOUND,
    description: 'Employee not found',
  })
  @ApiParam({ name: 'id', type: String })
  async updateEmployee(
    @Param('id') id: string,
    @Body() dto: UpdateAdminEmployeeDto,
  ) {
    return this.adminEmployeeService.updateEmployee(id, dto);
  }

  @Delete(':id')
  @ApiOperation({ summary: 'Soft delete employee by ID' })
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'Employee deleted successfully',
  })
  @ApiResponse({
    status: HttpStatus.NOT_FOUND,
    description: 'Employee not found',
  })
  @ApiParam({ name: 'id', type: String })
  async deleteEmployee(@Param('id') id: string) {
    return this.adminEmployeeService.deleteEmployee(id);
  }

  @Put(':id/resign')
  @ApiOperation({ summary: 'Mark employee as resigned' })
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'Employee resigned successfully',
  })
  @ApiResponse({
    status: HttpStatus.NOT_FOUND,
    description: 'Employee not found',
  })
  @ApiParam({ name: 'id', type: String })
  async resignEmployee(
    @Param('id') id: string,
    @Body() dto: ResignEmployeeDto,
  ) {
    return this.adminEmployeeService.resignEmployee(id, dto);
  }

  @Post(':id/photo')
  @ApiOperation({ summary: 'Upload or update employee photo (max 300KB)' })
  @ApiConsumes('multipart/form-data')
  @UseInterceptors(FileInterceptor('file'))
  @ApiParam({ name: 'id', type: String })
  async uploadEmployeePhoto(
    @Param('id') id: string,
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
    return this.adminEmployeeService.updateEmployeePhoto(id, file);
  }

  @Get(':id/attendance')
  @ApiOperation({ summary: 'Get employee attendance records' })
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'Attendance records retrieved successfully',
  })
  @ApiParam({ name: 'id', type: String })
  async getAttendance(
    @Param('id') id: string,
    @Query() query: EmployeeAttendanceQueryDto,
  ) {
    return this.adminEmployeeService.getAttendance(id, query);
  }

  @Post(':id/attendance/check-in')
  @ApiOperation({ summary: 'Employee check-in' })
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'Check-in recorded successfully',
  })
  @ApiParam({ name: 'id', type: String })
  async checkIn(
    @Param('id') id: string,
    @Body() dto: EmployeeAttendanceActionDto,
  ) {
    return this.adminEmployeeService.checkIn(id, dto);
  }

  @Post(':id/attendance/check-out')
  @ApiOperation({ summary: 'Employee check-out' })
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'Check-out recorded successfully',
  })
  @ApiParam({ name: 'id', type: String })
  async checkOut(
    @Param('id') id: string,
    @Body() dto: EmployeeAttendanceActionDto,
  ) {
    return this.adminEmployeeService.checkOut(id, dto);
  }

  @Put(':id/attendance')
  @ApiOperation({ summary: 'Create or update attendance for a specific date' })
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'Attendance upserted successfully',
  })
  @ApiParam({ name: 'id', type: String })
  async upsertAttendance(
    @Param('id') id: string,
    @Body() dto: UpsertEmployeeAttendanceDto,
  ) {
    return this.adminEmployeeService.upsertAttendance(id, dto);
  }

  @Get(':id/salary/payments')
  @ApiOperation({ summary: 'Get employee salary payments' })
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'Salary payments retrieved successfully',
  })
  @ApiParam({ name: 'id', type: String })
  async getSalaryPayments(
    @Param('id') id: string,
    @Query() query: EmployeeSalaryPaymentQueryDto,
  ) {
    return this.adminEmployeeService.getSalaryPayments(id, query);
  }

  @Post(':id/salary/increments')
  @ApiOperation({ summary: 'Create salary increment for employee' })
  @ApiResponse({
    status: HttpStatus.CREATED,
    description: 'Salary increment created successfully',
  })
  @ApiParam({ name: 'id', type: String })
  async createSalaryIncrement(
    @Param('id') id: string,
    @Body() dto: CreateEmployeeSalaryIncrementDto,
    @Request() req: any,
  ) {
    const approvedById = req.user?.userId || req.user?.id;
    return this.adminEmployeeService.createSalaryIncrement(
      id,
      dto,
      approvedById,
    );
  }

  @Post(':id/salary/payments')
  @ApiOperation({ summary: 'Create salary payment for employee' })
  @ApiResponse({
    status: HttpStatus.CREATED,
    description: 'Salary payment created successfully',
  })
  @ApiParam({ name: 'id', type: String })
  async createSalaryPayment(
    @Param('id') id: string,
    @Body() dto: CreateEmployeeSalaryPaymentDto,
  ) {
    return this.adminEmployeeService.createSalaryPayment(id, dto);
  }

  @Patch(':id/salary/payments/:paymentId/status')
  @ApiOperation({ summary: 'Update salary payment status' })
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'Salary payment status updated successfully',
  })
  @ApiResponse({
    status: HttpStatus.NOT_FOUND,
    description: 'Employee or payment not found',
  })
  @ApiParam({ name: 'id', type: String, description: 'Employee ID' })
  @ApiParam({ name: 'paymentId', type: String, description: 'Payment ID' })
  async updateSalaryPaymentStatus(
    @Param('id') id: string,
    @Param('paymentId') paymentId: string,
    @Body() dto: UpdateEmployeeSalaryPaymentStatusDto,
  ) {
    return this.adminEmployeeService.updateSalaryPaymentStatus(
      id,
      paymentId,
      dto.status,
    );
  }
}
