import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import {
  IsString,
  IsOptional,
  IsEmail,
  IsEnum,
  IsInt,
  IsNumber,
  IsDateString,
  MaxLength,
} from 'class-validator';
import { Type } from 'class-transformer';
import {
  EmployeeStatus,
  AttendanceStatus,
  SalaryPaymentStatus,
} from '@prisma/client';

export class CreateAdminEmployeeDto {
  @ApiPropertyOptional({ example: 'EMP-001' })
  @IsOptional()
  @IsString()
  employeeCode?: string;

  @ApiProperty({ example: 'John Doe' })
  @IsString()
  name!: string;

  @ApiPropertyOptional({ example: 'Software Engineer' })
  @IsOptional()
  @IsString()
  designation?: string;

  @ApiPropertyOptional({ example: 'John Doe Sr.' })
  @IsOptional()
  @IsString()
  fatherName?: string;

  @ApiPropertyOptional({ example: 'Jane Doe' })
  @IsOptional()
  @IsString()
  motherName?: string;

  @ApiPropertyOptional({ example: '1995-01-15' })
  @IsOptional()
  @IsDateString()
  dateOfBirth?: string;

  @ApiPropertyOptional({ example: '1234567890' })
  @IsOptional()
  @IsString()
  nationalId?: string;

  @ApiPropertyOptional({ example: 'O+' })
  @IsOptional()
  @IsString()
  @MaxLength(10)
  bloodGroup?: string;

  @ApiProperty({ example: '2024-01-01' })
  @IsDateString()
  joiningDate!: string;

  @ApiProperty({ example: 30000 })
  @Type(() => Number)
  @IsNumber()
  baseSalary!: number;

  @ApiPropertyOptional({ example: '+8801712345678' })
  @IsOptional()
  @IsString()
  mobileNumber?: string;

  @ApiPropertyOptional({ example: '+8801812345678' })
  @IsOptional()
  @IsString()
  alternativeContactNumber?: string;

  @ApiPropertyOptional({ example: '+8801912345678' })
  @IsOptional()
  @IsString()
  corporateContactNumber?: string;

  @ApiPropertyOptional({ example: 'employee@example.com' })
  @IsOptional()
  @IsEmail()
  emailAddress?: string;

  @ApiPropertyOptional({ example: 'https://facebook.com/profile' })
  @IsOptional()
  @IsString()
  facebookProfileLink?: string;

  @ApiPropertyOptional({ example: '1234567890123456' })
  @IsOptional()
  @IsString()
  bankAccountNumber?: string;

  @ApiPropertyOptional({ example: 'Dhanmondi Branch' })
  @IsOptional()
  @IsString()
  branchName?: string;

  @ApiPropertyOptional({ example: 'ABC Bank' })
  @IsOptional()
  @IsString()
  bankName?: string;

  @ApiPropertyOptional({ example: '+8801711111111' })
  @IsOptional()
  @IsString()
  fatherContactNumber?: string;

  @ApiPropertyOptional({ example: '+8801722222222' })
  @IsOptional()
  @IsString()
  motherContactNumber?: string;

  @ApiPropertyOptional({ example: '+8801733333333' })
  @IsOptional()
  @IsString()
  emergencyContactNumber?: string;

  @ApiPropertyOptional({ example: '123456' })
  @IsOptional()
  @IsString()
  sscRoll?: string;

  @ApiPropertyOptional({ example: '2020123456' })
  @IsOptional()
  @IsString()
  sscRegistrationNumber?: string;

  @ApiPropertyOptional({ example: 2010 })
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  sscPassingYear?: number;

  @ApiPropertyOptional({ example: 'Dhaka' })
  @IsOptional()
  @IsString()
  sscBoard?: string;

  @ApiPropertyOptional({ example: 'GPA 5.00' })
  @IsOptional()
  @IsString()
  sscResult?: string;

  @ApiPropertyOptional({ example: '654321' })
  @IsOptional()
  @IsString()
  hscRoll?: string;

