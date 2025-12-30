import {
  IsNotEmpty,
  IsOptional,
  IsString,
  IsNumber,
  IsEnum,
  Min,
} from 'class-validator';
import { KPIStatus } from '@prisma/client';

export class CreateKPIDto {
  @IsNotEmpty()
  @IsString()
  name: string;

  @IsOptional()
  @IsString()
  description?: string;

  @IsNotEmpty()
  @IsString()
  unit: string;

  @IsNotEmpty()
  @IsNumber()
  @Min(0)
  targetValue: number;

  @IsNotEmpty()
  @IsString()
  period: string;

  @IsOptional()
  @IsEnum(KPIStatus)
  status?: KPIStatus;

  @IsNotEmpty()
  @IsString()
  employeeId: string;
}
