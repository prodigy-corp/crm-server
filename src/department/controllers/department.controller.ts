import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  UseGuards,
} from '@nestjs/common';
import { ApiBearerAuth, ApiOperation, ApiTags } from '@nestjs/swagger';
import { DepartmentService } from '../services/department.service';
import {
  CreateDepartmentDto,
  UpdateDepartmentDto,
} from '../dto/department.dto';
import { JwtAuthGuard } from '../../auth/guards/jwt-auth.guard';
import { PermissionsGuard } from '../../common/guards/permissions.guard';
import { Permissions } from '../../common/decorators/permissions.decorator';

@ApiTags('Admin - Departments')
@ApiBearerAuth()
@Controller('admin/departments')
@UseGuards(JwtAuthGuard, PermissionsGuard)
export class DepartmentController {
  constructor(private readonly departmentService: DepartmentService) {}

  @Post()
  @Permissions('admin.departments.create')
  @ApiOperation({ summary: 'Create a new department' })
  create(@Body() createDepartmentDto: CreateDepartmentDto) {
    return this.departmentService.create(createDepartmentDto);
  }

  @Get()
  @Permissions('admin.departments.view')
  @ApiOperation({ summary: 'Get all departments' })
  findAll() {
    return this.departmentService.findAll();
  }

  @Get(':id')
  @Permissions('admin.departments.view')
  @ApiOperation({ summary: 'Get department by ID' })
  findOne(@Param('id') id: string) {
    return this.departmentService.findOne(id);
  }

  @Patch(':id')
  @Permissions('admin.departments.update')
  @ApiOperation({ summary: 'Update department' })
  update(
    @Param('id') id: string,
    @Body() updateDepartmentDto: UpdateDepartmentDto,
  ) {
    return this.departmentService.update(id, updateDepartmentDto);
  }

  @Delete(':id')
  @Permissions('admin.departments.delete')
  @ApiOperation({ summary: 'Delete department' })
  remove(@Param('id') id: string) {
    return this.departmentService.remove(id);
  }
}