  @ApiPropertyOptional({ example: '2012123456' })
  @IsOptional()
  @IsString()
  hscRegistrationNumber?: string;

  @ApiPropertyOptional({ example: 2012 })
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  hscPassingYear?: number;

  @ApiPropertyOptional({ example: 'Dhaka' })
  @IsOptional()
  @IsString()
  hscBoard?: string;

  @ApiPropertyOptional({ example: 'GPA 5.00' })
  @IsOptional()
  @IsString()
  hscResult?: string;

  @ApiPropertyOptional({ example: '789012' })
  @IsOptional()
  @IsString()
  honorsRoll?: string;

  @ApiPropertyOptional({ example: '2014123456' })
  @IsOptional()
  @IsString()
  honorsRegistrationNumber?: string;

  @ApiPropertyOptional({ example: 2016 })
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  honorsPassingYear?: number;

  @ApiPropertyOptional({ example: 'Dhaka University' })
  @IsOptional()
  @IsString()
  honorsInstitutionName?: string;

  @ApiPropertyOptional({ example: 'Computer Science' })
  @IsOptional()
  @IsString()
  honorsSubject?: string;

  @ApiPropertyOptional({ example: 'CGPA 3.80' })
  @IsOptional()
  @IsString()
  honorsResult?: string;

  @ApiPropertyOptional({ enum: EmployeeStatus, example: EmployeeStatus.ACTIVE })
  @IsOptional()
  @IsEnum(EmployeeStatus)
  status?: EmployeeStatus;

  @ApiPropertyOptional({
    example: 'uuid-of-user',
    description: 'User ID to link this employee to an existing user account',
  })
  @IsOptional()
  @IsString()
  userId?: string;
}

export class UpdateAdminEmployeeDto {
  @ApiPropertyOptional({ example: 'EMP-001' })
  @IsOptional()
  @IsString()
  employeeCode?: string;

  @ApiPropertyOptional({ example: 'John Doe' })
  @IsOptional()
  @IsString()
  name?: string;

  @ApiPropertyOptional({ example: 'Software Engineer' })
  @IsOptional()
  @IsString()
  designation?: string;

  @ApiPropertyOptional({ example: 'John Doe Sr.' })
  @IsOptional()
  @IsString()
  fatherName?: string;

  @ApiPropertyOptional({ example: 'Jane Doe' })
  @IsOptional()
  @IsString()
  motherName?: string;

  @ApiPropertyOptional({ example: '1995-01-15' })
  @IsOptional()
  @IsDateString()
  dateOfBirth?: string;

  @ApiPropertyOptional({ example: '1234567890' })
  @IsOptional()
  @IsString()
  nationalId?: string;

  @ApiPropertyOptional({ example: 'O+' })
  @IsOptional()
  @IsString()
  @MaxLength(10)
  bloodGroup?: string;

  @ApiPropertyOptional({ example: '2024-01-01' })
  @IsOptional()
  @IsDateString()
  joiningDate?: string;

  @ApiPropertyOptional({ example: '2025-01-31' })
  @IsOptional()
  @IsDateString()
  resignDate?: string;

  @ApiPropertyOptional({ example: 32000 })
  @IsOptional()
  @Type(() => Number)
  @IsNumber()
  baseSalary?: number;

  @ApiPropertyOptional({ example: '+8801712345678' })
  @IsOptional()
  @IsString()
  mobileNumber?: string;

  @ApiPropertyOptional({ example: '+8801812345678' })
  @IsOptional()
  @IsString()
  alternativeContactNumber?: string;

  @ApiPropertyOptional({ example: '+8801912345678' })
  @IsOptional()
  @IsString()
  corporateContactNumber?: string;

  @ApiPropertyOptional({ example: 'employee@example.com' })
  @IsOptional()
  @IsEmail()
  emailAddress?: string;

  @ApiPropertyOptional({ example: 'https://facebook.com/profile' })
  @IsOptional()
  @IsString()
  facebookProfileLink?: string;

