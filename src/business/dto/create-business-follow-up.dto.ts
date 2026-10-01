import { OmitType } from '@nestjs/swagger';
import { CreateFollowUpDto } from 'src/followup/dto/create-follow-up.dto';

export class CreateBusinessFollowUpDto extends OmitType(
  CreateFollowUpDto,
  ['businessId'] as const,
) {}