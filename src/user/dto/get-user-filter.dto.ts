import { ApiPropertyOptional, OmitType } from '@nestjs/swagger';
import { Transform, Type } from 'class-transformer';
import {
  IsBoolean,
  IsEnum,
  IsIn,
  IsInt,
  IsMongoId,
  IsOptional,
  IsString,
  Max,
  MaxLength,
  Min,
} from 'class-validator';

import { UIUserRole } from '../../mongo/enums/user-role.enum';

export class UserFilterDto {
  @ApiPropertyOptional({
    example: 'anil',
    description: 'Search user by full name, email, or phone number',
  })
  @Transform(({ value }) =>
    typeof value === 'string' ? value.trim() : value,
  )
  @IsOptional()
  @IsString()
  @MaxLength(100)
  search?: string;

  @ApiPropertyOptional({
    example: '66aad3aed93975bc640ca81b',
    description: 'Tenant ID associated with the user',
  })
  @IsOptional()
  @IsMongoId()
  tenantId?: string;

  @ApiPropertyOptional({
    example: UIUserRole.USER,
    enum: UIUserRole,
    description: 'Filter users by role',
  })
  @IsOptional()
  @IsEnum(UIUserRole)
  role?: UIUserRole;

  @ApiPropertyOptional({
    example: false,
    description: 'Filter users by deleted status',
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

  @ApiPropertyOptional({
    example: 1,
    description: 'Page number',
    default: 1,
  })
  @Type(() => Number)
  @IsOptional()
  @IsInt()
  @Min(1)
  page?: number = 1;

  @ApiPropertyOptional({
    example: 10,
    description: 'Number of users per page',
    default: 10,
  })
  @Type(() => Number)
  @IsOptional()
  @IsInt()
  @Min(1)
  @Max(100)
  limit?: number = 10;

  @ApiPropertyOptional({
    example: 'fullName',
    description: 'Field used for sorting',
    enum: ['fullName', 'email', 'createdAt', 'updatedAt'],
    default: 'fullName',
  })
  @IsOptional()
  @IsString()
  @IsIn(['fullName', 'email', 'createdAt', 'updatedAt'])
  sortBy?: string = 'fullName';

  @ApiPropertyOptional({
    example: 'asc',
    description: 'Sort direction',
    enum: ['asc', 'desc'],
    default: 'asc',
  })
  @IsOptional()
  @IsString()
  @IsIn(['asc', 'desc'])
  sortOrder?: 'asc' | 'desc' = 'asc';
}


export class UserKPIsDto extends OmitType(
  UserFilterDto,
  ['page', 'limit', 'sortBy', 'sortOrder'] as const,
) {}