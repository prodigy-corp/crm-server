import {
  IsBoolean,
  IsIn,
  IsInt,
  IsOptional,
  IsString,
  IsUrl,
  Max,
  Min,
  MaxLength,
} from 'class-validator';

export class CreateHeroSectionDto {
  @IsString()
  @MaxLength(255)
  title!: string;

  @IsOptional()
  @IsString()
  @MaxLength(300)
  subtitle?: string;

  @IsOptional()
  @IsString()
  description?: string;

  @IsOptional()
  @IsString()
  @MaxLength(50)
  primaryButtonText?: string;

  @IsOptional()
  @IsString()
  primaryButtonUrl?: string;

  @IsOptional()
  @IsString()
  @MaxLength(50)
  secondaryButtonText?: string;

  @IsOptional()
  @IsString()
  secondaryButtonUrl?: string;

  @IsOptional()
  @IsString()
  backgroundImage?: string;

  @IsOptional()
  @IsString()
  backgroundVideo?: string;

  @IsOptional()
  @IsInt()
  @Min(0)
  @Max(100)
  overlayOpacity?: number;

  @IsOptional()
  @IsIn(['left', 'center', 'right'])
  textAlignment?: 'left' | 'center' | 'right';

  @IsOptional()
  @IsBoolean()
  isActive?: boolean;

  @IsOptional()
  @IsInt()
  displayOrder?: number;
}

export class UpdateHeroSectionDto {
  @IsOptional()
  @IsString()
  @MaxLength(255)
  title?: string;

  @IsOptional()
  @IsString()
  @MaxLength(300)
  subtitle?: string;

  @IsOptional()
  @IsString()
  description?: string;

  @IsOptional()
  @IsString()
  @MaxLength(50)
  primaryButtonText?: string;

  @IsOptional()
  @IsString()
  primaryButtonUrl?: string;

  @IsOptional()
  @IsString()
  @MaxLength(50)
  secondaryButtonText?: string;

  @IsOptional()
  @IsString()
  secondaryButtonUrl?: string;

  @IsOptional()
  @IsString()
  backgroundImage?: string;

  @IsOptional()
  @IsString()
  backgroundVideo?: string;

  @IsOptional()
  @IsInt()
  @Min(0)
  @Max(100)
  overlayOpacity?: number;

  @IsOptional()
  @IsIn(['left', 'center', 'right'])
  textAlignment?: 'left' | 'center' | 'right';

  @IsOptional()
  @IsBoolean()
  isActive?: boolean;

  @IsOptional()
  @IsInt()
  displayOrder?: number;
}

export class ReorderDto {
  @IsString({ each: true })
  ids!: string[];
}
