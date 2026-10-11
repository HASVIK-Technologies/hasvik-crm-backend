
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import {
  IsArray,
  IsBoolean,
  IsEnum,
  IsInt,
  IsNumber,
  IsOptional,
  IsString,
  Max,
  MaxLength,
  Min,
  MinLength,
  ValidateNested,
} from 'class-validator';
import { Type } from 'class-transformer';
import { SubscriptionBillingCycle } from 'src/mongo/enums/subscription-billing-cycle.enum';

export class SubscriptionPlanFeatureDto {
  @ApiProperty({
    example: 'BUSINESS_MANAGEMENT',
    description: 'Unique feature code within the plan',
  })
  @IsString()
  @MinLength(1)
  @MaxLength(50)
  code!: string;

  @ApiProperty({
    example: 'Business Management',
    description: 'Display name of the feature',
  })
  @IsString()
  @MinLength(1)
  @MaxLength(100)
  name!: string;

  @ApiPropertyOptional({
    example: 'Manage business records and customer information',
  })
  @IsOptional()
  @IsString()
  @MaxLength(250)
  description?: string;
}

export class SubscriptionPlanLimitsDto {
  @ApiProperty({
    example: 5,
    description: 'Maximum users allowed; -1 means unlimited',
    minimum: -1,
  })
  @IsInt()
  @Min(-1)
  maxUsers!: number;

  @ApiProperty({
    example: 100,
    description: 'Maximum businesses allowed; -1 means unlimited',
    minimum: -1,
  })
  @IsInt()
  @Min(-1)
  maxBusinesses!: number;

  @ApiProperty({
    example: 500,
    description: 'Maximum follow-ups allowed; -1 means unlimited',
    minimum: -1,
  })
  @IsInt()
  @Min(-1)
  maxFollowUps!: number;

  @ApiProperty({
    example: 1000,
    description: 'Maximum notes allowed; -1 means unlimited',
    minimum: -1,
  })
  @IsInt()
  @Min(-1)
  maxNotes!: number;
}

export class CreateSubscriptionPlanDto {
  @ApiProperty({
    example: 'Premium',
    maxLength: 100,
  })
  @IsString()
  @MinLength(1)
  @MaxLength(100)
  name!: string;

  @ApiProperty({
    example: 'PREMIUM',
    maxLength: 50,
  })
  @IsString()
  @MinLength(1)
  @MaxLength(50)
  code!: string;

  @ApiPropertyOptional({
    example: 'Premium plan for growing businesses',
    maxLength: 500,
  })
  @IsOptional()
  @IsString()
  @MaxLength(500)
  description?: string;

  @ApiProperty({
    example: 999,
    description: 'Subscription price in the specified currency',
    minimum: 0,
  })
  @IsNumber({ maxDecimalPlaces: 2 })
  @Min(0)
  price!: number;

  @ApiPropertyOptional({
    example: 'INR',
    default: 'INR',
    minLength: 3,
    maxLength: 3,
  })
  @IsOptional()
  @IsString()
  @MinLength(3)
  @MaxLength(3)
  currency?: string;

  @ApiProperty({
    enum: SubscriptionBillingCycle,
    example: SubscriptionBillingCycle.MONTHLY,
  })
  @IsEnum(SubscriptionBillingCycle)
  billingCycle!: SubscriptionBillingCycle;

  @ApiPropertyOptional({
    type: [SubscriptionPlanFeatureDto],
    example: [
      {
        code: 'BUSINESS_MANAGEMENT',
        name: 'Business Management',
        description: 'Manage business records',
      },
      {
        code: 'FOLLOW_UPS',
        name: 'Follow-ups',
        description: 'Track customer follow-ups',
      },
    ],
  })
  @IsOptional()
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => SubscriptionPlanFeatureDto)
  features?: SubscriptionPlanFeatureDto[];

  @ApiProperty({
    type: SubscriptionPlanLimitsDto,
    example: {
      maxUsers: 5,
      maxBusinesses: 100,
      maxFollowUps: 500,
      maxNotes: 1000,
    },
  })
  @ValidateNested()
  @Type(() => SubscriptionPlanLimitsDto)
  limits!: SubscriptionPlanLimitsDto;

  @ApiPropertyOptional({
    example: true,
    default: true,
    description: 'Whether this plan can be assigned to businesses',
  })
  @IsOptional()
  @IsBoolean()
  isActive?: boolean;
}
