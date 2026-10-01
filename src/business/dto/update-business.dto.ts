import { Transform, Type } from 'class-transformer';
import {
  IsArray,
  IsBoolean,
  IsEmail,
  IsEnum,
  IsMongoId,
  IsNumber,
  IsOptional,
  IsString,
  IsUrl,
  ValidateNested,
} from 'class-validator';
import {
  ApiPropertyOptional,
} from '@nestjs/swagger';
import { BusinessStatus } from 'src/mongo/enums';
import { BusinessLocationDto } from './business-location.dto';

export class UpdateContactNumberDto {
  @ApiPropertyOptional({
    example: '9876543210',
    description: 'Phone or WhatsApp number',
  })
  @IsString()
  number!: string;

  @ApiPropertyOptional({
    example: true,
    default: false,
    description: 'Whether this is the primary number',
  })
  @IsOptional()
  isPrimary?: boolean;
}

export class UpdateBusinessDto {
  @ApiPropertyOptional({
    example: 'ABC Furniture',
    description: 'Business name',
  })
  @IsOptional()
  @IsString()
  name?: string;

  @ApiPropertyOptional({
    example: 'ABC Furniture is a leading furniture retailer in the region.',
    description: 'Business description',
  })
  @IsOptional()
  @IsString()
  description?: string;

  @ApiPropertyOptional({
    example: '665c12345678901234567890',
    description: 'Business category ID',
  })
  @IsOptional()
  @IsMongoId()
  categoryId?: string;

  @ApiPropertyOptional({
    enum: BusinessStatus,
    example: BusinessStatus.NEW,
    description: 'Current business status',
  })
  @IsOptional()
  @IsEnum(BusinessStatus)
  status?: BusinessStatus;

  @ApiPropertyOptional({
    type: [UpdateContactNumberDto],
    example: [
      {
        number: '9876543210',
        isPrimary: true,
      },
      {
        number: '9123456780',
        isPrimary: false,
      },
    ],
    description: 'Business phone numbers',
  })
  @IsOptional()
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => UpdateContactNumberDto)
  phoneNumbers?: UpdateContactNumberDto[];

  @ApiPropertyOptional({
    type: [UpdateContactNumberDto],
    example: [
      {
        number: '9876543210',
        isPrimary: true,
      },
      {
        number: '9000012345',
        isPrimary: false,
      },
    ],
    description: 'Business WhatsApp numbers',
  })
  @IsOptional()
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => UpdateContactNumberDto)
  whatsappNumbers?: UpdateContactNumberDto[];

  @ApiPropertyOptional({
    example: 'contact@abcfurniture.com',
    description: 'Business email address',
  })
  @IsOptional()
  @IsEmail()
  email?: string;

  @ApiPropertyOptional({
    example: 'https://abcfurniture.com',
    description: 'Business website',
  })
  @IsOptional()
  @IsUrl()
  website?: string;

  @ApiPropertyOptional({
    example: 'Main Market, Near Bus Stand',
    description: 'Business address',
  })
  @IsOptional()
  @IsString()
  address?: string;

  @ApiPropertyOptional({
    example: 'Ballia',
    description: 'City where the business is located',
  })
  @IsOptional()
  @IsString()
  city?: string;

  @ApiPropertyOptional({
    example: 'Uttar Pradesh',
    description: 'State where the business is located',
  })
  @IsOptional()
  @IsString()
  state?: string;

  @ApiPropertyOptional({
    example: '277001',
    description: 'Business pincode',
  })
  @IsOptional()
  @IsString()
  pincode?: string;

  @ApiPropertyOptional({ type: BusinessLocationDto })
  @IsOptional()
  @ValidateNested()
  @Type(() => BusinessLocationDto)
  location?: BusinessLocationDto;

  @ApiPropertyOptional({
    example: '665c12345678901234567890',
    description: 'User assigned to this business',
  })
  @IsOptional()
  @IsMongoId()
  assignedTo?: string;

  @ApiPropertyOptional({
    example: 'WHATSAPP',
    description: 'Source from which the lead/business was acquired',
  })
  @IsOptional()
  @IsString()
  leadSource?: string;

 @ApiPropertyOptional({
    example: true,
    description: 'Filter categories by active status',
    default: true,
  })
  @Transform(({ value }) => {
    if (typeof value === 'boolean') return value;
    if (value === 'true') return true;
    if (value === 'false') return false;
    return value;
  })
  @IsOptional()
  @IsBoolean()
  isActive?: boolean;
}