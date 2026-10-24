import { Module } from '@nestjs/common';
import { BusinessController } from './business.controller';
import { BusinessService } from './business.service';
import { FollowupModule } from '../followup/followup.module';
import { SubscriptionGuard } from '../auth/guards/subscription.guard';
import { SubscriptionModule } from '../subscription/subscription.module';
import { AuditLogModule } from '../audit-log/audit-log.module';

@Module({
  imports: [FollowupModule, SubscriptionModule, AuditLogModule],
  controllers: [BusinessController],
  providers: [BusinessService, SubscriptionGuard]
})
export class BusinessModule {}
