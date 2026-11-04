import {
  ArrayUnique,
  IsArray,
  IsEnum,
  IsMongoId,
  IsNumberString,
  IsOptional,
  IsString,
} from 'class-validator';
import { ApiPropertyOptional, OmitType } from '@nestjs/swagger';
import { Transform } from 'class-transformer';
import { BusinessStatus } from 'src/mongo/enums';

export class BusinessFilterDto {
  @ApiPropertyOptional({
    example: 'ABC Furniture',
    description: 'Search by business name, email, phone number or WhatsApp number',
  })
  @IsOptional()
  @IsString()
  search?: string;

  @ApiPropertyOptional({
    enum: BusinessStatus,
    example: BusinessStatus.NEW,
    description: 'Filter businesses by status',
  })
  @IsOptional()
  @IsEnum(BusinessStatus)
  status?: BusinessStatus;

  @ApiPropertyOptional({
    example: '665c12345678901234567890',
    description: 'Filter businesses by category ID',
  })
  @IsOptional()
  @IsMongoId()
  categoryId?: string;

  @ApiPropertyOptional({
    example: 'Ballia',
    description: 'Filter businesses by city',
  })
  @IsOptional()
  @IsString()
  city?: string;

  @ApiPropertyOptional({
    example: 'Uttar Pradesh',
    description: 'Filter businesses by state',
  })
  @IsOptional()
  @IsString()
  state?: string;

  @ApiPropertyOptional({
    example: true,
    description: 'Include deleted businesses',
  })
  @IsOptional()
  @IsString()
  isActive?: string;

  @ApiPropertyOptional({
    description: 'Filter follow-ups by tag IDs. Matches any selected tag.',
    type: [String],
    example: [
      '673a12345678901234567890',
      '673a12345678901234567891',
    ],
  })
  @IsOptional()
  @Transform(({ value }) => {
    if (typeof value === 'string') {
      return value.split(',').map((id) => id.trim());
    }
    return value;
  })
  @IsArray()
  @ArrayUnique()
  @IsMongoId({ each: true })
  tagIds?: string[];

  @ApiPropertyOptional({
    example: '1',
    default: '1',
    description: 'Page number',
  })
  @IsOptional()
  @IsNumberString()
  page?: string;

  @ApiPropertyOptional({
    example: '10',
    default: '10',
    description: 'Number of businesses per page',
  })
  @IsOptional()
  @IsNumberString()
  limit?: string;

  @ApiPropertyOptional({
    example: '-createdAt',
    default: '-createdAt',
    description: 'Sort field. Prefix with - for descending order',
  })
  @IsOptional()
  @IsString()
  sortBy?: string;
}

export class BusinessKPIsDto extends OmitType(
  BusinessFilterDto,
  ['page', 'limit', 'sortBy'] as const,
) {}