import { NotificationChannel } from './notification-types.enum';

export type NotificationProviderName =
  | 'msg91'
  | 'gupshup'
  | 'twilio';

export const CHANNEL_PROVIDER_CONFIG: Record<
  NotificationChannel,
  string
> = {
  [NotificationChannel.EMAIL]: 'NOTIFICATION_EMAIL_PROVIDER',
  [NotificationChannel.SMS]: 'NOTIFICATION_SMS_PROVIDER',
  [NotificationChannel.WHATSAPP]: 'NOTIFICATION_WHATSAPP_PROVIDER',
};