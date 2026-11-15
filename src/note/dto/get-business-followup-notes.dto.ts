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