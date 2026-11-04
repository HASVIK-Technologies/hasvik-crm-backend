
import { Schema, Types } from 'mongoose';
import { Tag } from '../interfaces';

export const TagSchema: Schema<Tag> = new Schema<Tag>(
  {
    tenantId: {
      type: Types.ObjectId,
      required: true,
      ref: 'Tenant',
      index: true,
    },

    name: {
      type: String,
      required: true,
      trim: true,
    },

    key: {
      type: String,
      required: true,
      trim: true,
      lowercase: true,
    },

    color: {
      type: String,
      default: '#64748B',
    },

    description: {
      type: String,
      trim: true,
      default: null,
    },

    isActive: {
      type: Boolean,
      default: true,
    },

    createdBy: {
      type: Types.ObjectId,
      required: true,
      ref: 'User',
    },

    updatedBy: {
      type: Types.ObjectId,
      default: null,
      ref: 'User',
    },
  },
  {
    timestamps: true,
    versionKey: false,
    collection: 'tags',
  },
);

// Prevent duplicate tag keys within the same tenant
TagSchema.index(
  { tenantId: 1, key: 1 },
  { unique: true },
);

// Optimize active tag listing by tenant
TagSchema.index(
  { tenantId: 1, isActive: 1, name: 1 },
);
