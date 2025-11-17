import {
  IsString,
  IsOptional,
  IsObject,
  IsNumber,
  IsEmail,
} from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class TrackEventDto {
  @ApiProperty({ description: 'Event name to track' })
  @IsString()
  eventName!: string;

  @ApiPropertyOptional({ description: 'User ID' })
  @IsOptional()
  @IsString()
  userId?: string;

  @ApiPropertyOptional({ description: 'User email' })
  @IsOptional()
  @IsEmail()
  userEmail?: string;

  @ApiPropertyOptional({ description: 'Session ID' })
  @IsOptional()
  @IsString()
  sessionId?: string;

  @ApiPropertyOptional({ description: 'Event properties' })
  @IsOptional()
  @IsObject()
  properties?: Record<string, any>;

  @ApiPropertyOptional({ description: 'User properties' })
  @IsOptional()
  @IsObject()
  userProperties?: Record<string, any>;
}

export class TrackPageViewDto {
  @ApiProperty({ description: 'Page URL' })
  @IsString()
  url!: string;

  @ApiPropertyOptional({ description: 'Page title' })
  @IsOptional()
  @IsString()
  title?: string;

  @ApiPropertyOptional({ description: 'Referrer URL' })
  @IsOptional()
  @IsString()
  referrer?: string;

  @ApiPropertyOptional({ description: 'User ID' })
  @IsOptional()
  @IsString()
  userId?: string;

  @ApiPropertyOptional({ description: 'Session ID' })
  @IsOptional()
  @IsString()
  sessionId?: string;

  @ApiPropertyOptional({ description: 'Additional properties' })
  @IsOptional()
  @IsObject()
  properties?: Record<string, any>;
}

export class TrackConversionDto {
  @ApiProperty({ description: 'Conversion name' })
  @IsString()
  conversionName!: string;

  @ApiPropertyOptional({ description: 'Conversion value' })
  @IsOptional()
  @IsNumber()
  value?: number;

  @ApiPropertyOptional({ description: 'Currency code (e.g., USD)' })
  @IsOptional()
  @IsString()
  currency?: string;

  @ApiPropertyOptional({ description: 'User ID' })
  @IsOptional()
  @IsString()
  userId?: string;

  @ApiPropertyOptional({ description: 'User email' })
  @IsOptional()
  @IsEmail()
  userEmail?: string;

  @ApiPropertyOptional({ description: 'Additional properties' })
  @IsOptional()
  @IsObject()
  properties?: Record<string, any>;
}
