
import { ApiProperty } from '@nestjs/swagger';
import { IsBoolean } from 'class-validator';

export class UpdateSubscriptionPlanStatusDto{
    @ApiProperty({
        example: true,
    })
    @IsBoolean()
    isActive!: boolean;
}
