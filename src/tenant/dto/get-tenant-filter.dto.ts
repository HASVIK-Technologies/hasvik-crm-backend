import { ApiPropertyOptional, OmitType } from "@nestjs/swagger";
import { Transform } from "class-transformer";
import { IsBoolean, IsNumberString, IsOptional } from "class-validator";

export class GetTenantFilterDto {

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
    description: 'Number of follow-ups per page',
    })
    @IsOptional()
    @IsNumberString()
    limit?: string;
}

export class TenantKPIsDto extends OmitType(
  GetTenantFilterDto,
  ['page', 'limit'] as const,
) {}