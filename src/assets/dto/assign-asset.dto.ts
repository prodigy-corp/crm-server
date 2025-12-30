import { IsNotEmpty, IsString, IsOptional } from 'class-validator';

export class AssignAssetDto {
  @IsNotEmpty()
  @IsString()
  employeeId: string;

  @IsOptional()
  @IsString()
  condition?: string;
}
