import { ApiProperty } from '@nestjs/swagger';
import { IsEnum, IsIn } from 'class-validator';
import { FollowUpStatus } from 'src/mongo/enums';

export class UpdateFollowUpStatusDto {
  @ApiProperty({
    enum: [
      FollowUpStatus.COMPLETED,
      FollowUpStatus.CANCELLED,
    ],
    example: FollowUpStatus.COMPLETED,
    description: 'New status of the follow-up',
  })
  @IsIn([
    FollowUpStatus.COMPLETED,
    FollowUpStatus.CANCELLED,
  ])
  status!: FollowUpStatus.COMPLETED | FollowUpStatus.CANCELLED;
}