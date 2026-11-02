import {
  Injectable,
  ServiceUnavailableException,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';

import {
  CHANNEL_PROVIDER_CONFIG,
  NotificationProviderName,
  NotificationChannel
} from '../../mongo/enums';

import { Msg91Provider } from './msg91.provider';
import type { NotificationProvider } from '../interfaces/notification-provider.interface';

@Injectable()
export class NotificationProviderFactory {
  private readonly providers = new Map<
    NotificationProviderName,
    NotificationProvider
  >();

  constructor(
    private readonly configService: ConfigService,
    msg91Provider: Msg91Provider,
  ) {
    this.providers.set(msg91Provider.name, msg91Provider);
  }

  getProviderName(
    channel: NotificationChannel,
  ): NotificationProviderName {
    const configKey = CHANNEL_PROVIDER_CONFIG[channel];

    const providerName =
      this.configService.get<string>(configKey) ||
      this.configService.get<string>(
        'NOTIFICATION_DEFAULT_PROVIDER',
        'msg91',
      );

    if (!['msg91', 'gupshup', 'twilio'].includes(providerName)) {
      throw new ServiceUnavailableException(
        `Unsupported notification provider: ${providerName}`,
      );
    }

    const provider = this.providers.get(
      providerName as NotificationProviderName,
    );

    if (!provider || !provider.supports(channel)) {
      throw new ServiceUnavailableException(
        `Provider "${providerName}" is not registered for "${channel}"`,
      );
    }

    return provider.name;
  }

  getProvider(
    channel: NotificationChannel,
  ): NotificationProvider {
    const name = this.getProviderName(channel);
    return this.providers.get(name)!;
  }
}