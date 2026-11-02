import { ConfigService } from '@nestjs/config';
import { NotificationChannel } from '../../mongo/enums';
import { Msg91Provider } from './msg91.provider';

describe('Msg91Provider', () => {
  const originalFetch = global.fetch;

  afterEach(() => {
    global.fetch = originalFetch;
  });

  it('sends WhatsApp templates without requiring an image header', async () => {
    let requestInit: RequestInit | undefined;
    global.fetch = (
      _input: RequestInfo | URL,
      init?: RequestInit,
    ): Promise<Response> => {
      requestInit = init;
      return Promise.resolve(
        new Response(
          JSON.stringify({ status: 'success', request_id: 'request-123' }),
          { status: 200 },
        ),
      );
    };

    const configService = {
      get: jest.fn((key: string) => {
        if (key === 'MSG91_AUTH_KEY') {
          return 'test-auth-key';
        }

        if (key === 'MSG91_WHATSAPP_INTEGRATED_NUMBER') {
          return 'test-integrated-number';
        }

        return undefined;
      }),
    } as unknown as ConfigService;
    const provider = new Msg91Provider(configService);

    await expect(
      provider.send({
        channel: NotificationChannel.WHATSAPP,
        recipient: '+919876543210',
        templateCode: 'FOLLOW_UP_REMINDER',
        providerTemplateId: 'approved-reminder',
        requiredVariables: ['businessName'],
        variables: { businessName: 'Acme' },
      }),
    ).resolves.toEqual({
      providerMessageId: 'request-123',
      accepted: true,
    });

    const requestBodyString = requestInit?.body;
    if (typeof requestBodyString !== 'string') {
      throw new Error('MSG91 request body was not serialized as JSON');
    }

    const requestBody = JSON.parse(requestBodyString) as {
      payload: {
        template: {
          to_and_components: Array<{
            components: Record<string, { type: string; value: string }>;
          }>;
        };
      };
    };
    expect(
      requestBody.payload.template.to_and_components[0].components,
    ).toEqual({
      body_1: { type: 'text', value: 'Acme' },
    });
  });
});
