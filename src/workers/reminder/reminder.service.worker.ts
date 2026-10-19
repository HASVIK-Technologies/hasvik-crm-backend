import { Injectable, Logger } from '@nestjs/common';
import moment from 'moment-timezone';
import { Business, FollowUp } from '../../mongo/interfaces';
import { FollowUpStatus } from '../../mongo/enums';
import { MongoService } from '../../mongo/mongo.service';
import { SmsService } from '../../common/sms/sms.service';

type ReminderBusiness = Pick<
  Business,
  'name' | 'phoneNumbers' | 'whatsappNumbers'
>;

type FollowUpWithBusiness = Omit<FollowUp, 'businessId'> & {
  businessId: ReminderBusiness | null;
};

@Injectable()
export class ReminderServiceWorker {
  private readonly logger = new Logger(ReminderServiceWorker.name);
  private isRunning = false;

  constructor(
    private readonly mongo: MongoService,
    private readonly smsService: SmsService,
  ) {}

  async checkReminders(): Promise<void> {
    if (this.isRunning) {
      this.logger.warn(
        'Skipping reminder check because the previous run is still active',
      );
      return;
    }

    this.isRunning = true;
    try {
      const minuteStart = moment.utc().startOf('minute').toDate();
      const minuteEnd = moment.utc(minuteStart).add(5, 'minute').toDate();
      const reminderTime = {
        $subtract: [
          '$scheduledAt',
          { $multiply: ['$reminderInMinutes', 60_000] },
        ],
      };

      const followUps = (await this.mongo.models.followUp
        .find({
          status: FollowUpStatus.SCHEDULED,
          reminderInMinutes: { $gte: 0 },
          $expr: {
            $and: [
              { $gte: [reminderTime, minuteStart] },
              { $lt: [reminderTime, minuteEnd] },
            ],
          },
        })
        .populate<{ businessId: ReminderBusiness | null }>(
          'businessId',
          'name phoneNumbers whatsappNumbers',
        )
        .exec()) as FollowUpWithBusiness[];

      for (const followUp of followUps) {
        await this.sendReminder(followUp);
      }
    } finally {
      this.isRunning = false;
    }
  }

  private async sendReminder(followUp: FollowUpWithBusiness): Promise<void> {
    const followUpId = followUp._id.toString();
    const business = followUp.businessId;
    if (!business) {
      this.logger.warn(
        `Skipping reminder for follow-up ${followUpId}: business was not found`,
      );
      return;
    }

    const contacts = [
      ...(business.whatsappNumbers ?? []),
      ...(business.phoneNumbers ?? []),
    ];
    const contact =
      contacts.find((candidate) => candidate.isPrimary) ?? contacts[0];

    if (!contact) {
      this.logger.warn(
        `Skipping reminder for follow-up ${followUpId}: business has no contact number`,
      );
      return;
    }

    const message = `Reminder: ${followUp.type.toLowerCase()} follow-up for ${business.name} is scheduled at ${moment.utc(followUp.scheduledAt).toISOString()}.`;

    try {
      // Call service to send message
      //await this.smsService.sendSms(contact.number, message);
      this.logger.log(`Reminder sent for follow-up ${followUpId}`);
    } catch (error) {
      this.logger.error(
        `Failed to send reminder for follow-up ${followUpId}`,
        error instanceof Error ? error.stack : String(error),
      );
    }
  }
}
