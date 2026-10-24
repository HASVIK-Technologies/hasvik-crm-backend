import { Schema } from 'mongoose';
import { AuditLogEntityType } from '../enums';
import { AuditLog } from '../interfaces/audit-log.interface';

export const AuditLogSchema: Schema<AuditLog> = new Schema<AuditLog>(
  {
    tenantId: {
      type: Schema.Types.ObjectId,
      required: true,
      index: true,
    },
    userId: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      index: true,
    },
    action: {
      type: String,
      required: true,
      trim: true,
      index: true,
    },
    entityType: {
      type: String,
      enum: Object.values(AuditLogEntityType),
      required: true,
      trim: true,
      index: true,
    },
    entityId: {
      type: Schema.Types.ObjectId,
      index: true,
    },
    details: {
      type: Schema.Types.Mixed,
    }
  },
  {
    timestamps: { createdAt: true, updatedAt: false },
    collection: 'audit_logs',
  },
);

AuditLogSchema.index({ tenantId: 1, createdAt: -1 });
AuditLogSchema.index({ tenantId: 1, entityType: 1, entityId: 1, createdAt: -1 });
