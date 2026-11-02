import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { NotificationController } from './notification.controller';
import { NotificationService } from './notification.service';
import { NotificationTemplateController } from './notification-template.controller';
import { NotificationTemplateService } from './notification-template.service';
import { Msg91Provider } from './providers/msg91.provider';
import { NotificationProviderFactory } from './providers/notification-provider.factory';

@Module({
  imports: [
    ConfigModule,
  ],
  controllers: [NotificationController, NotificationTemplateController],
  providers: [
    NotificationService,
    NotificationTemplateService,
    Msg91Provider,
    // Add other provider i.e. gupshup, 
    NotificationProviderFactory,
  ],
  exports: [
    NotificationService,
    NotificationTemplateService
  ],
})
export class NotificationModule {}