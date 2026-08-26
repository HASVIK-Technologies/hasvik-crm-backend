import {
  IsDateString,
  IsEnum,
  IsMongoId,
  IsOptional,
  IsString,
} from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { FollowUpStatus, FollowUpType } from 'src/mongo/interfaces';


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
    enum: FollowUpStatus,
    example: FollowUpStatus.PENDING,
    default: FollowUpStatus.PENDING,
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