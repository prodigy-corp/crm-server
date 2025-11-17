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
import { AdminBlogsService } from '../services/admin-blogs.service';

@ApiTags('Admin - Blogs')
@ApiBearerAuth('JWT-auth')
@Controller('admin/blogs')
@UseGuards(JwtAuthGuard, RolesGuard)
@Roles('ADMIN', 'SUPER_ADMIN')
export class AdminBlogsController {
  constructor(private readonly adminBlogsService: AdminBlogsService) {}

  @Get()
  @ApiOperation({ summary: 'Get all blogs with pagination and filters' })
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'Blogs retrieved successfully',
  })
  async getAllBlogs(@Query() query: any) {
    return this.adminBlogsService.getAllBlogs(query);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get blog by ID' })
  @ApiParam({ name: 'id', type: String })
  async getBlogById(@Param('id') id: string) {
    return this.adminBlogsService.getBlogById(id);
  }

  @Put(':id/status')
  @ApiOperation({ summary: 'Update blog status' })
  @ApiParam({ name: 'id', type: String })
  async updateBlogStatus(
    @Param('id') id: string,
    @Body() body: { status: string },
  ) {
    return this.adminBlogsService.updateBlogStatus(id, body.status);
  }

  @Delete(':id')
  @ApiOperation({ summary: 'Delete blog' })
  @ApiParam({ name: 'id', type: String })
  async deleteBlog(@Param('id') id: string) {
    return this.adminBlogsService.deleteBlog(id);
  }

  @Get('analytics/overview')
  @ApiOperation({ summary: 'Get blog analytics overview' })
  async getBlogAnalytics() {
    return this.adminBlogsService.getBlogAnalytics();
  }
}