  @ApiPropertyOptional({ example: '1234567890123456' })
  @IsOptional()
  @IsString()
  bankAccountNumber?: string;

  @ApiPropertyOptional({ example: 'Dhanmondi Branch' })
  @IsOptional()
  @IsString()
  branchName?: string;

  @ApiPropertyOptional({ example: 'ABC Bank' })
  @IsOptional()
  @IsString()
  bankName?: string;

  @ApiPropertyOptional({ example: '+8801711111111' })
  @IsOptional()
  @IsString()
  fatherContactNumber?: string;

  @ApiPropertyOptional({ example: '+8801722222222' })
  @IsOptional()
  @IsString()
  motherContactNumber?: string;

  @ApiPropertyOptional({ example: '+8801733333333' })
  @IsOptional()
  @IsString()
  emergencyContactNumber?: string;

  @ApiPropertyOptional({ example: '123456' })
  @IsOptional()
  @IsString()
  sscRoll?: string;

  @ApiPropertyOptional({ example: '2020123456' })
  @IsOptional()
  @IsString()
  sscRegistrationNumber?: string;

  @ApiPropertyOptional({ example: 2010 })
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  sscPassingYear?: number;

  @ApiPropertyOptional({ example: 'Dhaka' })
  @IsOptional()
  @IsString()
  sscBoard?: string;

  @ApiPropertyOptional({ example: 'GPA 5.00' })
  @IsOptional()
  @IsString()
  sscResult?: string;

  @ApiPropertyOptional({ example: '654321' })
  @IsOptional()
  @IsString()
  hscRoll?: string;

  @ApiPropertyOptional({ example: '2012123456' })
  @IsOptional()
  @IsString()
  hscRegistrationNumber?: string;

  @ApiPropertyOptional({ example: 2012 })
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  hscPassingYear?: number;

  @ApiPropertyOptional({ example: 'Dhaka' })
  @IsOptional()
  @IsString()
  hscBoard?: string;

  @ApiPropertyOptional({ example: 'GPA 5.00' })
  @IsOptional()
  @IsString()
  hscResult?: string;

  @ApiPropertyOptional({ example: '789012' })
  @IsOptional()
  @IsString()
  honorsRoll?: string;

  @ApiPropertyOptional({ example: '2014123456' })
  @IsOptional()
  @IsString()
  honorsRegistrationNumber?: string;

  @ApiPropertyOptional({ example: 2016 })
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  honorsPassingYear?: number;

  @ApiPropertyOptional({ example: 'Dhaka University' })
  @IsOptional()
  @IsString()
  honorsInstitutionName?: string;

  @ApiPropertyOptional({ example: 'Computer Science' })
  @IsOptional()
  @IsString()
  honorsSubject?: string;

  @ApiPropertyOptional({ example: 'CGPA 3.80' })
  @IsOptional()
  @IsString()
  honorsResult?: string;

  @ApiPropertyOptional({ enum: EmployeeStatus, example: EmployeeStatus.ACTIVE })
  @IsOptional()
  @IsEnum(EmployeeStatus)
  status?: EmployeeStatus;

  @ApiPropertyOptional({ example: 'uuid-of-user' })
  @IsOptional()
  @IsString()
  userId?: string;
}

export class AdminEmployeeQueryDto {
  @ApiPropertyOptional({ example: 1 })
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  page?: number;

  @ApiPropertyOptional({ example: 10 })
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  limit?: number;

  @ApiPropertyOptional({ example: 'john' })
  @IsOptional()
  @IsString()
  search?: string;

  @ApiPropertyOptional({ enum: EmployeeStatus })
  @IsOptional()
  @IsEnum(EmployeeStatus)
  status?: EmployeeStatus;

  @ApiPropertyOptional({ example: 'createdAt' })
  @IsOptional()
  @IsString()
  sortBy?: string;

  @ApiPropertyOptional({ example: 'desc' })
  @IsOptional()
  @IsString()
  sortOrder?: 'asc' | 'desc';
}

