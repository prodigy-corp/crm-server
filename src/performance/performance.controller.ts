import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  UseGuards,
  Req,
} from '@nestjs/common';
import { PerformanceService } from './performance.service';
import { CreateKPIDto } from './dto/create-kpi.dto';
import { UpdateKPIDto } from './dto/update-kpi.dto';
import { CreateGoalDto } from './dto/create-goal.dto';
import { CreateReviewDto } from './dto/create-review.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { PermissionsGuard } from '../common/guards/permissions.guard';
import { Permissions } from '../common/decorators/permissions.decorator';

@Controller('performance')
@UseGuards(JwtAuthGuard, PermissionsGuard)
export class PerformanceController {
  constructor(private readonly performanceService: PerformanceService) {}

  // ==================== KPIs ====================
  @Post('kpis')
  @Permissions('performance.create')
  createKPI(@Body() createKPIDto: CreateKPIDto) {
    return this.performanceService.createKPI(createKPIDto);
  }

  @Get('kpis/employee/:employeeId')
  @Permissions('performance.read')
  getEmployeeKPIs(@Param('employeeId') employeeId: string) {
    return this.performanceService.getEmployeeKPIs(employeeId);
  }

  @Patch('kpis/:id')
  @Permissions('performance.update')
  updateKPI(@Param('id') id: string, @Body() updateKPIDto: UpdateKPIDto) {
    return this.performanceService.updateKPI(id, updateKPIDto);
  }

  @Delete('kpis/:id')
  @Permissions('performance.delete')
  deleteKPI(@Param('id') id: string) {
    return this.performanceService.deleteKPI(id);
  }

  // ==================== Goals ====================
  @Post('goals')
  @Permissions('performance.create')
  createGoal(@Body() createGoalDto: CreateGoalDto) {
    return this.performanceService.createGoal(createGoalDto);
  }

  @Get('goals/employee/:employeeId')
  @Permissions('performance.read')
  getEmployeeGoals(@Param('employeeId') employeeId: string) {
    return this.performanceService.getEmployeeGoals(employeeId);
  }

  @Patch('goals/:id')
  @Permissions('performance.update')
  updateGoal(@Param('id') id: string, @Body() updateGoalDto: any) {
    return this.performanceService.updateGoal(id, updateGoalDto);
  }

  @Delete('goals/:id')
  @Permissions('performance.delete')
  deleteGoal(@Param('id') id: string) {
    return this.performanceService.deleteGoal(id);
  }

  // ==================== Reviews ====================
  @Post('reviews')
  @Permissions('performance.create')
  createReview(@Req() req: any, @Body() createReviewDto: CreateReviewDto) {
    return this.performanceService.createReview(req.user.id, createReviewDto);
  }

  @Get('reviews/employee/:employeeId')
  @Permissions('performance.read')
  getEmployeeReviews(@Param('employeeId') employeeId: string) {
    return this.performanceService.getEmployeeReviews(employeeId);
  }

  @Patch('reviews/:id/finalize')
  @Permissions('performance.update')
  finalizeReview(@Param('id') id: string) {
    return this.performanceService.finalizeReview(id);
  }

  // ==================== Appraisal History ====================
  @Get('appraisals/employee/:employeeId')
  @Permissions('performance.read')
  getEmployeeAppraisalHistory(@Param('employeeId') employeeId: string) {
    return this.performanceService.getEmployeeAppraisalHistory(employeeId);
  }
}
