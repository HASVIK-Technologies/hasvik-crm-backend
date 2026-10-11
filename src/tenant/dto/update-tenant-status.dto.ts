
import { ApiProperty } from '@nestjs/swagger';
import { IsBoolean } from 'class-validator';

export class UpdateTenantStatusDto {
  @ApiProperty({
    example: false,
    description: 'Set to true to activate or false to deactivate the tenant',
  })
  @IsBoolean()
  isActive!: boolean;
}
