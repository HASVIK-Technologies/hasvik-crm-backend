import {
  BadGatewayException,
  BadRequestException,
  Injectable,
  Logger,
  NotImplementedException,
  ServiceUnavailableException
} from '@nestjs/common';

import { ConfigService } from '@nestjs/config';

import {
  Msg91WhatsAppResponse, 
  NotificationProvider,
  SendNotificationInput,
  SendNotificationResult,
} from '../interfaces/notification-provider.interface';
import { NotificationChannel } from '../../mongo/enums';

@Injectable()
export class Msg91Provider implements NotificationProvider {
  private readonly logger = new Logger(Msg91Provider.name);
  readonly name = 'msg91' as const;

  constructor(
    private readonly configService: ConfigService,
  ) {}

  supports(channel: NotificationChannel): boolean {
    return [
      NotificationChannel.EMAIL,
      NotificationChannel.SMS,
      NotificationChannel.WHATSAPP,
    ].includes(channel);
  }

  async send(
    input: SendNotificationInput,
  ): Promise<SendNotificationResult> {
    if (input.channel !== NotificationChannel.WHATSAPP) {
      throw new ServiceUnavailableException(
        `MSG91 ${input.channel} delivery is not implemented yet`,
      );
    }

    return this.sendWhatsApp(input);
  }


  private async sendWhatsApp(
    input: SendNotificationInput,
  ): Promise<SendNotificationResult> {
    const authKey = this.configService.get<string>('MSG91_AUTH_KEY');
    const integratedNumber = this.configService.get<string>(
      'MSG91_WHATSAPP_INTEGRATED_NUMBER',
    );
    const languageCode =
      this.configService.get<string>('MSG91_WHATSAPP_LANGUAGE') || 'en';
    const apiUrl =
      this.configService.get<string>('MSG91_WHATSAPP_API_URL') ||
      'https://api.msg91.com/api/v5/whatsapp/whatsapp-outbound-message/bulk/';

    if (!authKey || !integratedNumber) {
      throw new ServiceUnavailableException(
        'MSG91 WhatsApp configuration is incomplete',
      );
    }

    const templateName = input.providerTemplateId?.trim();

    if (!templateName) {
      throw new ServiceUnavailableException(
        `MSG91 template name is missing for ${input.templateCode}`,
      );
    }

    const recipient = this.normalizeRecipient(input.recipient);

    const requiredVariables = input.requiredVariables ?? [];
    const components: Record<
      string,
      { type: 'image' | 'text'; value: string }
    > = {};
    const imageUrl = input.variables['headerImageUrl'];

    if (imageUrl !== undefined && imageUrl !== null) {
      if (
        typeof imageUrl !== 'string' ||
        !imageUrl.startsWith('https://')
      ) {
        throw new BadRequestException(
          'WhatsApp headerImageUrl must be a public HTTPS URL',
        );
      }

      components.header_1 = {
        type: 'image',
        value: imageUrl,
      };
    }

    requiredVariables.forEach((variableName, index) => {
      const value = input.variables[variableName];

      if (value === undefined || value === null) {
        throw new BadGatewayException(
          `Missing WhatsApp template variable: ${variableName}`,
        );
      }

      // MSG91's template API uses body_1, body_2, etc.
      components[`body_${index + 1}`] = {
        type: 'text',
        value: String(value),
      };
    });

    const payload = {
      integrated_number: integratedNumber,
      content_type: 'template',
      payload: {
        messaging_product: 'whatsapp',
        type: 'template',
        template: {
          name: templateName,
          language: {
            code: languageCode,
            policy: 'deterministic',
          },
          to_and_components: [
            {
              to: [recipient],
              components,
            },
          ],
        },
      },
    };

    let response: Response;
    let result: Msg91WhatsAppResponse;

    try {
      
      console.log('MSG91 WhatsApp request payload:', JSON.stringify(payload));
      console.log('MSG91 WhatsApp request URL:', apiUrl);
      console.log('MSG91 WhatsApp request auth key:', authKey ? '***' : 'MISSING');

      response = await fetch(apiUrl, {
        method: 'POST',
        headers: {
          accept: 'application/json',
          authkey: authKey,
          'content-type': 'application/json',
        },
        body: JSON.stringify(payload),
        signal: AbortSignal.timeout(15_000),
      });

      result = (await response.json()) as Msg91WhatsAppResponse;
    } catch (error) {
      // Do not log the Auth Key, recipient, or variable values.
      this.logger.error(
        `MSG91 WhatsApp request failed for template ${input.templateCode}: ${
          error instanceof Error ? error.name : 'UnknownError'
        }`,
      );

      throw new ServiceUnavailableException(
        'Unable to reach MSG91 WhatsApp API',
      );
    }

    if (
      !response.ok ||
      result.status?.toLowerCase() !== 'success' ||
      result.hasError === true
    ) {
      this.logger.warn(
        `MSG91 WhatsApp rejected template ${input.templateCode}; HTTP ${response.status}`,
      );

      throw new BadGatewayException(
        'MSG91 did not accept the WhatsApp message',
      );
    }

    if (!result.request_id) {
      throw new BadGatewayException(
        'MSG91 accepted the request without returning a request ID',
      );
    }

    return {
      providerMessageId: result.request_id,
      accepted: true,
    };
  }

  private normalizeRecipient(value: string): string {
    // Accept formats such as +919876543210 or 919876543210.
    const recipient = value.replace(/[\s()+-]/g, '');

    if (!/^\d{8,15}$/.test(recipient)) {
      throw new BadGatewayException(
        'WhatsApp recipient must include a valid country code',
      );
    }

    return recipient;
  }
}