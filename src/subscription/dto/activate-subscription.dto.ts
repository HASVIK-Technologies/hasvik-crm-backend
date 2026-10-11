
import { ApiPropertyOptional } from '@nestjs/swagger';
import { IsOptional, IsString, MaxLength } from 'class-validator';

export class ActivateSubscriptionDto {
  @ApiPropertyOptional({
    example: 'Subscription activated after manual verification',
    description: 'Optional internal note for the activation',
    maxLength: 1000,
  })
  @IsOptional()
  @IsString()
  @MaxLength(1000)
  notes?: string;
}
