import {
  Body,
  Controller,
  Delete,
  Get,
  HttpCode,
  HttpStatus,
  Param,
  Post,
  Put,
  Query,
  Req,
  UploadedFile,
  UseGuards,
  UseInterceptors,
} from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { FileInterceptor } from '@nestjs/platform-express';
import { Request } from 'express';
import { Permissions } from 'src/common/decorators/permissions.decorator';
import { PermissionsGuard } from 'src/common/guards/permissions.guard';
import { BlogService } from './blog.service';
import { CreateBlogDto } from './dto/create-blog.dto';
import { UpdateBlogDto } from './dto/update-blog.dto';
import { QueryBlogDto, AdminQueryBlogDto } from './dto/query-blog.dto';

@Controller('blog')
export class BlogController {
  constructor(private readonly blogService: BlogService) {}

  /**
   * Create a new blog post (Admin/Author)
   */
  @UseGuards(AuthGuard('jwt'), PermissionsGuard)
  @Permissions('blog.create')
  @Post()
  @UseInterceptors(FileInterceptor('featuredImage'))
  async create(
    @UploadedFile() file: Express.Multer.File,
    @Body() body: CreateBlogDto,
    @Req() req: Request,
  ) {
    const userId = (req.user as any).id;
    return this.blogService.create(body, userId, file);
  }

  /**
   * Update a blog post (Admin/Author)
   */
  @HttpCode(HttpStatus.OK)
  @UseGuards(AuthGuard('jwt'), PermissionsGuard)
  @Permissions('blog.update')
  @Put(':id')
  @UseInterceptors(FileInterceptor('featuredImage'))
  async update(
    @UploadedFile() file: Express.Multer.File,
    @Body() body: UpdateBlogDto,
    @Param('id') id: string,
    @Req() req: Request,
  ) {
    const userId = (req.user as any).id;
    return this.blogService.update(id, body, userId, file);
  }

  /**
   * Get all blog posts (Public)
   */
  @Get()
  async findAll(@Query() query: QueryBlogDto) {
    return this.blogService.findAll(query);
  }

  /**
   * Get all blog posts for admin (Admin)
   */
  @UseGuards(AuthGuard('jwt'), PermissionsGuard)
  @Permissions('admin.blog.view')
  @Get('admin/list')
  async findByAdmin(@Query() query: AdminQueryBlogDto) {
    return this.blogService.findByAdmin(query);
  }

  /**
   * Get a single blog post by slug (Public)
   */
  @Get('slug/:slug')
  async findBySlug(@Param('slug') slug: string, @Req() req: Request) {
    const userId = (req.user as any)?.id;
    const ip = req.ip || (req.headers['x-forwarded-for'] as string);
    return this.blogService.findBySlug(slug, userId, ip);
  }

  /**
   * Get a single blog post by ID (Admin)
   */
  @UseGuards(AuthGuard('jwt'), PermissionsGuard)
  @Permissions('admin.blog.view')
  @Get('admin/:id')
  async findById(@Param('id') id: string) {
    return this.blogService.findById(id);
  }

  /**
   * Get featured blog posts (Public)
   */
  @Get('featured/list')
  async getFeaturedBlogs(@Query('limit') limit?: string) {
    const parsedLimit = limit ? parseInt(limit) : 5;
    return this.blogService.getFeaturedBlogs(parsedLimit);
  }

  /**
   * Get related blog posts (Public)
   */
  @Get('related/:blogId')
  async getRelatedBlogs(
    @Param('blogId') blogId: string,
    @Query('limit') limit?: string,
  ) {
    const parsedLimit = limit ? parseInt(limit) : 5;
    return this.blogService.getRelatedBlogs(blogId, parsedLimit);
  }

  /**
   * Get popular blog posts (Public)
   */
  @Get('popular/list')
  async getPopularBlogs(
    @Query('limit') limit?: string,
    @Query('days') days?: string,
  ) {
    const parsedLimit = limit ? parseInt(limit) : 10;
    const parsedDays = days ? parseInt(days) : 30;
    return this.blogService.getPopularBlogs(parsedLimit, parsedDays);
  }

  /**
   * Soft delete a blog post (Admin)
   */
  @HttpCode(HttpStatus.OK)
  @UseGuards(AuthGuard('jwt'), PermissionsGuard)
  @Permissions('blog.delete')
  @Delete(':id')
  async delete(@Param('id') id: string) {
    return this.blogService.delete(id);
  }

  /**
   * Permanently delete a blog post (Admin)
   */
  @HttpCode(HttpStatus.OK)
  @UseGuards(AuthGuard('jwt'), PermissionsGuard)
  @Permissions('blog.delete.permanent')
  @Delete('permanent/:id')
  async permanentDelete(@Param('id') id: string) {
    return this.blogService.permanentDelete(id);
  }
}
