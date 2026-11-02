import { ConflictException, Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import moment from 'moment-timezone';
import { Business, ContactNumber, FollowUp } from '../../mongo/interfaces';
import {
  FollowUpStatus,
  NotificationCategory,
  NotificationChannel,
} from '../../mongo/enums';
import { MongoService } from '../../mongo/mongo.service';
import { NotificationService } from '../../notification/notification.service';

const DEFAULT_REMINDER_TEMPLATE_CODE = 'BUSINESS_FOLLOWUP_WITH_IMAGE';
const DEFAULT_REMINDER_HEADER_IMAGE_URL =
  'https://hasvik.s3.ap-south-1.amazonaws.com/crm/logo/hasvik-reminder.jpeg';
const DEFAULT_REMINDER_BUSINESS_NAME = 'HASVIK Tech';

type ReminderBusiness = Pick<
  Business,
  'name' | 'phoneNumbers' | 'whatsappNumbers'
>;

type FollowUpWithBusiness = Omit<FollowUp, 'businessId' | 'assignedTo'> & {
  businessId: ReminderBusiness | null;
  assignedTo: { fullName: string; phoneNumber?: string } | null;
};

@Injectable()
export class ReminderServiceWorker {
  private readonly logger = new Logger(ReminderServiceWorker.name);
  private isRunning = false;

  constructor(
    private readonly mongo: MongoService,
    private readonly notificationService: NotificationService,
    private readonly configService: ConfigService,
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
        .populate<{
          assignedTo: { fullName: string; phoneNumber?: string } | null;
        }>(
          'assignedTo',
          'fullName phoneNumber',
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

    const assignedTo = followUp.assignedTo;
    if (!assignedTo?.phoneNumber) {
      this.logger.warn(
        `Skipping reminder for follow-up ${followUpId}: assigned user has no phone number`,
      );
      return;
    }

    const businessContacts: ContactNumber[] = [
      ...(business.whatsappNumbers ?? []),
      ...(business.phoneNumbers ?? []),
    ];
    const primaryContact =
      businessContacts.find((contact) => contact.isPrimary) ??
      businessContacts[0];

    try {
      await this.notificationService.sendNotification({
        channel: NotificationChannel.WHATSAPP,
        category: NotificationCategory.REMINDER,
        recipient: assignedTo.phoneNumber,
        templateCode:
          this.configService.get<string>('REMINDER_WHATSAPP_TEMPLATE_CODE') ||
          DEFAULT_REMINDER_TEMPLATE_CODE,
        variables: {
          headerImageUrl:
            this.configService.get<string>(
              'REMINDER_WHATSAPP_HEADER_IMAGE_URL',
            ) || DEFAULT_REMINDER_HEADER_IMAGE_URL,
          //customerName: primaryContact?.name || business.name,
          customerName: assignedTo.fullName || 'Admin',
          businessName:
            this.configService.get<string>('REMINDER_WHATSAPP_BUSINESS_NAME') ||
            DEFAULT_REMINDER_BUSINESS_NAME,
          businessDisplayName: business.name,
          contactPerson: primaryContact?.name || business.name,
          phoneNumber: primaryContact?.number || assignedTo.phoneNumber,
          followUpDate: moment.utc(followUp.scheduledAt).format('DD MMM YYYY'),
          followUpTime: moment.utc(followUp.scheduledAt).format('hh:mm A'),
          purpose: "Followup Reminder",
          assignedTo: assignedTo.fullName || 'Your team',
        },
        idempotencyKey: `follow-up-reminder:${followUpId}:${followUp.scheduledAt.getTime()}`,
      });
      this.logger.log(`Reminder sent for follow-up ${followUpId}`);
    } catch (error) {
      if (error instanceof ConflictException) {
        this.logger.log(
          `Skipping duplicate reminder for follow-up ${followUpId}`,
        );
        return;
      }

      this.logger.error(
        `Failed to send reminder for follow-up ${followUpId}`,
        error instanceof Error ? error.stack : String(error),
      );
    }
  }
}
