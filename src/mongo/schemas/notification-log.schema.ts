import { Schema } from 'mongoose';

import {
  NotificationCategory,
  NotificationChannel,
  NotificationStatus,
} from '../enums/notification-types.enum';
import { NotificationLog } from '../interfaces/notification-log.interface';

export const NotificationLogSchema : Schema<NotificationLog> = new Schema<NotificationLog>(
  {
    tenantId: {
      type: Schema.Types.ObjectId,
      required: false,
      index: true,
    },

    channel: {
      type: String,
      enum: Object.values(NotificationChannel),
      required: true,
    },

    category: {
      type: String,
      enum: Object.values(NotificationCategory),
      required: true,
    },

    recipient: {
      type: String,
      required: true,
      trim: true,
    },

    templateCode: {
      type: String,
      required: true,
      trim: true,
    },

    variables: {
      type: Schema.Types.Mixed,
      default: {},
    },

    status: {
      type: String,
      enum: Object.values(NotificationStatus),
      default: NotificationStatus.QUEUED,
      required: true,
      index: true,
    },

    provider: {
      type: String,
      default: 'msg91',
      required: true,
    },

    providerMessageId: {
      type: String,
      default: null,
    },

    attempts: {
      type: Number,
      default: 0,
      min: 0,
    },

    scheduledAt: {
      type: Date,
      default: Date.now,
      index: true,
    },

    processedAt: {
      type: Date,
      default: null,
    },

    lastError: {
      type: String,
      default: null,
    },

    idempotencyKey: {
      type: String,
      default: null,
    },

    metadata: {
      type: Schema.Types.Mixed,
      default: {},
    },
  },
  {
    timestamps: true,
    collection: 'notification_logs',
    versionKey: false,
  },
);

NotificationLogSchema.index({
  status: 1,
  scheduledAt: 1,
});

NotificationLogSchema.index(
  { idempotencyKey: 1 },
  {
    unique: true,
    partialFilterExpression: {
      idempotencyKey: { $type: 'string' },
    },
  },
);

NotificationLogSchema.index({
  tenantId: 1,
  createdAt: -1,
});