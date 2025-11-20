import { IsString, IsOptional, IsNotEmpty } from 'class-validator';
import { ApiProperty, ApiPropertyOptional, PartialType } from '@nestjs/swagger';

export class CreateDepartmentDto {
  @ApiProperty({ example: 'Engineering' })
  @IsString()
  @IsNotEmpty()
  name!: string;

  @ApiPropertyOptional({
    example: 'Software development and technical support',
  })
  @IsString()
  @IsOptional()
  description?: string;

  @ApiPropertyOptional({
    example: 'cm123abc...',
    description: 'Default shift ID for this department',
  })
  @IsString()
  @IsOptional()
  defaultShiftId?: string;
}

export class UpdateDepartmentDto extends PartialType(CreateDepartmentDto) {}
