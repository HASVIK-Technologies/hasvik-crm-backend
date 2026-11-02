import { NotificationChannel, NotificationVariables } from "../../mongo/enums";

import { NotificationProviderName } from '../../mongo/enums';

export interface SendNotificationInput {
  channel: NotificationChannel;
  recipient: string;
  templateCode: string;
  variables: NotificationVariables;

  // Required for MSG91 WhatsApp template delivery
  providerTemplateId?: string;
  requiredVariables?: string[];
}

export interface SendNotificationResult {
  providerMessageId: string;
  accepted: boolean;
}

export interface NotificationProvider {
  readonly name: NotificationProviderName;

  supports(channel: NotificationChannel): boolean;

  send(
    input: SendNotificationInput,
  ): Promise<SendNotificationResult>;
}

export interface Msg91WhatsAppResponse {
  status?: string;
  data?: string;
  request_id?: string;
  errors?: unknown;
  hasError?: boolean;
  message?: string;
  [key: string]: unknown;
}