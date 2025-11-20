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
import { ShiftService } from '../services/shift.service';
import { CreateShiftDto, UpdateShiftDto } from '../dto/shift.dto';

import { PermissionsGuard } from '../../common/guards/permissions.guard';

import { JwtAuthGuard } from 'src/auth/guards/jwt-auth.guard';
import { Permissions } from 'src/common/decorators/permissions.decorator';

@ApiTags('Admin - Shifts')
@ApiBearerAuth()
@Controller('admin/shifts')
@UseGuards(JwtAuthGuard, PermissionsGuard)
export class ShiftController {
  constructor(private readonly shiftService: ShiftService) {}

  @Post()
  @Permissions('admin.shifts.create')
  @ApiOperation({ summary: 'Create a new shift with 7-day schedule' })
  create(@Body() createShiftDto: CreateShiftDto) {
    return this.shiftService.create(createShiftDto);
  }

  @Get()
  @Permissions('admin.shifts.view')
  @ApiOperation({ summary: 'Get all shifts' })
  findAll() {
    return this.shiftService.findAll();
  }

  @Get(':id')
  @Permissions('admin.shifts.view')
  @ApiOperation({ summary: 'Get shift by ID with schedules' })
  findOne(@Param('id') id: string) {
    return this.shiftService.findOne(id);
  }

  @Patch(':id')
  @Permissions('admin.shifts.update')
  @ApiOperation({ summary: 'Update shift and schedules' })
  update(@Param('id') id: string, @Body() updateShiftDto: UpdateShiftDto) {
    return this.shiftService.update(id, updateShiftDto);
  }

  @Delete(':id')
  @Permissions('admin.shifts.delete')
  @ApiOperation({ summary: 'Delete shift' })
  remove(@Param('id') id: string) {
    return this.shiftService.remove(id);
  }
}
