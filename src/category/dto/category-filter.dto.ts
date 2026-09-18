import { ApiPropertyOptional } from '@nestjs/swagger';
import { Transform, Type } from 'class-transformer';
import {
  IsBoolean,
  IsIn,
  IsInt,
  IsOptional,
  IsString,
  Max,
  MaxLength,
  Min,
} from 'class-validator';

export class CategoryFilterDto {
  @ApiPropertyOptional({
    example: 'furniture',
    description: 'Search category by name or description',
  })
  @Transform(({ value }) =>
    typeof value === 'string' ? value.trim() : value,
  )
  @IsOptional()
  @IsString()
  @MaxLength(100)
  search?: string;

  @ApiPropertyOptional({
    example: true,
    description: 'Filter categories by active status',
    default: true,
  })
  @Transform(({ value }) => {
    if (typeof value === 'boolean') return value;
    if (value === 'true') return true;
    if (value === 'false') return false;
    return value;
  })
  @IsOptional()
  @IsBoolean()
  isDeleted?: boolean;

  @ApiPropertyOptional({
    example: 1,
    description: 'Page number',
    default: 1,
  })
  @Type(() => Number)
  @IsOptional()
  @IsInt()
  @Min(1)
  page?: number = 1;

  @ApiPropertyOptional({
    example: 10,
    description: 'Number of categories per page',
    default: 10,
  })
  @Type(() => Number)
  @IsOptional()
  @IsInt()
  @Min(1)
  @Max(100)
  limit?: number = 10;

  @ApiPropertyOptional({
    example: 'name',
    description: 'Field used for sorting',
    enum: ['name', 'createdAt', 'updatedAt'],
    default: 'name',
  })
  @IsOptional()
  @IsString()
  @IsIn(['name', 'createdAt', 'updatedAt'])
  sortBy?: string = 'name';

  @ApiPropertyOptional({
    example: 'asc',
    description: 'Sort direction',
    enum: ['asc', 'desc'],
    default: 'asc',
  })
  @IsOptional()
  @IsString()
  @IsIn(['asc', 'desc'])
  sortOrder?: 'asc' | 'desc' = 'asc';
}