export class EmployeeAttendanceQueryDto {
  @ApiPropertyOptional({ example: 1 })
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  page?: number;

  @ApiPropertyOptional({ example: 10 })
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  limit?: number;

  @ApiPropertyOptional({ example: '2024-01-01' })
  @IsOptional()
  @IsDateString()
  fromDate?: string;

  @ApiPropertyOptional({ example: '2024-01-31' })
  @IsOptional()
  @IsDateString()
  toDate?: string;

  @ApiPropertyOptional({ enum: AttendanceStatus })
  @IsOptional()
  @IsEnum(AttendanceStatus)
  status?: AttendanceStatus;
}

export class EmployeeAttendanceActionDto {
  @ApiPropertyOptional({ example: '2024-01-15' })
  @IsOptional()
  @IsDateString()
  date?: string;
}

export class UpsertEmployeeAttendanceDto {
  @ApiProperty({ example: '2024-01-15' })
  @IsDateString()
  date!: string;

  @ApiProperty({ enum: AttendanceStatus, example: AttendanceStatus.PRESENT })
  @IsEnum(AttendanceStatus)
  status!: AttendanceStatus;

  @ApiPropertyOptional({ example: '2024-01-15T09:00:00.000Z' })
  @IsOptional()
  @IsDateString()
  checkInAt?: string;

  @ApiPropertyOptional({ example: '2024-01-15T17:30:00.000Z' })
  @IsOptional()
  @IsDateString()
  checkOutAt?: string;

  @ApiPropertyOptional({ example: 8.5 })
  @IsOptional()
  @Type(() => Number)
  @IsNumber()
  workingHours?: number;
}

export class CreateEmployeeSalaryIncrementDto {
  @ApiProperty({ example: 35000 })
  @Type(() => Number)
  @IsNumber()
  newSalary!: number;

  @ApiProperty({ example: '2024-06-01' })
  @IsDateString()
  effectiveFrom!: string;

  @ApiPropertyOptional({ example: 'Annual performance increment' })
  @IsOptional()
  @IsString()
  reason?: string;
}

export class CreateEmployeeSalaryPaymentDto {
  @ApiProperty({ example: 1 })
  @Type(() => Number)
  @IsInt()
  month!: number;

  @ApiProperty({ example: 2024 })
  @Type(() => Number)
  @IsInt()
  year!: number;

  @ApiProperty({ example: 30000 })
  @Type(() => Number)
  @IsNumber()
  basicSalary!: number;

  @ApiProperty({ example: 32000 })
  @Type(() => Number)
  @IsNumber()
  grossSalary!: number;

  @ApiProperty({ example: 2000 })
  @Type(() => Number)
  @IsNumber()
  totalDeduction!: number;

  @ApiProperty({ example: 30000 })
  @Type(() => Number)
  @IsNumber()
  netPayable!: number;

  @ApiPropertyOptional({ example: '2024-01-31' })
  @IsOptional()
  @IsDateString()
  paymentDate?: string;

  @ApiPropertyOptional({ enum: SalaryPaymentStatus })
  @IsOptional()
  @IsEnum(SalaryPaymentStatus)
  status?: SalaryPaymentStatus;
}

export class EmployeeSalaryPaymentQueryDto {
  @ApiPropertyOptional({ example: 1 })
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  page?: number;

  @ApiPropertyOptional({ example: 10 })
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  limit?: number;

  @ApiPropertyOptional({ example: 1 })
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  month?: number;

  @ApiPropertyOptional({ example: 2024 })
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  year?: number;

  @ApiPropertyOptional({ enum: SalaryPaymentStatus })
  @IsOptional()
  @IsEnum(SalaryPaymentStatus)
  status?: SalaryPaymentStatus;
}

export class ResignEmployeeDto {
  @ApiPropertyOptional({ example: '2024-01-31' })
  @IsOptional()
  @IsDateString()
  resignDate?: string;
}
