import {
  IsEnum,
  IsMongoId,
  IsNumberString,
  IsOptional,
  IsString,
} from 'class-validator';
import { ApiPropertyOptional, OmitType } from '@nestjs/swagger';
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
    example: false,
    description: 'Include deleted businesses',
  })
  @IsOptional()
  @IsString()
  isDeleted?: string;

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