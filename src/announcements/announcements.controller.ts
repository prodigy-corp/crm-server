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
import { AnnouncementsService } from './announcements.service';
import { CreateAnnouncementDto } from './dto/create-announcement.dto';
import { UpdateAnnouncementDto } from './dto/update-announcement.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { PermissionsGuard } from '../common/guards/permissions.guard';
import { Permissions } from '../common/decorators/permissions.decorator';

@Controller('announcements')
@UseGuards(JwtAuthGuard, PermissionsGuard)
export class AnnouncementsController {
  constructor(private readonly announcementsService: AnnouncementsService) {}

  @Post()
  @Permissions('announcement.create')
  create(
    @Body() createAnnouncementDto: CreateAnnouncementDto,
    @Req() req: any,
  ) {
    return this.announcementsService.create(
      createAnnouncementDto,
      req.user?.id,
    );
  }

  @Get()
  @Permissions('announcement.read')
  findAll() {
    return this.announcementsService.findAll();
  }

  @Get('active')
  // No specific permission required for reading active broadcast, just auth
  findActive() {
    return this.announcementsService.findActive();
  }

  @Get(':id')
  @Permissions('announcement.read')
  findOne(@Param('id') id: string) {
    return this.announcementsService.findOne(id);
  }

  @Patch(':id')
  @Permissions('announcement.update')
  update(
    @Param('id') id: string,
    @Body() updateAnnouncementDto: UpdateAnnouncementDto,
  ) {
    return this.announcementsService.update(id, updateAnnouncementDto);
  }

  @Delete(':id')
  @Permissions('announcement.delete')
  remove(@Param('id') id: string) {
    return this.announcementsService.remove(id);
  }
}
