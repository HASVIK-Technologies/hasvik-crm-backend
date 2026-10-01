import { Type } from 'class-transformer';
import {
  IsArray,
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
  ApiProperty,
  ApiPropertyOptional,
} from '@nestjs/swagger';
import { BusinessStatus } from 'src/mongo/enums';
import { BusinessLocationDto } from './business-location.dto';
import { CreateBusinessFollowUpDto } from './create-business-follow-up.dto';


export class ContactNumberDto {
  @ApiProperty({
    example: '9876543210',
    description: 'Phone or WhatsApp number',
  })
  @IsString()
  number!: string;

  @ApiProperty({
    example: 'John Doe',
    description: 'Name of the contact person',
  })
  @IsOptional()
  @IsString()
  name?: string;

  @ApiPropertyOptional({
    example: true,
    default: false,
    description: 'Whether this is the primary number',
  })
  @IsOptional()
  isPrimary?: boolean;
}

export class CreateBusinessDto {
  @ApiProperty({
    example: 'ABC Furniture',
    description: 'Business name',
  })
  @IsString()
  name!: string;

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
    type: [ContactNumberDto],
    example: [
      {
        number: '9876543210',
        name: 'Hasvik',
        isPrimary: true,
      },
      {
        number: '9123456780',
        name: 'Hasvik',
        isPrimary: false,
      },
    ],
    description: 'Business phone numbers',
  })
  @IsOptional()
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => ContactNumberDto)
  phoneNumbers?: ContactNumberDto[];

  @ApiPropertyOptional({
    type: [ContactNumberDto],
    example: [
      {
        number: '9876543210',
        name: 'Hasvik',
        isPrimary: true,
      },
    ],
    description: 'Business WhatsApp numbers',
  })
  @IsOptional()
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => ContactNumberDto)
  whatsappNumbers?: ContactNumberDto[];

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
    type: CreateBusinessFollowUpDto,
    description: 'Optional initial follow-up for the business',
  })
  @IsOptional()
  @ValidateNested()
  @Type(() => CreateBusinessFollowUpDto)
  followUp?: CreateBusinessFollowUpDto;
}