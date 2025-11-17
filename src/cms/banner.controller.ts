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
import { ContentQueryDto } from './dto/content-query.dto';
import { CreateBannerDto, ReorderDto, UpdateBannerDto } from './dto/banner.dto';
import { BannerService } from './services/banner.service';

@UseGuards(AuthGuard('jwt'), PermissionsGuard)
@Controller('admin/cms/banners')
export class BannerAdminController {
  constructor(private readonly service: BannerService) {}

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
  create(@Body() dto: CreateBannerDto, @Request() req: any) {
    const userId = req.user?.userId || req.user?.id;
    return this.service.create(dto, userId);
  }

  @Permissions('admin.settings.update')
  @Put(':id')
  update(
    @Param('id') id: string,
    @Body() dto: UpdateBannerDto,
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

@Controller('cms/banners')
export class BannerPublicController {
  constructor(private readonly service: BannerService) {}

  @Get('active')
  active(@Query('limit') limit?: string) {
    const parsed = limit ? parseInt(limit, 10) : 10;
    return this.service.active(parsed);
  }
}
