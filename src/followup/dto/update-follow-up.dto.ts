import {
  IsDateString,
  IsEnum,
  IsMongoId,
  IsOptional,
  IsString,
} from 'class-validator';
import { ApiPropertyOptional } from '@nestjs/swagger';
import { FollowUpStatus, FollowUpType } from 'src/mongo/interfaces';

export class UpdateFollowUpDto {
  @ApiPropertyOptional({
    example: '665c12345678901234567890',
    description: 'Business ID for the follow-up',
  })
  @IsOptional()
  @IsMongoId()
  businessId?: string;

  @ApiPropertyOptional({
    example: '665c98765432109876543210',
    description: 'User ID assigned to handle the follow-up',
  })
  @IsOptional()
  @IsMongoId()
  assignedTo?: string;

  @ApiPropertyOptional({
    enum: FollowUpType,
    example: FollowUpType.CALL,
    description: 'Type of follow-up',
  })
  @IsOptional()
  @IsEnum(FollowUpType)
  type?: FollowUpType;

  @ApiPropertyOptional({
    example: '2026-08-28T10:30:00.000Z',
    description: 'Date and time when the follow-up is scheduled',
  })
  @IsOptional()
  @IsDateString()
  scheduledAt?: string;

  @ApiPropertyOptional({
    enum: FollowUpStatus,
    example: FollowUpStatus.PENDING,
    description: 'Current status of the follow-up',
  })
  @IsOptional()
  @IsEnum(FollowUpStatus)
  status?: FollowUpStatus;

  @ApiPropertyOptional({
    example: 'Discuss pricing and product requirements',
    description: 'Notes related to the follow-up',
  })
  @IsOptional()
  @IsString()
  notes?: string;
}