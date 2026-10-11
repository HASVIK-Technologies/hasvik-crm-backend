import mongoose, { Model, Schema, Types } from 'mongoose';
import { ISubscriptionPlan } from './subscription-plan.interface';
import { SubscriptionBillingCycle, SubscriptionStatus } from '../enums';

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


export interface ISubscription {
  _id?: Types.ObjectId;
  tenantId: Types.ObjectId;
  planId: Types.ObjectId;
  planSnapshot: ISubscriptionPlanSnapshot;
  status: SubscriptionStatus;
  startDate: Date;
  endDate: Date | null;
  autoRenew: boolean;
  assignedBy: Types.ObjectId | null;
  cancelledAt: Date | null;
  cancellationReason?: string | null;
  createdAt?: Date;
  updatedAt?: Date;
}
