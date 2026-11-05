import { ApiPropertyOptional } from '@nestjs/swagger';
import { Transform, Type } from 'class-transformer';
import {
  IsBoolean,
  IsEnum,
  IsInt,
  IsNumberString,
  IsOptional,
  IsString,
  Max,
  MaxLength,
  Min,
} from 'class-validator';
import { EntityType } from '../../mongo/enums';


export class QueryTagDto {
  @ApiPropertyOptional({
    example: EntityType.BUSINESS,
    enum: EntityType,
    description: 'Type of entity',
  })
  @IsOptional()
  @IsEnum(EntityType)
  entityType!: EntityType;

  @ApiPropertyOptional({
    description: 'Search tags by name or key',
    example: 'Hot Lead',
  })
  @IsOptional()
  @Transform(({ value }) =>
    typeof value === 'string' ? value.trim() : value,
  )
  @IsString()
  @MaxLength(50)
  search?: string;

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
    description: 'Number of businesses per page',
  })
  @IsOptional()
  @IsNumberString()
  limit?: string;
}