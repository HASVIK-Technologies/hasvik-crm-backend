import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { MongoModule } from './mongo/mongo.module';
import { ConfigModule } from '@nestjs/config';
import { BusinessModule } from './business/business.module';
import { FollowupModule } from './followup/followup.module';
import { CategoryModule } from './category/category.module';
import { NoteModule } from './note/note.module';
import { AuditLogModule } from './audit-log/audit-log.module';
import { UserModule } from './user/user.module';
import { AuthModule } from './auth/auth.module';
import { RefreshTokenModule } from './refresh-token/refresh-token.module';
import { SubscriptionModule } from './subscription/subscription.module';
import { SubscriptionPlanModule } from './subscription-plan/subscription-plan.module';
import { TenantModule } from './tenant/tenant.module';
import { ScheduleModule } from '@nestjs/schedule';
import { ReminderModule } from './workers/reminder/reminder.module';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      envFilePath: '.env',
    }),

    ScheduleModule.forRoot(),
    MongoModule,
    BusinessModule,
    FollowupModule,
    CategoryModule,
    NoteModule,
    AuditLogModule,
    UserModule,
    AuthModule,
    RefreshTokenModule,
    SubscriptionModule,
    SubscriptionPlanModule,
    TenantModule,
    ReminderModule,
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
