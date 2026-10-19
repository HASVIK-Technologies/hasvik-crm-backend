import { Module } from '@nestjs/common';
import { SmsModule } from '../../common/sms/sms.module';
import { ReminderControllerWorker } from './reminder.controller.worker';
import { ReminderServiceWorker } from './reminder.service.worker';

@Module({
  imports: [SmsModule],
  providers: [ReminderControllerWorker, ReminderServiceWorker],
})
export class ReminderModule {}
