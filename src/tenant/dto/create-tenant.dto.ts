
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import {
  IsEmail,
  IsNotEmpty,
  IsOptional,
  IsString,
  Matches,
  MaxLength,
  MinLength,
} from 'class-validator';
import { Transform } from 'class-transformer';

export class CreateTenantDto {
  @ApiProperty({
    example: 'Hasvik Retail',
    description: 'Name of the tenant organization',
  })
  @IsString()
  @MinLength(2)
  @MaxLength(120)
  name!: string;

  @ApiPropertyOptional({
    example: 'admin@example.com',
    description: 'Tenant contact email address',
  })
  @IsOptional()
  @IsEmail()
  contactEmail?: string;

  @ApiProperty({
    example: '+1234567890',
    description: 'Tenant contact phone number and initial admin user phone number',
  })
  @Transform(({ value }) =>
    typeof value === 'string' ? value.trim() : value,
  )
  @IsString()
  @IsNotEmpty()
  @MaxLength(20)
  contactPhone!: string;

  @ApiProperty({
    example: 'hasvik',
    description: 'User full name',
  })
  @Transform(({ value }) =>
    typeof value === 'string' ? value.trim() : value,
  )
  @IsString()
  @IsNotEmpty()
  @MinLength(2)
  @MaxLength(100)
  fullName!: string;

  @ApiProperty({
    example: 'StrongPassword@123',
    description: 'User password',
  })
  @IsString()
  @IsNotEmpty()
  @MinLength(8)
  @MaxLength(100)
  password!: string;
}
