import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import {
  IsDateString,
  IsEnum,
  IsNotEmpty,
  IsOptional,
  IsString,
} from 'class-validator';
import { Sex } from '../patient.entity';

export class CreatePatientDto {
  @ApiProperty({ example: 'MRN-004' })
  @IsString()
  @IsNotEmpty()
  mrn: string;

  @ApiProperty({ example: 'John' })
  @IsString()
  @IsNotEmpty()
  firstName: string;

  @ApiProperty({ example: 'Smith' })
  @IsString()
  @IsNotEmpty()
  lastName: string;

  @ApiProperty({ example: '1960-08-21' })
  @IsDateString()
  dateOfBirth: string;

  @ApiProperty({ enum: Sex, example: Sex.Male })
  @IsEnum(Sex)
  sex: Sex;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  address?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  primaryConditions?: string;
}
