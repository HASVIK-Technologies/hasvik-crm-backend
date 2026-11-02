import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { NotificationModule } from '../../notification/notification.module';
import { ReminderControllerWorker } from './reminder.controller.worker';
import { ReminderServiceWorker } from './reminder.service.worker';

@Module({
  imports: [ConfigModule, NotificationModule],
  providers: [ReminderControllerWorker, ReminderServiceWorker],
})
export class ReminderModule {}
