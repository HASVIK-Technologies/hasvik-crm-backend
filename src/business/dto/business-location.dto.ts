import { ApiPropertyOptional } from '@nestjs/swagger';
import { IsOptional, IsUrl } from 'class-validator';

export class BusinessLocationDto {
  @ApiPropertyOptional({
    example: 'https://maps.google.com/?q=12.9716,77.5946',
    description: 'Google Maps location URL of the business',
  })
  @IsOptional()
  @IsUrl()
  url?: string;
}