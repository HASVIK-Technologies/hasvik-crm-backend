import { Module } from '@nestjs/common';
import { FollowUpController } from './followup.controller';
import { FollowUpService } from './followup.service';
import { SubscriptionGuard } from '../auth/guards/subscription.guard';
import { SubscriptionModule } from '../subscription/subscription.module';

@Module({
  imports: [SubscriptionModule],
  controllers: [FollowUpController],
  providers: [FollowUpService, SubscriptionGuard],
  exports: [FollowUpService],
})
export class FollowupModule {}
