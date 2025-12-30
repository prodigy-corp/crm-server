import { IsOptional, IsString } from 'class-validator';

export class ReturnAssetDto {
  @IsOptional()
  @IsString()
  returnNote?: string;
}
