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
import { AssetsService } from './assets.service';
import { CreateAssetDto } from './dto/create-asset.dto';
import { UpdateAssetDto } from './dto/update-asset.dto';
import { AssignAssetDto } from './dto/assign-asset.dto';
import { ReturnAssetDto } from './dto/return-asset.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { PermissionsGuard } from '../common/guards/permissions.guard';
import { Permissions } from '../common/decorators/permissions.decorator';

@Controller('assets')
@UseGuards(JwtAuthGuard, PermissionsGuard)
export class AssetsController {
  constructor(private readonly assetsService: AssetsService) {}

  @Post()
  @Permissions('asset.create')
  create(@Body() createAssetDto: CreateAssetDto) {
    return this.assetsService.create(createAssetDto);
  }

  @Get()
  @Permissions('asset.read')
  findAll() {
    return this.assetsService.findAll();
  }

  @Get(':id')
  @Permissions('asset.read')
  findOne(@Param('id') id: string) {
    return this.assetsService.findOne(id);
  }

  @Patch(':id')
  @Permissions('asset.update')
  update(@Param('id') id: string, @Body() updateAssetDto: UpdateAssetDto) {
    return this.assetsService.update(id, updateAssetDto);
  }

  @Delete(':id')
  @Permissions('asset.delete')
  remove(@Param('id') id: string) {
    return this.assetsService.remove(id);
  }

  @Post(':id/assign')
  @Permissions('asset.assign')
  assign(
    @Param('id') id: string,
    @Body() assignAssetDto: AssignAssetDto,
    @Req() req: any,
  ) {
    return this.assetsService.assign(id, assignAssetDto, req.user?.id);
  }

  @Post(':id/return')
  @Permissions('asset.return')
  return(
    @Param('id') id: string,
    @Body() returnAssetDto: ReturnAssetDto,
    @Req() req: any,
  ) {
    return this.assetsService.return(id, returnAssetDto, req.user?.id);
  }

  @Post(':id/report-damage')
  @Permissions('asset.update')
  reportDamage(
    @Param('id') id: string,
    @Body('description') description: string,
    @Req() req: any,
  ) {
    return this.assetsService.reportDamage(id, description, req.user?.id);
  }

  @Post(':id/report-loss')
  @Permissions('asset.update')
  reportLoss(
    @Param('id') id: string,
    @Body('description') description: string,
    @Req() req: any,
  ) {
    return this.assetsService.reportLoss(id, description, req.user?.id);
  }

  @Get('employee/:employeeId')
  @Permissions('asset.read')
  getEmployeeAssets(@Param('employeeId') employeeId: string) {
    return this.assetsService.getEmployeeAssets(employeeId);
  }
}
