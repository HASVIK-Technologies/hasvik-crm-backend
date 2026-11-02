import { Types } from 'mongoose';
import {
  NotificationCategory,
  NotificationChannel,
  NotificationStatus,
  NotificationVariables,
} from '../enums';

export interface NotificationLog {
  _id?: Types.ObjectId;

  tenantId?: Types.ObjectId;

  channel: NotificationChannel;

  category: NotificationCategory;

  recipient: string;

  templateCode: string;

  variables: NotificationVariables;

  status: NotificationStatus;

  provider: string;

  providerMessageId?: string | null;

  attempts: number;

  scheduledAt: Date;

  processedAt?: Date | null;

  lastError?: string | null;

  idempotencyKey?: string | null;

  metadata: Record<string, unknown>;

  createdAt?: Date;

  updatedAt?: Date;
}