import { Types } from 'mongoose';
import { AuditLogAction, AuditLogEntityType } from '../enums';

export interface AuditLog {
  _id: Types.ObjectId;

  tenantId: Types.ObjectId;
  userId?: Types.ObjectId;
  action: AuditLogAction;
  entityType: AuditLogEntityType;
  entityId?: Types.ObjectId;
  details?: Record<string, unknown>;
  createdAt: Date;
}
