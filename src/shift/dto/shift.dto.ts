import {
  IsString,
  IsOptional,
  IsNotEmpty,
  IsInt,
  Min,
  Max,
  IsArray,
  ValidateNested,
  IsBoolean,
} from 'class-validator';
import { ApiProperty, ApiPropertyOptional, PartialType } from '@nestjs/swagger';
import { Type } from 'class-transformer';

export class CreateShiftScheduleDto {
  @ApiProperty({
    example: 0,
    description: '0=Sunday, 1=Monday, ..., 6=Saturday',
  })
  @IsInt()
  @Min(0)
  @Max(6)
  @IsNotEmpty()
  dayOfWeek!: number;

  @ApiPropertyOptional({
    example: '09:00',
    description: 'Override start time (HH:mm)',
  })
  @IsString()
  @IsOptional()
  startTime?: string;

  @ApiPropertyOptional({
    example: '17:00',
    description: 'Override end time (HH:mm)',
  })
  @IsString()
  @IsOptional()
  endTime?: string;

  @ApiProperty({ example: false, description: 'Is this an off day?' })
  @IsBoolean()
  @IsNotEmpty()
  isOffDay!: boolean;

  @ApiProperty({ example: false, description: 'Is this a half day?' })
  @IsBoolean()
  @IsNotEmpty()
  isHalfDay!: boolean;
}

export class CreateShiftDto {
  @ApiProperty({ example: 'Morning Shift' })
  @IsString()
  @IsNotEmpty()
  name!: string;

  @ApiPropertyOptional({ example: 'Standard morning shift 9 AM - 5 PM' })
  @IsString()
  @IsOptional()
  description?: string;

  @ApiProperty({ example: '09:00', description: 'Default start time (HH:mm)' })
  @IsString()
  @IsNotEmpty()
  startTime!: string;

  @ApiProperty({ example: '17:00', description: 'Default end time (HH:mm)' })
  @IsString()
  @IsNotEmpty()
  endTime!: string;

  @ApiProperty({ example: 15, description: 'Late tolerance in minutes' })
  @IsInt()
  @Min(0)
  @IsNotEmpty()
  lateToleranceMinutes!: number;

  @ApiProperty({
    example: 15,
    description: 'Early departure tolerance in minutes',
  })
  @IsInt()
  @Min(0)
  @IsNotEmpty()
  earlyDepartureToleranceMinutes!: number;

  @ApiProperty({
    type: [CreateShiftScheduleDto],
    description: '7-day weekly schedule (optional)',
  })
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => CreateShiftScheduleDto)
  @IsOptional()
  schedules?: CreateShiftScheduleDto[];
}

export class UpdateShiftDto extends PartialType(CreateShiftDto) {}

export class UpdateShiftScheduleDto extends PartialType(
  CreateShiftScheduleDto,
) {}
