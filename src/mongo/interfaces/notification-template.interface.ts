
import { Types } from 'mongoose';

import {
  NotificationCategory,
  NotificationChannel,
} from '../../mongo/enums';

export interface NotificationTemplate {
  _id?: Types.ObjectId;

  /**
   * Unique template code within its channel and tenant scope.
   * Example: FOLLOW_UP_REMINDER
   */
  code: string;

  channel: NotificationChannel;

  category: NotificationCategory;

  /**
   * Used mainly for email templates.
   */
  subject?: string | null;

  /**
   * Template content containing placeholders like {{customerName}}.
   */
  body: string;

  /**
   * Variables that must be supplied before rendering.
   */
  requiredVariables: string[];

  /**
   * Provider-specific approved template ID, when applicable.
   */
  providerTemplateId?: string | null;

  /**
   * Optional tenant-specific template.
   * Null means a shared/global template.
   */
  tenantId?: Types.ObjectId | null;

  isActive: boolean;

  createdAt?: Date;

  updatedAt?: Date;
}
