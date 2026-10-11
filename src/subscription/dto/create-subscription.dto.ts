
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import {
  IsDateString,
  IsMongoId,
  IsOptional,
  IsString,
  MaxLength,
} from 'class-validator';

export class CreateSubscriptionDto {
  @ApiProperty({
    example: '68f123456789012345678901',
    description: 'ID of the business receiving the subscription',
  })
  @IsMongoId()
  businessId!: string;

  @ApiProperty({
    example: '68f223456789012345678902',
    description: 'ID of the subscription plan to assign',
  })
  @IsMongoId()
  planId!: string;

  @ApiPropertyOptional({
    example: '2026-10-15T00:00:00.000Z',
    description:
      'Subscription start date in ISO 8601 format. Defaults to the current date if omitted.',
  })
  @IsOptional()
  @IsDateString()
  startDate?: string;

  @ApiPropertyOptional({
    example: '2026-11-15T00:00:00.000Z',
    description:
      'Optional subscription end date in ISO 8601 format. The service should calculate this from the plan billing cycle when omitted. Lifetime plans have no end date.',
  })
  @IsOptional()
  @IsDateString()
  endDate?: string;

  @ApiPropertyOptional({
    example: false,
    description:
      'Whether the subscription should renew automatically. Defaults to false.',
    default: false,
  })
  @IsOptional()
  autoRenew?: boolean;

  @ApiPropertyOptional({
    example: 'Assigned during onboarding',
    description: 'Internal notes about this subscription',
    maxLength: 1000,
  })
  @IsOptional()
  @IsString()
  @MaxLength(1000)
  notes?: string;
}
