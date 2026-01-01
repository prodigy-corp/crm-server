import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  UseGuards,
  Request,
} from '@nestjs/common';
import { ProjectService } from './project.service';
import { CreateProjectDto } from './dto/create-project.dto';
import { UpdateProjectDto } from './dto/update-project.dto';
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { PermissionsGuard } from '../common/guards/permissions.guard';
import { Permissions } from '../common/decorators/permissions.decorator';

@ApiTags('Projects')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard, PermissionsGuard)
@Controller('projects')
export class ProjectController {
  constructor(private readonly projectService: ProjectService) {}

  @Post()
  @Permissions('projects.create')
  @ApiOperation({ summary: 'Create a new project' })
  create(@Body() createProjectDto: CreateProjectDto) {
    return this.projectService.create(createProjectDto);
  }

  @Get()
  @Permissions('projects.read')
  @ApiOperation({ summary: 'Get all projects' })
  findAll(@Request() req: any) {
    return this.projectService.findAll(req.user);
  }

  @Get(':id')
  @Permissions('projects.read')
  @ApiOperation({ summary: 'Get a project by ID' })
  findOne(@Param('id') id: string) {
    return this.projectService.findOne(id);
  }

  @Patch(':id')
  @Permissions('projects.update')
  @ApiOperation({ summary: 'Update a project' })
  update(@Param('id') id: string, @Body() updateProjectDto: UpdateProjectDto) {
    return this.projectService.update(id, updateProjectDto);
  }

  @Delete(':id')
  @Permissions('projects.delete')
  @ApiOperation({ summary: 'Delete a project' })
  remove(@Param('id') id: string) {
    return this.projectService.remove(id);
  }

  @Get('dashboard/stats')
  @Permissions('projects.read')
  @ApiOperation({ summary: 'Get overall project statistics for dashboard' })
  getDashboardStats() {
    return this.projectService.getDashboardStats();
  }

  @Get(':id/analytics')
  @Permissions('projects.read')
  @ApiOperation({ summary: 'Get detailed analytics for a specific project' })
  getProjectAnalytics(@Param('id') id: string) {
    return this.projectService.getProjectAnalytics(id);
  }

  @Post(':id/comments')
  @Permissions('projects.read')
  @ApiOperation({ summary: 'Add a comment to a project' })
  addComment(
    @Param('id') id: string,
    @Body('content') content: string,
    @Request() req: any,
  ) {
    const userId = req.user.userId || req.user.id;
    return this.projectService.addComment(id, userId, content);
  }

  @Get(':id/comments')
  @Permissions('projects.read')
  @ApiOperation({ summary: 'Get all comments for a project' })
  getComments(@Param('id') id: string) {
    return this.projectService.getComments(id);
  }
}
