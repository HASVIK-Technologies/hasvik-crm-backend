import { Module } from '@nestjs/common';
import { CategoryController } from './category.controller';
import { CategoryService } from './category.service';
import { SubscriptionGuard } from '../auth/guards/subscription.guard';
import { SubscriptionModule } from '../subscription/subscription.module';
import { AuditLogModule } from '../audit-log/audit-log.module';

@Module({
  imports: [SubscriptionModule, AuditLogModule],
  controllers: [CategoryController],
  providers: [CategoryService, SubscriptionGuard]
})
export class CategoryModule {}
