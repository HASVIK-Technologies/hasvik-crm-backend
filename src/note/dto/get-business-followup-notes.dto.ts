import { ApiPropertyOptional } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import {
  IsMongoId,
  IsInt,
  IsOptional,
  Min,
  Max,
  IsNumberString,
  IsEnum,
  IsString,
} from 'class-validator';

export class GetBusinessFollowUpNotesQueryDto {
  @ApiPropertyOptional({
    example: '665c12345678901234567890',
    description: 'Filter follow-ups by business ID',
  })
  @IsOptional()
  @IsMongoId()
  businessId?: string;

  @ApiPropertyOptional({
    example: '1',
    default: '1',
    description: 'Page number',
  })
  @IsOptional()
  @IsNumberString()
  page?: string;

  @ApiPropertyOptional({
    example: '10',
    default: '10',
    description: 'Number of follow-ups per page',
  })
  @IsOptional()
  @IsNumberString()
  limit?: string;


  @IsOptional()
  @IsString()
  sortBy?: string;

  @IsOptional()
  @IsString()
  sortOrder?: string = "desc";
}