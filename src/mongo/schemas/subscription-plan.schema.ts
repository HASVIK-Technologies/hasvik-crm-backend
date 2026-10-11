
import mongoose, { Model, Schema } from 'mongoose';
import { ISubscriptionPlan, ISubscriptionPlanFeature, ISubscriptionPlanLimits } from '../interfaces';
import { SubscriptionBillingCycle } from '../enums';

const SubscriptionPlanFeatureSchema =
  new Schema<ISubscriptionPlanFeature>(
    {
      code: {
        type: String,
        required: true,
        trim: true,
        uppercase: true,
      },
      name: {
        type: String,
        required: true,
        trim: true,
      },
      description: {
        type: String,
        trim: true,
        default: null,
      },
    },
    { _id: false },
  );

const SubscriptionPlanLimitsSchema =
  new Schema<ISubscriptionPlanLimits>(
    {
      maxUsers: {
        type: Number,
        required: true,
        min: -1,
        default: 1,
      },
      maxBusinesses: {
        type: Number,
        required: true,
        min: -1,
        default: 100,
      },
      maxFollowUps: {
        type: Number,
        required: true,
        min: -1,
        default: 500,
      },
      maxNotes: {
        type: Number,
        required: true,
        min: -1,
        default: 1000,
      },
    },
    { _id: false },
  );

export const SubscriptionPlanSchema =
  new Schema<ISubscriptionPlan>(
    {
      name: {
        type: String,
        required: true,
        trim: true,
        maxlength: 100,
      },
      code: {
        type: String,
        required: true,
        trim: true,
        uppercase: true,
        maxlength: 50,
      },
      description: {
        type: String,
        trim: true,
        default: null,
        maxlength: 500,
      },
      price: {
        type: Number,
        required: true,
        min: 0,
        default: 0,
      },
      currency: {
        type: String,
        required: true,
        uppercase: true,
        trim: true,
        default: 'INR',
        minlength: 3,
        maxlength: 3,
      },
      billingCycle: {
        type: String,
        enum: Object.values(SubscriptionBillingCycle),
        required: true,
        default: SubscriptionBillingCycle.MONTHLY,
      },
      features: {
        type: [SubscriptionPlanFeatureSchema],
        default: [],
      },
      limits: {
        type: SubscriptionPlanLimitsSchema,
        required: true,
        default: () => ({}),
      },
      isActive: {
        type: Boolean,
        default: true,
        index: true,
      },
    },
    {
      timestamps: true,
      collection: 'subscriptionPlans',
      versionKey: false,
    },
  );

// Only one non-deleted plan can use a given code.
SubscriptionPlanSchema.index(
  { code: 1 },
  {
    unique: true,
    partialFilterExpression: { isActive: false },
  },
);
