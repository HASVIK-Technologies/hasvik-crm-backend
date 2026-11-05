
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { Transform } from 'class-transformer';
import {
  IsEnum,
  IsHexColor,
  IsNotEmpty,
  IsOptional,
  IsString,
  MaxLength,
  MinLength,
} from 'class-validator';
import {EntityType} from '../../mongo/enums'

export class CreateTagDto {
  @ApiProperty({
    description: 'Name of the tag',
    example: 'Hot Lead',
    minLength: 2,
    maxLength: 50,
  })
  @Transform(({ value }) =>
    typeof value === 'string'
      ? value.trim().replace(/\s+/g, ' ')
      : value,
  )
  @IsString()
  @IsNotEmpty()
  @MinLength(2)
  @MaxLength(50)
  name!: string;

  @ApiPropertyOptional({
    description: 'Hexadecimal color code for the tag',
    example: '#EF4444',
    default: '#64748B',
  })
  @IsOptional()
  @IsString()
  @IsHexColor()
  color?: string;

  @ApiPropertyOptional({
    description: 'Optional description of the tag',
    example: 'High-potential business lead',
    maxLength: 250,
  })
  @IsOptional()
  @IsString()
  @MaxLength(250)
  @Transform(({ value }) =>
    typeof value === 'string' ? value.trim() : value,
  )
  description?: string;

  @ApiProperty({
    example: EntityType.BUSINESS,
    enum: EntityType,
    description: 'Type of entity',
  })
  @IsEnum(EntityType)
  entityType!: EntityType;
}
