import { SubscriptionBillingCycle } from "../enums";

export interface ISubscriptionPlanFeature {
  code: string;
  name: string;
  description?: string;
}

export interface ISubscriptionPlanLimits {
  maxUsers: number;
  maxBusinesses: number;
  maxFollowUps: number;
  maxNotes: number;
}

export interface ISubscriptionPlan {
  name: string;
  code: string;
  description?: string;
  price: number;
  currency: string;
  billingCycle: SubscriptionBillingCycle;
  features: ISubscriptionPlanFeature[];
  limits: ISubscriptionPlanLimits;
  isActive: boolean;
  createdAt?: Date;
  updatedAt?: Date;
}
