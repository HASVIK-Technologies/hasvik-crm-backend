
import {
  ArrayUnique,
  IsArray,
  IsBoolean,
  IsEnum,
  IsNotEmpty,
  IsObject,
  IsOptional,
  IsString,
  Matches,
  MaxLength,
  ValidateIf,
} from 'class-validator';

import {
  ApiProperty,
  ApiPropertyOptional,
} from '@nestjs/swagger';

import {
  NotificationCategory,
  NotificationChannel,
} from '../../mongo/enums';

export class CreateNotificationTemplateDto {
  @ApiProperty({
    example: 'FOLLOW_UP_REMINDER',
    description: 'Unique template code within the channel and tenant',
    maxLength: 100,
  })
  @IsString()
  @IsNotEmpty()
  @MaxLength(100)
  @Matches(/^[A-Z0-9_]+$/)
  code!: string;

  @ApiProperty({
    enum: NotificationChannel,
    example: NotificationChannel.EMAIL,
  })
  @IsEnum(NotificationChannel)
  channel!: NotificationChannel;

  @ApiProperty({
    enum: NotificationCategory,
    example: NotificationCategory.REMINDER,
  })
  @IsEnum(NotificationCategory)
  category!: NotificationCategory;

  @ApiPropertyOptional({
    example: 'Follow-up reminder for {{businessName}}',
    description: 'Email subject; optional for SMS and WhatsApp',
    maxLength: 200,
  })
  @ValidateIf((_, value) => value !== undefined && value !== null)
  @IsString()
  @IsNotEmpty()
  @MaxLength(200)
  subject?: string;

  @ApiProperty({
    example:
      'Hello {{customerName}}, your follow-up is scheduled for {{appointmentDate}}.',
    description: 'Message body with {{variableName}} placeholders',
  })
  @IsString()
  @IsNotEmpty()
  @MaxLength(10000)
  body!: string;

  @ApiPropertyOptional({
    example: ['customerName', 'businessName', 'appointmentDate'],
    type: [String],
    description: 'Variables that must be supplied when rendering this template',
  })
  @IsOptional()
  @IsArray()
  @ArrayUnique()
  @IsString({ each: true })
  @Matches(/^[a-zA-Z][a-zA-Z0-9_]*$/, { each: true })
  requiredVariables?: string[];

  @ApiPropertyOptional({
    example: 'msg91-approved-template-id',
    description: 'Provider-specific approved template ID',
    maxLength: 200,
  })
  @IsOptional()
  @IsString()
  @MaxLength(200)
  providerTemplateId?: string;

  @ApiPropertyOptional({
    example: true,
    default: true,
    description: 'Whether this template can be used',
  })
  @IsOptional()
  @IsBoolean()
  isActive?: boolean;
}
