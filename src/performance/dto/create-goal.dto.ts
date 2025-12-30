import {
  IsNotEmpty,
  IsOptional,
  IsString,
  IsDateString,
  IsInt,
  IsEnum,
  Min,
  Max,
} from 'class-validator';
import { GoalStatus } from '@prisma/client';

export class CreateGoalDto {
  @IsNotEmpty()
  @IsString()
  title: string;

  @IsOptional()
  @IsString()
  description?: string;

  @IsNotEmpty()
  @IsDateString()
  startDate: string;

  @IsNotEmpty()
  @IsDateString()
  endDate: string;

  @IsOptional()
  @IsInt()
  @Min(1)
  @Max(10)
  weight?: number;

  @IsOptional()
  @IsEnum(GoalStatus)
  status?: GoalStatus;

  @IsNotEmpty()
  @IsString()
  employeeId: string;
}
