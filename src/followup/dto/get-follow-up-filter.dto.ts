import {
  IsDateString,
  IsEnum,
  IsMongoId,
  IsNumberString,
  IsOptional,
} from 'class-validator';
import { ApiPropertyOptional } from '@nestjs/swagger';

import {
  FollowUpStatus,
  FollowUpType,
} from '../../mongo/interfaces';

export class FollowUpFilterDto {
  @ApiPropertyOptional({
    example: '665c12345678901234567890',
    description: 'Filter follow-ups by business ID',
  })
  @IsOptional()
  @IsMongoId()
  businessId?: string;

  @ApiPropertyOptional({
    example: '665c98765432109876543210',
    description: 'Filter follow-ups assigned to a specific user',
  })
  @IsOptional()
  @IsMongoId()
  assignedTo?: string;

  @ApiPropertyOptional({
    enum: FollowUpStatus,
    example: FollowUpStatus.PENDING,
    description: 'Filter follow-ups by status',
  })
  @IsOptional()
  @IsEnum(FollowUpStatus)
  status?: FollowUpStatus;

  @ApiPropertyOptional({
    enum: FollowUpType,
    example: FollowUpType.CALL,
    description: 'Filter follow-ups by type',
  })
  @IsOptional()
  @IsEnum(FollowUpType)
  type?: FollowUpType;

  @ApiPropertyOptional({
    example: '2026-08-28T00:00:00.000Z',
    description: 'Return follow-ups scheduled from this date',
  })
  @IsOptional()
  @IsDateString()
  fromDate?: string;

  @ApiPropertyOptional({
    example: '2026-08-31T23:59:59.999Z',
    description: 'Return follow-ups scheduled until this date',
  })
  @IsOptional()
  @IsDateString()
  toDate?: string;

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
}