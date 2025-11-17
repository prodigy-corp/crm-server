import {
  Body,
  Controller,
  Get,
  HttpCode,
  HttpStatus,
  Param,
  Post,
  Put,
  Query,
  UploadedFile,
  UseGuards,
  UseInterceptors,
} from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { FileInterceptor } from '@nestjs/platform-express';
import { Permissions } from 'src/common/decorators/permissions.decorator';
import { PermissionsGuard } from 'src/common/guards/permissions.guard';
import { CategoryService } from './category.service';
import { updateCategoryDto } from './dto/update.dto';

@Controller('category')
export class CategoryController {
  constructor(readonly categoryService: CategoryService) {}

  @UseGuards(AuthGuard('jwt'), PermissionsGuard)
  @Permissions('category.create')
  @Post()
  @UseInterceptors(FileInterceptor('icon'))
  async create(@UploadedFile() file: Express.Multer.File, @Body() body: any) {
    return this.categoryService.create(body, file);
  }

  @HttpCode(HttpStatus.OK)
  @UseGuards(AuthGuard('jwt'), PermissionsGuard)
  @Permissions('category.update')
  @Put(':id')
  @UseInterceptors(FileInterceptor('icon'))
  update(
    @UploadedFile() file: Express.Multer.File,
    @Body() body: updateCategoryDto,
    @Param('id') id: string,
  ) {
    return this.categoryService.categoryUpdate(id, body, file);
  }

  @UseGuards(AuthGuard('jwt'), PermissionsGuard)
  @Permissions('admin.category.view')
  @Get('admin')
  findByAdmin(@Query() query: any) {
    return this.categoryService.findByAdmin(query);
  }

  @Get()
  findAll() {
    return this.categoryService.findAll();
  }

  @Get('/slug/:slug')
  findSingleCategoryBySlug(@Param('slug') slug: string) {
    return this.categoryService.findSingleCategoryBySlug(slug);
  }
}
