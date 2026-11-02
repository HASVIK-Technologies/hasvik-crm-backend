import { Business, FollowUp } from '../../mongo/interfaces';
import {
  FollowUpStatus,
  FollowUpType,
  NotificationCategory,
  NotificationChannel,
} from '../../mongo/enums';
import { MongoService } from '../../mongo/mongo.service';
import { Types } from 'mongoose';
import { ConfigService } from '@nestjs/config';
import { NotificationService } from '../../notification/notification.service';
import { ReminderServiceWorker } from './reminder.service.worker';

describe('ReminderServiceWorker', () => {
  beforeEach(() => {
    jest.useFakeTimers().setSystemTime(new Date('2026-01-01T12:00:15.000Z'));
  });

  afterEach(() => {
    jest.useRealTimers();
  });

  it('sends a WhatsApp reminder for a follow-up in the next five minutes', async () => {
    const followUp = {
      _id: new Types.ObjectId(),
      tenantId: new Types.ObjectId(),
      assignedTo: {
        fullName: 'Anil Kashyap',
        phoneNumber: '+919876543210',
      },
      type: FollowUpType.CALL,
      scheduledAt: new Date('2026-01-01T12:00:30.000Z'),
      reminderInMinutes: 0,
      status: FollowUpStatus.SCHEDULED,
      createdBy: new Types.ObjectId(),
      createdAt: new Date('2026-01-01T11:00:00.000Z'),
      updatedAt: new Date('2026-01-01T11:00:00.000Z'),
      businessId: {
        name: 'Acme',
        whatsappNumbers: [
          { number: '+10000000000', name: 'Acme contact', isPrimary: true },
        ],
        phoneNumbers: [],
      } satisfies Pick<Business, 'name' | 'phoneNumbers' | 'whatsappNumbers'>,
    } satisfies Omit<FollowUp, 'businessId' | 'assignedTo'> & {
      businessId: Pick<
        Business,
        'name' | 'phoneNumbers' | 'whatsappNumbers'
      >;
      assignedTo: { fullName: string; phoneNumber: string };
    };
    const exec = jest.fn().mockResolvedValue([followUp]);
    const query = { exec, populate: jest.fn() };
    query.populate.mockReturnValue(query);
    const find = jest.fn().mockReturnValue(query);
    const mongo = {
      models: { followUp: { find } },
    } as unknown as MongoService;
    const sendNotification = jest.fn().mockResolvedValue(undefined);
    const notificationService = {
      sendNotification,
    } as unknown as NotificationService;
    const configService = {
      get: jest.fn().mockReturnValue(undefined),
    } as unknown as ConfigService;
    const worker = new ReminderServiceWorker(
      mongo,
      notificationService,
      configService,
    );

    await worker.checkReminders();

    expect(find).toHaveBeenCalledWith(
      expect.objectContaining({
        status: FollowUpStatus.SCHEDULED,
        reminderInMinutes: { $gte: 0 },
        $expr: {
          $and: [
            {
              $gte: [
                {
                  $subtract: [
                    '$scheduledAt',
                    { $multiply: ['$reminderInMinutes', 60_000] },
                  ],
                },
                new Date('2026-01-01T12:00:00.000Z'),
              ],
            },
            {
              $lt: [
                {
                  $subtract: [
                    '$scheduledAt',
                    { $multiply: ['$reminderInMinutes', 60_000] },
                  ],
                },
                new Date('2026-01-01T12:05:00.000Z'),
              ],
            },
          ],
        },
      }),
    );
    expect(sendNotification).toHaveBeenCalledWith({
      channel: NotificationChannel.WHATSAPP,
      category: NotificationCategory.REMINDER,
      recipient: '+919876543210',
      templateCode: 'BUSINESS_FOLLOWUP_WITH_IMAGE',
      variables: {
        headerImageUrl:
          'https://hasvik.s3.ap-south-1.amazonaws.com/crm/logo/hasvik-reminder.jpeg',
        customerName: 'Acme contact',
        businessName: 'HASVIK Tech',
        businessDisplayName: 'Acme',
        contactPerson: 'Acme contact',
        phoneNumber: '+10000000000',
        followUpDate: '01 Jan 2026',
        followUpTime: '12:00 PM',
        purpose: 'call',
        assignedTo: 'Anil Kashyap',
      },
      idempotencyKey: `follow-up-reminder:${followUp._id.toString()}:${followUp.scheduledAt.getTime()}`,
    });
  });
});
