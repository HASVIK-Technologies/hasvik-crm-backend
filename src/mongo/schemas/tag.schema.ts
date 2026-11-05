
import { Schema, Types } from 'mongoose';
import { Tag } from '../interfaces';
import { EntityType } from '../enums';

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

    entityType: {
      type: String,
      enum: Object.values(EntityType),
      index: true,
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

TagSchema.index(
  { tenantId: 1, entityType: 1, key: 1 },
  { unique: true },
);

TagSchema.index({
  tenantId: 1,
  entityType: 1,
  isActive: 1,
});