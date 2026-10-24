import { Module } from '@nestjs/common';
import { FollowUpController } from './followup.controller';
import { FollowUpService } from './followup.service';
import { SubscriptionGuard } from '../auth/guards/subscription.guard';
import { SubscriptionModule } from '../subscription/subscription.module';
import { AuditLogModule } from '../audit-log/audit-log.module';

@Module({
  imports: [SubscriptionModule, AuditLogModule],
  controllers: [FollowUpController],
  providers: [FollowUpService, SubscriptionGuard],
  exports: [FollowUpService],
})
export class FollowupModule {}
