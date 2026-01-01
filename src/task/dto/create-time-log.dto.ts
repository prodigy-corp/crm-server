import { IsNumber, IsString, IsOptional, IsDateString } from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class CreateTimeLogDto {
  @ApiProperty({ example: 2.5 })
  @IsNumber()
  hours: number;

  @ApiPropertyOptional({ example: 'Working on login page' })
  @IsOptional()
  @IsString()
  description?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsDateString()
  logDate?: string;
}
