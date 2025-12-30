import { PartialType } from '@nestjs/mapped-types';
import { CreateKPIDto } from './create-kpi.dto';
import { IsOptional, IsNumber, Min } from 'class-validator';

export class UpdateKPIDto extends PartialType(CreateKPIDto) {
  @IsOptional()
  @IsNumber()
  @Min(0)
  currentValue?: number;
}
