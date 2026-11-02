import { Injectable } from '@nestjs/common';
import { Cron, CronExpression } from '@nestjs/schedule';
import { ReminderServiceWorker } from './reminder.service.worker';

@Injectable()
export class ReminderControllerWorker {
  constructor(private readonly reminderService: ReminderServiceWorker) {}

  @Cron(CronExpression.EVERY_5_MINUTES)
  async checkReminders(): Promise<void> {
    console.log("Checking reminders...");
    await this.reminderService.checkReminders();
  }
}
