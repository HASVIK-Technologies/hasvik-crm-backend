import { Schema, Types } from 'mongoose';
import { FollowUp } from '../interfaces';
import {FollowUpType,FollowUpStatus } from '../enums'

export const FollowUpSchema: Schema<FollowUp> = new Schema<FollowUp>(
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

    reminderInMinutes: {
      type: Number,
      min: 0,
      default: null,
    },

    status: {
      type: String,
      enum: Object.values(FollowUpStatus),
      default: FollowUpStatus.SCHEDULED,
      index: true,
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
// Business follow-up history and business-specific date filtering
FollowUpSchema.index({
  businessId: 1,
  scheduledAt: -1,
});

// Assigned user's follow-ups, including status and date filtering
FollowUpSchema.index({
  assignedTo: 1,
  status: 1,
  scheduledAt: 1,
});

// General scheduled, upcoming, and overdue queries
FollowUpSchema.index({
  status: 1,
  scheduledAt: 1,
});

// Optional: add only if you frequently sort or filter by type
FollowUpSchema.index({
  type: 1,
  scheduledAt: 1,
});
