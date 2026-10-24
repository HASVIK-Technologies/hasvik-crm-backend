import { ApiPropertyOptional } from "@nestjs/swagger";
import { IsNumberString, IsOptional } from "class-validator";

export class GetTenantFilterDto {

    @ApiPropertyOptional({
    example: true,
    default: true,
    })
    @IsOptional()
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