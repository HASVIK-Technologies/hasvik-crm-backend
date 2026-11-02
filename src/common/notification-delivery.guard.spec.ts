import { Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { NotificationChannel } from '../mongo/enums';
import { getNotificationDeliveryBlockReason } from './notification-delivery.guard';

describe('getNotificationDeliveryBlockReason', () => {
  afterEach(() => {
    jest.restoreAllMocks();
  });

  it.each([
    [NotificationChannel.WHATSAPP, 'CB_WHATSAPP'],
    [NotificationChannel.SMS, 'CB_SMS'],
    [NotificationChannel.EMAIL, 'CB_EMAIL'],
  ])('logs and blocks %s when %s is true', (channel, switchName) => {
    const get = jest.fn().mockReturnValue('true');
    const config = {
      get,
    } as unknown as ConfigService;
    const loggerError = jest
      .spyOn(Logger.prototype, 'error')
      .mockImplementation(() => undefined);

    expect(getNotificationDeliveryBlockReason(config, channel)).toBe(
      `${channel} delivery is disabled by ${switchName}`,
    );
    expect(get.mock.calls).toContainEqual([switchName]);
    expect(loggerError.mock.calls).toContainEqual([
      `${channel} delivery is disabled by ${switchName}`,
    ]);
  });

  it.each([undefined, 'false', '1', 'yes'])(
    'allows delivery when the switch is %s',
    (value) => {
      const config = {
        get: jest.fn().mockReturnValue(value),
      } as unknown as ConfigService;

      expect(
        getNotificationDeliveryBlockReason(config, NotificationChannel.SMS),
      ).toBeUndefined();
    },
  );
});
