
import { Schema } from 'mongoose';

import {
  NotificationCategory,
  NotificationChannel,
} from '../../mongo/enums';

import { NotificationTemplate } from '../interfaces/notification-template.interface';

export const NOTIFICATION_TEMPLATE_MODEL = 'NotificationTemplate';

export const NotificationTemplateSchema: Schema<NotificationTemplate> =
  new Schema<NotificationTemplate>(
    {
      code: {
        type: String,
        required: true,
        trim: true,
        uppercase: true,
        maxlength: 100,
        match: /^[A-Z0-9_]+$/,
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

      subject: {
        type: String,
        default: null,
        trim: true,
      },

      body: {
        type: String,
        required: true,
        trim: true,
      },

      requiredVariables: {
        type: [String],
        default: [],
      },

      providerTemplateId: {
        type: String,
        default: null,
        trim: true,
      },

      tenantId: {
        type: Schema.Types.ObjectId,
        default: null,
        index: true,
      },

      isActive: {
        type: Boolean,
        default: true,
        index: true,
      },
    },
    {
      timestamps: true,
      collection: 'notification_templates',
      versionKey: false,
    },
  );

/**
 * Prevent duplicate template codes for the same channel and tenant.
 */
NotificationTemplateSchema.index(
  {
    tenantId: 1,
    channel: 1,
    code: 1,
  },
  {
    unique: true,
  },
);

/**
 * Quickly find active templates for a channel.
 */
NotificationTemplateSchema.index({
  channel: 1,
  isActive: 1,
});
