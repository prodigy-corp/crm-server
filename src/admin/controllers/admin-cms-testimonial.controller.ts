import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Post,
  Put,
  Query,
  UseGuards,
  Request,
} from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { Permissions } from 'src/common/decorators/permissions.decorator';
import { PermissionsGuard } from 'src/common/guards/permissions.guard';
import { ContentQueryDto } from 'src/cms/dto/content-query.dto';
import {
  CreateTestimonialDto,
  ReorderDto,
  UpdateTestimonialDto,
} from 'src/cms/dto/testimonial.dto';
import { TestimonialService } from 'src/cms/services/testimonial.service';

@UseGuards(AuthGuard('jwt'), PermissionsGuard)
@Controller('admin/cms/testimonials')
export class AdminCmsTestimonialController {
  constructor(private readonly service: TestimonialService) {}

  @Permissions('admin.settings.view')
  @Get()
  list(@Query() query: ContentQueryDto) {
    return this.service.list(query);
  }

  @Permissions('admin.settings.view')
  @Get(':id')
  get(@Param('id') id: string) {
    return this.service.getById(id);
  }

  @Permissions('admin.settings.update')
  @Post()
  create(@Body() dto: CreateTestimonialDto, @Request() req: any) {
    const userId = req.user?.userId || req.user?.id;
    return this.service.create(dto, userId);
  }

  @Permissions('admin.settings.update')
  @Put(':id')
  update(
    @Param('id') id: string,
    @Body() dto: UpdateTestimonialDto,
    @Request() req: any,
  ) {
    const userId = req.user?.userId || req.user?.id;
    return this.service.update(id, dto, userId);
  }

  @Permissions('admin.settings.update')
  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.service.delete(id);
  }

  @Permissions('admin.settings.update')
  @Put('reorder')
  reorder(@Body() dto: ReorderDto) {
    return this.service.reorder(dto.ids);
  }
}
