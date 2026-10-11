import { Schema } from 'mongoose';
import { Tenant } from '../interfaces/tenant.interface';

export const TenantSchema: Schema<Tenant> = new Schema<Tenant>(
  {
    name: {
      type: String,
      required: true,
      trim: true,
      maxlength: 120,
    },
    contactEmail: {
      type: String,
      trim: true,
      lowercase: true,
    },
    contactPhone: {
      type: String,
      trim: true,
    },
    isActive: {
      type: Boolean,
      default: true,
      index: true,
    },
  },
  {
    timestamps: true,
    collection: 'tenants',
  },
);

TenantSchema.index({ code: 1 }, { unique: true });