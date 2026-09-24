import {
  IsDateString,
  IsEnum,
  IsInt,
  IsMongoId,
  IsOptional,
  IsString,
  Min,
} from 'class-validator';
import { ApiPropertyOptional } from '@nestjs/swagger';
import { FollowUpStatus, FollowUpType } from 'src/mongo/enums';

export class UpdateFollowUpDto {
  @ApiPropertyOptional({
    example: '66aad3aed93975bc640ca81b',
    description: 'Business ID associated with the follow-up',
  })
  @IsOptional()
  @IsMongoId()
  businessId?: string;

  @ApiPropertyOptional({
    example: '66aad3aed93975bc640ca82c',
    description: 'User ID assigned to the follow-up',
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
    example: '2026-09-30T10:30:00.000Z',
    description: 'Scheduled date and time of the follow-up',
  })
  @IsOptional()
  @IsDateString()
  scheduledAt?: string;

  @ApiPropertyOptional({
    example: 30,
    description: 'Reminder time before the scheduled follow-up, in minutes',
    minimum: 0,
  })
  @IsOptional()
  @IsInt()
  @Min(0)
  reminderInMinutes?: number;

  @ApiPropertyOptional({
    example: 'Discuss pricing and product requirements',
    description: 'Notes related to the follow-up',
  })
  @IsOptional()
  @IsString()
  notes?: string;
}