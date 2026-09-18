import { ApiProperty } from '@nestjs/swagger';
import { IsBoolean } from 'class-validator';

export class UpdateCategoryStatusDto {
  @ApiProperty({
    example: true,
    description: 'Set category active status',
  })
  @IsBoolean()
  isDeleted!: boolean;
}