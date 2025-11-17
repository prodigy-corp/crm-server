import {
  IsString,
  IsOptional,
  IsUrl,
  IsEmail,
  MinLength,
  MaxLength,
  IsObject,
} from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class SocialLinksDto {
  @ApiPropertyOptional({ example: 'https://facebook.com/yourpage' })
  @IsOptional()
  @IsUrl({}, { message: 'Facebook URL must be valid' })
  facebook?: string;

  @ApiPropertyOptional({ example: 'https://twitter.com/yourhandle' })
  @IsOptional()
  @IsUrl({}, { message: 'Twitter URL must be valid' })
  twitter?: string;

  @ApiPropertyOptional({ example: 'https://instagram.com/yourprofile' })
  @IsOptional()
  @IsUrl({}, { message: 'Instagram URL must be valid' })
  instagram?: string;

  @ApiPropertyOptional({ example: 'https://linkedin.com/company/yourcompany' })
  @IsOptional()
  @IsUrl({}, { message: 'LinkedIn URL must be valid' })
  linkedin?: string;

  @ApiPropertyOptional({ example: 'https://youtube.com/channel/yourchannel' })
  @IsOptional()
  @IsUrl({}, { message: 'YouTube URL must be valid' })
  youtube?: string;

  @ApiPropertyOptional({ example: 'https://github.com/yourorg' })
  @IsOptional()
  @IsUrl({}, { message: 'GitHub URL must be valid' })
  github?: string;

  // Index signature for Prisma JSON compatibility
  [key: string]: string | undefined;
}

export class UpdateSiteSettingsDto {
  @ApiPropertyOptional({ example: 'My Awesome Site' })
  @IsOptional()
  @IsString()
  @MinLength(2, { message: 'Site name must be at least 2 characters' })
  @MaxLength(255, { message: 'Site name must not exceed 255 characters' })
  siteName?: string;

  @ApiPropertyOptional({ example: 'https://example.com' })
  @IsOptional()
  @IsUrl({}, { message: 'Site URL must be valid' })
  @MaxLength(500, { message: 'Site URL must not exceed 500 characters' })
  siteUrl?: string;

  @ApiPropertyOptional({ example: 'A brief description of your site' })
  @IsOptional()
  @IsString()
  @MaxLength(500, {
    message: 'Site description must not exceed 500 characters',
  })
  siteDescription?: string;

  @ApiPropertyOptional({ example: 'https://example.com/logo.png' })
  @IsOptional()
  @IsUrl({}, { message: 'Logo URL must be valid' })
  @MaxLength(500, { message: 'Logo URL must not exceed 500 characters' })
  logo?: string;

  @ApiPropertyOptional({ example: 'https://example.com/favicon.ico' })
  @IsOptional()
  @IsUrl({}, { message: 'Favicon URL must be valid' })
  @MaxLength(500, { message: 'Favicon URL must not exceed 500 characters' })
  favicon?: string;

  @ApiPropertyOptional({ example: 'contact@example.com' })
  @IsOptional()
  @IsEmail({}, { message: 'Contact email must be valid' })
  @MaxLength(255, { message: 'Contact email must not exceed 255 characters' })
  contactEmail?: string;

  @ApiPropertyOptional({ example: '+1 (555) 123-4567' })
  @IsOptional()
  @IsString()
  @MaxLength(50, { message: 'Contact phone must not exceed 50 characters' })
  contactPhone?: string;

  @ApiPropertyOptional({ example: '123 Main St, City, Country' })
  @IsOptional()
  @IsString()
  contactAddress?: string;

  @ApiPropertyOptional({ type: SocialLinksDto })
  @IsOptional()
  @IsObject()
  socialLinks?: SocialLinksDto;

  @ApiPropertyOptional({
    example: 'Mon-Fri: 9:00 AM - 5:00 PM\nSat-Sun: Closed',
  })
  @IsOptional()
  @IsString()
  businessHours?: string;

  @ApiPropertyOptional({ example: 'UTC' })
  @IsOptional()
  @IsString()
  @MaxLength(100, { message: 'Timezone must not exceed 100 characters' })
  timezone?: string;

  @ApiPropertyOptional({ example: 'en' })
  @IsOptional()
  @IsString()
  @MaxLength(10, { message: 'Language must not exceed 10 characters' })
  language?: string;

  @ApiPropertyOptional({ example: 'USD' })
  @IsOptional()
  @IsString()
  @MaxLength(10, { message: 'Currency must not exceed 10 characters' })
  currency?: string;
}
