import { ApiPropertyOptional } from '@nestjs/swagger';
import { Transform, Type } from 'class-transformer';
import {
  IsEnum,
  IsInt,
  IsMongoId,
  IsOptional,
  IsString,
  Max,
  Min,
} from 'class-validator';

import { NoteEntityType } from '../../mongo/enums';

export class NoteFilterDto {
  @ApiPropertyOptional({
    example: 'BUSINESS',
    enum: NoteEntityType,
    description: 'Filter notes by entity type',
  })
  @IsOptional()
  @IsEnum(NoteEntityType)
  entityType?: NoteEntityType;

  @ApiPropertyOptional({
    example: '665c12345678901234567890',
    description: 'Filter notes by entity ID',
  })
  @IsOptional()
  @IsMongoId()
  entityId?: string;

  @ApiPropertyOptional({
    example: 'quotation',
    description: 'Search note content',
  })
  @Transform(({ value }) =>
    typeof value === 'string' ? value.trim() : value,
  )
  @IsOptional()
  @IsString()
  search?: string;

  @ApiPropertyOptional({
    example: 1,
    default: 1,
    description: 'Page number',
  })
  @Type(() => Number)
  @IsOptional()
  @IsInt()
  @Min(1)
  page?: number = 1;

  @ApiPropertyOptional({
    example: 10,
    default: 10,
    description: 'Number of notes per page',
  })
  @Type(() => Number)
  @IsOptional()
  @IsInt()
  @Min(1)
  @Max(100)
  limit?: number = 10;

  @ApiPropertyOptional({
    example: 'createdAt',
    enum: ['createdAt', 'updatedAt'],
    default: 'createdAt',
    description: 'Field used for sorting',
  })
  @IsOptional()
  @IsString()
  sortBy?: 'createdAt' | 'updatedAt' = 'createdAt';

  @ApiPropertyOptional({
    example: 'desc',
    enum: ['asc', 'desc'],
    default: 'desc',
    description: 'Sort direction',
  })
  @IsOptional()
  @IsString()
  sortOrder?: 'asc' | 'desc' = 'desc';
}