
import {
  IsDateString,
  IsEnum,
  IsNotEmpty,
  IsObject,
  IsOptional,
  IsString,
  MaxLength,
  Matches,
} from 'class-validator';

import {
  ApiProperty,
  ApiPropertyOptional,
} from '@nestjs/swagger';

import {
  NotificationCategory,
  NotificationChannel,
} from '../../mongo/enums';

import type { NotificationVariables } from '../../mongo/enums';

export class CreateNotificationDto {
  @ApiProperty({
    enum: NotificationChannel,
    example: NotificationChannel.EMAIL,
    description: 'Notification delivery channel',
  })
  @IsEnum(NotificationChannel)
  channel!: NotificationChannel;

  @ApiProperty({
    enum: NotificationCategory,
    example: NotificationCategory.TRANSACTIONAL,
    description: 'Purpose of the notification',
  })
  @IsEnum(NotificationCategory)
  category!: NotificationCategory;

  @ApiProperty({
    example: 'customer@example.com',
    maxLength: 254,
    description: 'Email address, phone number, or WhatsApp recipient, depending on the channel',
  })
  @IsString()
  @IsNotEmpty()
  @MaxLength(254)
  recipient!: string;

  @ApiProperty({
    example: 'WELCOME_EMAIL',
    maxLength: 100,
    description: 'Unique code identifying the notification template',
  })
  @IsString()
  @IsNotEmpty()
  @MaxLength(100)
  @Matches(/^[A-Z0-9_]+$/)
  templateCode!: string;

  @ApiPropertyOptional({
    example: {
      customerName: 'Anil',
      businessName: 'HASVIK CRM',
    },
    description: 'Dynamic variables used to personalize the notification',
    type: 'object',
    additionalProperties: true,
  })
  @IsOptional()
  @IsObject()
  variables?: NotificationVariables;

  @ApiPropertyOptional({
    example: '2026-10-29T10:00:00.000Z',
    description: 'Date and time to schedule the notification in ISO 8601 format',
  })
  @IsOptional()
  @IsDateString()
  scheduledAt?: string;

  @ApiPropertyOptional({
    example: 'welcome-email-customer-123',
    maxLength: 128,
    description: 'Unique key used to prevent duplicate notification requests',
  })
  @IsOptional()
  @IsString()
  @MaxLength(128)
  idempotencyKey?: string;
}
