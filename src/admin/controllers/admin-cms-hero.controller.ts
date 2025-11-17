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
  CreateHeroSectionDto,
  ReorderDto,
  UpdateHeroSectionDto,
} from 'src/cms/dto/hero-section.dto';
import { HeroService } from 'src/cms/services/hero.service';

@UseGuards(AuthGuard('jwt'), PermissionsGuard)
@Controller('admin/cms/hero-sections')
export class AdminCmsHeroController {
  constructor(private readonly service: HeroService) {}

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
  create(@Body() dto: CreateHeroSectionDto, @Request() req: any) {
    const userId = req.user?.userId || req.user?.id;
    return this.service.create(dto, userId);
  }

  @Permissions('admin.settings.update')
  @Put(':id')
  update(
    @Param('id') id: string,
    @Body() dto: UpdateHeroSectionDto,
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
