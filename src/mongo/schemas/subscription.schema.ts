
import { Schema, Types } from 'mongoose';
import { SubscriptionBillingCycle, SubscriptionStatus } from '../enums';
import { SubscriptionPlanSchema } from './subscription-plan.schema';
import { ISubscription } from '../interfaces';

export interface ISubscriptionPlanSnapshot {
  name: string;
  code: string;
  price: number;
  currency: string;
  billingCycle: SubscriptionBillingCycle;
  features: string[];
  limits: {
    maxUsers: number;
    maxBusinesses: number;
    maxFollowUps: number;
    maxNotes: number;
  };
}

export const SubscriptionPlanSnapshotSchema =
  new Schema<ISubscriptionPlanSnapshot>(
    {
      name: {
        type: String,
        required: true,
        trim: true,
      },
      code: {
        type: String,
        required: true,
        trim: true,
        uppercase: true,
      },
      price: {
        type: Number,
        required: true,
        min: 0,
      },
      currency: {
        type: String,
        required: true,
        trim: true,
        uppercase: true,
        minlength: 3,
        maxlength: 3,
      },
      billingCycle: {
        type: String,
        enum: Object.values(SubscriptionBillingCycle),
        required: true,
      },
      features: {
        type: [String],
        default: [],
      },
      limits: {
        maxUsers: {
          type: Number,
          required: true,
          min: -1,
        },
        maxBusinesses: {
          type: Number,
          required: true,
          min: -1,
        },
        maxFollowUps: {
          type: Number,
          required: true,
          min: -1,
        },
        maxNotes: {
          type: Number,
          required: true,
          min: -1,
        },
      },
    },
    {
      _id: false,
      id: false,
    },
  );
  
export const SubscriptionSchema =
  new Schema<ISubscription>(
    {
      businessId: {
        type: Schema.Types.ObjectId,
        ref: 'Business',
        required: true,
        index: true,
      },
      planId: {
        type: Schema.Types.ObjectId,
        ref: 'SubscriptionPlan',
        required: true,
        index: true,
      },
      planSnapshot: {
        type: SubscriptionPlanSnapshotSchema,
        required: true,
      },
      status: {
        type: String,
        enum: Object.values(SubscriptionStatus),
        required: true,
        default: SubscriptionStatus.PENDING,
        index: true,
      },
      startDate: {
        type: Date,
        required: true,
      },
      endDate: {
        type: Date,
        default: null,
      },
      autoRenew: {
        type: Boolean,
        default: false,
      },
      assignedBy: {
        type: Schema.Types.ObjectId,
        ref: 'User',
        default: null,
      },
      cancelledAt: {
        type: Date,
        default: null,
      },
      cancellationReason: {
        type: String,
        trim: true,
        maxlength: 500,
        default: null,
      },
      notes: {
        type: String,
        trim: true,
        maxlength: 1000,
        default: null,
      },
    },
    {
      timestamps: true,
      collection: 'subscriptions',
      versionKey: false,
    },
  );

// Prevent multiple simultaneously active subscriptions per business.
// The service must expire an old subscription before activating another.
SubscriptionSchema.index(
  { businessId: 1 },
  {
    unique: true,
    partialFilterExpression: {
      status: SubscriptionStatus.ACTIVE,
    },
  },
);

SubscriptionSchema.index({
  businessId: 1,
  createdAt: -1,
});

SubscriptionSchema.index({
  status: 1,
  endDate: 1,
});
