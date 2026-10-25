import { ApiPropertyOptional } from "@nestjs/swagger";
import { IsEnum, IsNumberString, IsOptional } from "class-validator";
import { SubscriptionStatus } from "../../mongo/enums/subscription-status.enum";

export class GetSubscriptionFilterDto {

    @ApiPropertyOptional({
    enum: SubscriptionStatus,
    example: SubscriptionStatus.ACTIVE,
    })
    @IsOptional()
    @IsEnum(SubscriptionStatus)
    status?: SubscriptionStatus;

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
    description: 'Number of subscriptions per page',
    })
    @IsOptional()
    @IsNumberString()
    limit?: string;
}