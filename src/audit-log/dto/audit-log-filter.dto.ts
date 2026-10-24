import { ApiPropertyOptional } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import {
  IsEnum,
  IsIn,
  IsInt,
  IsMongoId,
  IsOptional,
  Max,
  Min,
} from 'class-validator';
import { AuditLogAction, AuditLogEntityType } from '../../mongo/enums';

export class AuditLogFilterDto {
  @ApiPropertyOptional({ example: AuditLogAction.CREATE, enum: AuditLogAction })
  @IsOptional()
  @IsEnum(AuditLogAction)
  action!: AuditLogAction;

  @ApiPropertyOptional({ example: AuditLogEntityType.BUSINESS, enum: AuditLogEntityType })
  @IsOptional()
  @IsEnum(AuditLogEntityType)
  entityType?: AuditLogEntityType;

  @ApiPropertyOptional({ example: '665c12345678901234567890' })
  @IsOptional()
  @IsMongoId()
  entityId?: string;

  @ApiPropertyOptional({ example: '665c12345678901234567890' })
  @IsOptional()
  @IsMongoId()
  userId?: string;

  @ApiPropertyOptional({ example: 1, default: 1 })
  @Type(() => Number)
  @IsOptional()
  @IsInt()
  @Min(1)
  page = 1;

  @ApiPropertyOptional({ example: 10, default: 10 })
  @Type(() => Number)
  @IsOptional()
  @IsInt()
  @Min(1)
  @Max(100)
  limit = 10;

  @ApiPropertyOptional({
    example: 'desc',
    enum: ['asc', 'desc'],
    default: 'desc',
  })
  @IsOptional()
  @IsIn(['asc', 'desc'])
  sortOrder: 'asc' | 'desc' = 'desc';
}
