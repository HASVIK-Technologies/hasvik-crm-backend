import { ApiPropertyOptional } from '@nestjs/swagger';
import {
  IsDateString,
  IsOptional,
  IsString,
  MaxLength,
} from 'class-validator';

export class RenewSubscriptionDto {
  @ApiPropertyOptional({
    example: '2027-01-15T00:00:00.000Z',
    description:
      'Optional requested renewal end date in ISO 8601 format. If omitted, the service calculates it from the subscription plan billing cycle.',
  })
  @IsOptional()
  @IsDateString()
  endDate?: string;

  @ApiPropertyOptional({
    example: 'Subscription renewed after manual approval',
    description: 'Internal note about the renewal',
    maxLength: 1000,
  })
  @IsOptional()
  @IsString()
  @MaxLength(1000)
  notes?: string;
}
