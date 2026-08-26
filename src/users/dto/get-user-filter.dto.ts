import { ApiPropertyOptional } from '@nestjs/swagger';
import { Transform, Type } from 'class-transformer';
import {
  IsOptional,
  IsString,
  IsNumber,
  Min,
  IsEnum,
} from 'class-validator';
export class UserFilterDto {

  @ApiPropertyOptional({example:"name/email/phone"})
  @IsOptional()
  @IsString()
  @Transform(({ value }) =>
    typeof value === 'string' ? value.trim() : value,
  )
  search?: string;

  @ApiPropertyOptional({ example: 'false', enum: ['true', 'false'], default: 'false', required:false })
  @IsOptional()
  @IsEnum(['true', 'false'])
  isDeleted?: string;

  @ApiPropertyOptional({
    example: '{ "name": 1, "email": 1,  "type": 1 }',
    description: '{ "name": 1, "email": 1,  "type": 1 }',
  })
  @IsOptional()
  @IsString()
  sortBy?: string;

  @ApiPropertyOptional({
    example: 1,
    description: 'Page number',
  })
  @IsOptional()
  @Type(() => Number)
  @IsNumber()
  @Min(1)
  page?: number = 1;

  @ApiPropertyOptional({
    example: 10,
    description: 'Number of items per page',
  })
  @IsOptional()
  @Type(() => Number)
  @IsNumber()
  @Min(1)
  limit?: number = 10;
}