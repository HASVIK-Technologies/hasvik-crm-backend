
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsEnum, IsOptional, IsString, MaxLength } from 'class-validator';
import { SubscriptionStatus } from 'src/mongo/enums';

export class SubscriptionStatusDto {
  @ApiProperty({
    enum: SubscriptionStatus,
    example: SubscriptionStatus.ACTIVE,
    description: 'status of the subscription',
  })
  @IsEnum(SubscriptionStatus)
  status!: SubscriptionStatus;
}
