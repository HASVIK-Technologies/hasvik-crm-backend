import { Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { NotificationChannel } from '../mongo/enums';

const logger = new Logger('NotificationDeliveryGuard');

const DELIVERY_SWITCHES: Record<NotificationChannel, string> = {
  [NotificationChannel.WHATSAPP]: 'CB_WHATSAPP',
  [NotificationChannel.SMS]: 'CB_SMS',
  [NotificationChannel.EMAIL]: 'CB_EMAIL',
};

export function getNotificationDeliveryBlockReason(
  config: ConfigService,
  channel: NotificationChannel,
): string | undefined {
  const switchName = DELIVERY_SWITCHES[channel];
  const isDisabled =
    config.get<string>(switchName)?.trim().toLowerCase() === 'true';

  if (isDisabled) {
    const reason = `${channel} delivery is disabled by ${switchName}`;
    logger.error(reason);
    return reason;
  }
}
