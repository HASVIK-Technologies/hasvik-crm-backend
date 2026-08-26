import { Schema, Types } from 'mongoose';
import { FollowUp, FollowUpStatus, FollowUpType } from '../interfaces';

export const FollowUpSchema: Schema<FollowUp> = new Schema(
  {
    businessId: {
      type: Types.ObjectId,
      ref: 'Business',
      required: true,
      index: true,
    },

    assignedTo: {
      type: Types.ObjectId,
      ref: 'User',
      required: true,
      index: true,
    },

    type: {
      type: String,
      enum: Object.values(FollowUpType),
      required: true,
      index: true,
    },

    scheduledAt: {
      type: Date,
      required: true,
      index: true,
    },

    status: {
      type: String,
      enum: Object.values(FollowUpStatus),
      default: FollowUpStatus.PENDING,
      index: true,
    },

    notes: {
      type: String,
      trim: true,
    },

    completedAt: {
      type: Date,
    },

    createdBy: {
      type: Types.ObjectId,
      ref: 'User',
      required: true,
    },

    updatedBy: {
      type: Types.ObjectId,
      ref: 'User',
    },
  },
  {
    timestamps: true,
    collection: 'followups',
  },
);

/**
 * Indexes
 */

// Business follow-up history
FollowUpSchema.index({
  businessId: 1,
  scheduledAt: -1,
});

// User's follow-ups
FollowUpSchema.index({
  assignedTo: 1,
  scheduledAt: 1,
});

// Pending/upcoming/overdue queries
FollowUpSchema.index({
  status: 1,
  scheduledAt: 1,
});

// Dashboard queries
FollowUpSchema.index({
  scheduledAt: 1,
  status: 1,
});