import {
  IsString,
  IsOptional,
  IsUrl,
  IsArray,
  IsBoolean,
  IsIn,
  MaxLength,
  IsObject,
} from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class RobotsDirectivesDto {
  @ApiPropertyOptional({ example: true })
  @IsOptional()
  @IsBoolean()
  index?: boolean;

  @ApiPropertyOptional({ example: true })
  @IsOptional()
  @IsBoolean()
  follow?: boolean;

  @ApiPropertyOptional({ example: false })
  @IsOptional()
  @IsBoolean()
  noarchive?: boolean;

  @ApiPropertyOptional({ example: false })
  @IsOptional()
  @IsBoolean()
  nosnippet?: boolean;

  @ApiPropertyOptional({ example: false })
  @IsOptional()
  @IsBoolean()
  noimageindex?: boolean;

  // Index signature for Prisma JSON compatibility
  [key: string]: boolean | undefined;
}

export class UpdateSEOSettingsDto {
  @ApiPropertyOptional({ example: 'Your Site Title' })
  @IsOptional()
  @IsString()
  @MaxLength(70, { message: 'Meta title must not exceed 70 characters' })
  metaTitle?: string;

  @ApiPropertyOptional({ example: 'Brief description of your site' })
  @IsOptional()
  @IsString()
  @MaxLength(160, {
    message: 'Meta description must not exceed 160 characters',
  })
  metaDescription?: string;

  @ApiPropertyOptional({ example: ['keyword1', 'keyword2', 'keyword3'] })
  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  metaKeywords?: string[];

  @ApiPropertyOptional({ example: 'Title for social media' })
  @IsOptional()
  @IsString()
  @MaxLength(70, { message: 'OG title must not exceed 70 characters' })
  ogTitle?: string;

  @ApiPropertyOptional({ example: 'Description for social media' })
  @IsOptional()
  @IsString()
  @MaxLength(160, { message: 'OG description must not exceed 160 characters' })
  ogDescription?: string;

  @ApiPropertyOptional({ example: 'https://example.com/og-image.jpg' })
  @IsOptional()
  @IsUrl({}, { message: 'OG image must be a valid URL' })
  @MaxLength(500, { message: 'OG image URL must not exceed 500 characters' })
  ogImage?: string;

  @ApiPropertyOptional({
    example: 'summary_large_image',
    enum: ['summary', 'summary_large_image', 'app', 'player'],
  })
  @IsOptional()
  @IsString()
  @IsIn(['summary', 'summary_large_image', 'app', 'player'], {
    message: 'Invalid Twitter card type',
  })
  twitterCard?: string;

  @ApiPropertyOptional({ example: 'Title for Twitter' })
  @IsOptional()
  @IsString()
  @MaxLength(70, { message: 'Twitter title must not exceed 70 characters' })
  twitterTitle?: string;

  @ApiPropertyOptional({ example: 'Description for Twitter' })
  @IsOptional()
  @IsString()
  @MaxLength(160, {
    message: 'Twitter description must not exceed 160 characters',
  })
  twitterDescription?: string;

  @ApiPropertyOptional({ example: 'https://example.com/twitter-image.jpg' })
  @IsOptional()
  @IsUrl({}, { message: 'Twitter image must be a valid URL' })
  @MaxLength(500, {
    message: 'Twitter image URL must not exceed 500 characters',
  })
  twitterImage?: string;

  @ApiPropertyOptional({ example: '@yoursite' })
  @IsOptional()
  @IsString()
  @MaxLength(100, { message: 'Twitter site must not exceed 100 characters' })
  twitterSite?: string;

  @ApiPropertyOptional({ example: '@creator' })
  @IsOptional()
  @IsString()
  @MaxLength(100, { message: 'Twitter creator must not exceed 100 characters' })
  twitterCreator?: string;

  @ApiPropertyOptional({ example: 'https://example.com' })
  @IsOptional()
  @IsUrl({}, { message: 'Canonical URL must be valid' })
  @MaxLength(500, { message: 'Canonical URL must not exceed 500 characters' })
  canonicalUrl?: string;

  @ApiPropertyOptional({ type: RobotsDirectivesDto })
  @IsOptional()
  @IsObject()
  robotsDirectives?: RobotsDirectivesDto;

  @ApiPropertyOptional({ example: {} })
  @IsOptional()
  @IsObject()
  structuredData?: any;

  @ApiPropertyOptional({ example: 'google-site-verification-code' })
  @IsOptional()
  @IsString()
  @MaxLength(255, {
    message: 'Google site verification must not exceed 255 characters',
  })
  googleSiteVerification?: string;

  @ApiPropertyOptional({ example: 'G-XXXXXXXXXX' })
  @IsOptional()
  @IsString()
  @MaxLength(100, {
    message: 'Google Analytics ID must not exceed 100 characters',
  })
  googleAnalyticsId?: string;

  @ApiPropertyOptional({ example: 'GTM-XXXXXXX' })
  @IsOptional()
  @IsString()
  @MaxLength(100, {
    message: 'Google Tag Manager ID must not exceed 100 characters',
  })
  googleTagManagerId?: string;

  @ApiPropertyOptional({ example: '123456789012345' })
  @IsOptional()
  @IsString()
  @MaxLength(100, {
    message: 'Facebook Pixel ID must not exceed 100 characters',
  })
  facebookPixelId?: string;

  @ApiPropertyOptional({ example: '123456789' })
  @IsOptional()
  @IsString()
  @MaxLength(100, { message: 'Facebook App ID must not exceed 100 characters' })
  facebookAppId?: string;
}
