import { Types } from 'mongoose';
import { AuditLogAction, EntityType } from '../enums';

export interface AuditLog {
  _id: Types.ObjectId;

  tenantId: Types.ObjectId;
  userId?: Types.ObjectId;
  action: AuditLogAction;
  entityType: EntityType;
  entityId?: Types.ObjectId;
  message?: string;
  details?: Record<string, unknown>;
  createdAt: Date;
}
