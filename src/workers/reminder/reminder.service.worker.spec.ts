import { Business, FollowUp } from '../mongo/interfaces';
import { FollowUpStatus, FollowUpType } from '../mongo/enums';
import { MongoService } from '../mongo/mongo.service';
import { SmsService } from '../common/sms/sms.service';
import { Types } from 'mongoose';
import { ReminderServiceWorker } from './reminder.service.worker';

describe('ReminderServiceWorker', () => {
  beforeEach(() => {
    jest.useFakeTimers().setSystemTime(new Date('2026-01-01T12:00:15.000Z'));
  });

  afterEach(() => {
    jest.useRealTimers();
  });

  it('sends a reminder for scheduled follow-ups due in the current minute', async () => {
    const followUp = {
      _id: new Types.ObjectId(),
      tenantId: new Types.ObjectId(),
      assignedTo: new Types.ObjectId(),
      type: FollowUpType.CALL,
      scheduledAt: new Date('2026-01-01T12:00:30.000Z'),
      reminderInMinutes: 0,
      status: FollowUpStatus.SCHEDULED,
      createdBy: new Types.ObjectId(),
      createdAt: new Date('2026-01-01T11:00:00.000Z'),
      updatedAt: new Date('2026-01-01T11:00:00.000Z'),
      businessId: {
        name: 'Acme',
        whatsappNumbers: [{ number: '+10000000000', isPrimary: true }],
        phoneNumbers: [],
      } satisfies Pick<Business, 'name' | 'phoneNumbers' | 'whatsappNumbers'>,
    } satisfies Omit<FollowUp, 'businessId'> & {
      businessId: Pick<Business, 'name' | 'phoneNumbers' | 'whatsappNumbers'>;
    };
    const exec = jest.fn().mockResolvedValue([followUp]);
    const populate = jest.fn().mockReturnValue({ exec });
    const find = jest.fn().mockReturnValue({ populate });
    const mongo = {
      models: { followUp: { find } },
    } as unknown as MongoService;
    const sendSms = jest.fn().mockResolvedValue(undefined);
    const smsService = {
      sendSms,
    } as unknown as SmsService;
    const worker = new ReminderServiceWorker(mongo, smsService);

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
                new Date('2026-01-01T12:01:00.000Z'),
              ],
            },
          ],
        },
      }),
    );
    expect(sendSms).toHaveBeenCalledWith(
      '+10000000000',
      'Reminder: call follow-up for Acme is scheduled at 2026-01-01T12:00:30.000Z.',
    );
  });
});
