import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { Transform, Type } from 'class-transformer';
import {
  IsEnum,
  IsInt,
  IsNotEmpty,
  IsNumberString,
  IsOptional,
  IsString,
  Max,
  MaxLength,
  Min,
} from 'class-validator';
import { EntityType } from '../../mongo/enums';

export class TagAutocompleteDto {

  @ApiPropertyOptional({
    example: 'Hot Lead',
    description: 'Search tag by name',
  })
  @Transform(({ value }) =>
    typeof value === 'string' ? value.trim() : value,
  )
  @IsOptional()
  @IsString()
  @MaxLength(100)
  search?: string;

  @ApiPropertyOptional({
    description: 'Entity type',
    enum: EntityType,
    example: EntityType.BUSINESS,
  })
  @IsOptional()
  @IsEnum(EntityType)
  entityType?: EntityType;

  @ApiPropertyOptional({
    example: '10',
    default: '10',
    description: 'Number of tags per page',
  })
  @IsOptional()
  @IsNumberString()
  limit?: string;
}