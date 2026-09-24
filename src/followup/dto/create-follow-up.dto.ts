import {
  IsDateString,
  IsEnum,
  IsInt,
  IsMongoId,
  IsOptional,
  IsString,
  Min,
} from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { FollowUpStatus, FollowUpType } from 'src/mongo/enums';


export class CreateFollowUpDto {
  @ApiProperty({
    example: '665c12345678901234567890',
    description: 'Business ID for which the follow-up is created',
  })
  @IsMongoId()
  businessId!: string;

  @ApiProperty({
    example: '665c98765432109876543210',
    description: 'User ID assigned to handle the follow-up',
  })
  @IsMongoId()
  assignedTo!: string;

  @ApiProperty({
    enum: FollowUpType,
    example: FollowUpType.CALL,
    description: 'Type of follow-up',
  })
  @IsEnum(FollowUpType)
  type!: FollowUpType;

  @ApiProperty({
    example: '2026-08-28T10:30:00.000Z',
    description: 'Date and time when the follow-up is scheduled',
  })
  @IsDateString()
  scheduledAt!: string;

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