
import {
  BadRequestException,
  ConflictException,
  Injectable,
  Logger,
  NotFoundException,
} from '@nestjs/common';
import { Types } from 'mongoose';

import { CreateSubscriptionDto } from './dto/create-subscription.dto';
import { RenewSubscriptionDto } from './dto/renew-subscription.dto';
import { MongoService } from 'src/mongo/mongo.service';
import { SubscriptionBillingCycle, SubscriptionStatus } from 'src/mongo/enums';
import { ISubscription } from 'src/mongo/interfaces/subscription.interface';
import { ISubscriptionPlanSnapshot } from 'src/mongo/schemas/subscription.schema';
import { SubscriptionStatusDto } from './dto/subscription-status.dto';
import moment from 'moment';
import { AuthenticatedUser } from '../auth/interfaces/authenticated-user.interface';


@Injectable()
export class SubscriptionService {
  private readonly logger = new Logger(SubscriptionService.name);
   private readonly superAdmin: string = "admin@hasviktech.com";

  constructor(private readonly mongo: MongoService) {}

  /**
   * Create a subscription in PENDING status.
   * The plan snapshot is generated on the server.
   */
  async create(tenantId: string, dto: CreateSubscriptionDto) {
    this.validateObjectId(dto.tenantId, 'tenantId');
    this.validateObjectId(dto.planId, 'planId');

    try {
      const [tenant, plan] = await Promise.all([
        this.mongo.models.tenant
          .findOne({_id: this.mongo.toObjectId(dto.tenantId), isActive: true, })
          .lean()
          .exec(),

        this.mongo.models.subscriptionPlan
          .findOne({
            _id: this.mongo.toObjectId(dto.planId),
            isActive: true,
          })
          .lean()
          .exec(),
      ]);

      if (!tenant) {
        throw new NotFoundException('Tenant not found');
      }

      if (tenant.isActive === false) {
        throw new BadRequestException(
          'Cannot assign a subscription to an inactive tenant',
        );
      }

      if (!plan) {
        throw new NotFoundException(
          'Active subscription plan not found',
        );
      }

      const startDate = dto.startDate
        ? new Date(dto.startDate)
        : new Date();

      this.validateDate(startDate, 'startDate');

      const endDate = this.calculateEndDate(
        startDate,
        plan.billingCycle,
        dto.endDate,
      );

      if (endDate && endDate <= startDate) {
        throw new BadRequestException(
          'endDate must be later than startDate',
        );
      }

      const planSnapshot: ISubscriptionPlanSnapshot = {
        name: plan.name,
        code: plan.code,
        price: plan.price,
        currency: plan.currency,
        billingCycle: plan.billingCycle,
        features: (plan.features ?? []).map(
          (feature: { code: string }) => feature.code,
        ),
        limits: {
          maxUsers: plan.limits.maxUsers,
          maxBusinesses: plan.limits.maxBusinesses,
          maxFollowUps: plan.limits.maxFollowUps,
          maxNotes: plan.limits.maxNotes,
        },
      };

      const subscription: ISubscription = await this.mongo.models.subscription.create({
        tenantId: this.mongo.toObjectId(dto.tenantId),
        planId: this.mongo.toObjectId(dto.planId),
        planSnapshot,
        status: SubscriptionStatus.PENDING,
        startDate,
        endDate,
        autoRenew: dto.autoRenew ?? false,
        assignedBy: null,
        cancelledAt: null,
        cancellationReason: null,
      });

      this.logger.log( 
        `Subscription created: ${subscription._id}`,
      );

      return subscription;
    } catch (error) {
      if (this.isHttpException(error)) {
        throw error;
      }

      this.logger.error(
        'Failed to create subscription',
        error instanceof Error ? error.stack : String(error),
      );

      throw error;
    }
  }

  /**
   * Retrieve subscriptions.
   */
  async findAll(user: AuthenticatedUser) {
    const filter: Record<string, unknown> = { };

    if(user.email !== this.superAdmin) {
      // Super admin can see all tenants
      filter.tenantId = this.mongo.toObjectId(user.tenantId);
    }
    try {
      
      return await this.mongo.models.subscription
        .find(filter)
        .sort({ createdAt: -1 })
        .populate('tenantId')
        .populate('planId')
        .lean()
        .exec();
    } catch (error) {
      this.logger.error(
        'Failed to retrieve subscriptions',
        error instanceof Error ? error.stack : String(error),
      );

      throw error;
    }
  }

  /**
   * Retrieve one subscription.
   */
  async findOne(tenantId: string, id: string) {
    this.validateObjectId(id);

    const subscription = await this.mongo.models.subscription
      .findOne({_id: id, tenantId: this.mongo.toObjectId(tenantId)})
      .populate('tenantId')
      .populate('planId')
      .lean()
      .exec();

    if (!subscription) {
      throw new NotFoundException('Subscription not found');
    }

    return subscription;
  }

  /**
   * Update the status of a subscription.
   */
  async updateStatus(tenantId: string, id: string, dto: SubscriptionStatusDto) {
    this.validateObjectId(id);

    try {
      const subscription =
        await this.mongo.models.subscription.findOne({
          _id: id,
          tenantId: this.mongo.toObjectId(tenantId),
        }).exec();

      if (!subscription) {
        throw new NotFoundException('Subscription not found');
      }

      if (
        subscription.status === SubscriptionStatus.CANCELLED
      ) {
        throw new BadRequestException(
          'A cancelled subscription cannot be activated. Renew it instead.',
        );
      }

      if (subscription.status === SubscriptionStatus.EXPIRED) {
        throw new BadRequestException(
          'An expired subscription must be renewed',
        );
      }

      const tenant = await this.mongo.models.tenant
        .findById(subscription.tenantId)
        .lean()
        .exec();

      if (!tenant || tenant.isActive === false) {
        throw new BadRequestException(
          'The associated tenant does not exist or is inactive',
        );
      }

      const plan = await this.mongo.models.subscriptionPlan
        .findById(subscription.planId)
        .lean()
        .exec();

      if (!plan || !plan.isActive) {
        throw new BadRequestException(
          'The associated subscription plan is inactive or unavailable',
        );
      }

      const existingActive =
        await this.mongo.models.subscription.findOne({
          tenantId: this.mongo.toObjectId(tenantId),
          status: SubscriptionStatus.ACTIVE,
          _id: { $ne: subscription._id },
        }).lean().exec();

      if (existingActive) {
        throw new ConflictException(
          'Tenant already has an active subscription',
        );
      }

      // Start the subscription when it is activated.
      const startDate = new Date();

      const endDate = this.calculateEndDate(
        startDate,
        subscription.planSnapshot.billingCycle,
      );

      subscription.startDate = startDate;
      subscription.endDate = endDate;
      subscription.status = dto.status;

      await subscription.save();

      this.logger.log(`Subscription status updated: ${id}`);

      return subscription;
    } catch (error) {
      if (this.isHttpException(error)) {
        throw error;
      }

      if (this.isDuplicateKeyError(error)) {
        throw new ConflictException(
          'Tenant already has an active subscription',
        );
      }

      this.logger.error(
        `Failed to update subscription status: ${id}`,
        error instanceof Error ? error.stack : String(error),
      );

      throw error;
    }
  }

  /**
   * Renew an eligible subscription.
   */
  async renew(tenantId: string, id: string, dto: RenewSubscriptionDto) {
    this.validateObjectId(id);

    try {
      const subscription =
        await this.mongo.models.subscription.findOne({
          _id: id,
          tenantId: this.mongo.toObjectId(tenantId),
        }).exec();

      if (!subscription) {
        throw new NotFoundException('Subscription not found');
      }

      if (subscription.status === SubscriptionStatus.PENDING) {
        throw new BadRequestException(
          'Activate the pending subscription before renewing it',
        );
      }

      const tenant = await this.mongo.models.tenant
        .findById(subscription.tenantId)
        .lean()
        .exec();

      if (!tenant || tenant.isActive === false) {
        throw new BadRequestException(
          'The associated tenant does not exist or is inactive',
        );
      }

      const existingActive =
        await this.mongo.models.subscription.findOne({
          tenantId: subscription.tenantId,
          status: SubscriptionStatus.ACTIVE,
          _id: { $ne: subscription._id },
        }).lean().exec();

      if (existingActive) {
        throw new ConflictException(
          'Tenant already has another active subscription',
        );
      }

      const billingCycle =
        subscription.planSnapshot.billingCycle;

      if (billingCycle === SubscriptionBillingCycle.LIFETIME) {
        subscription.startDate = new Date();
        subscription.endDate = null;
      } else {
        const now = new Date();

        const renewalStart =
          subscription.endDate &&
          subscription.endDate > now &&
          subscription.status === SubscriptionStatus.ACTIVE
            ? subscription.endDate
            : now;

        const endDate = this.calculateEndDate(
          renewalStart,
          billingCycle,
          dto.endDate,
        );

        if (endDate && endDate <= renewalStart) {
          throw new BadRequestException(
            'Renewal end date must be later than the renewal start date',
          );
        }

        subscription.startDate = renewalStart;
        subscription.endDate = endDate;
      }

      subscription.status = SubscriptionStatus.ACTIVE;
      subscription.cancelledAt = null;
      subscription.cancellationReason = null;

      await subscription.save();

      this.logger.log(`Subscription renewed: ${id}`);

      return subscription;
    } catch (error) {
      if (this.isHttpException(error)) {
        throw error;
      }

      if (this.isDuplicateKeyError(error)) {
        throw new ConflictException(
          'Tenant already has an active subscription',
        );
      }

      this.logger.error(
        `Failed to renew subscription: ${id}`,
        error instanceof Error ? error.stack : String(error),
      );

      throw error;
    }
  }

  /**
   * Calculate the end date based on the billing cycle.
   * An explicit endDate can override the calculated date for non-lifetime plans.
   */
  private calculateEndDate(
    startDate: Date,
    billingCycle: SubscriptionBillingCycle,
    requestedEndDate?: string,
  ): Date | null {
    if (billingCycle === SubscriptionBillingCycle.LIFETIME) {
      if (requestedEndDate) {
        throw new BadRequestException(
          'Lifetime subscriptions cannot have an endDate',
        );
      }

      return null;
    }

    if (requestedEndDate) {
      const endDate = new Date(requestedEndDate);
      this.validateDate(endDate, 'endDate');
      return endDate;
    }

    const endDate = new Date(startDate);

    switch (billingCycle) {
      case SubscriptionBillingCycle.MONTHLY:
        endDate.setMonth(endDate.getMonth() + 1);
        break;

      case SubscriptionBillingCycle.YEARLY:
        endDate.setFullYear(endDate.getFullYear() + 1);
        break;

      default:
        throw new BadRequestException(
          'Unsupported subscription billing cycle',
        );
    }

    return endDate;
  }

  async hasTenantActiveSubscriptions(tenantId: string) {
    const now = moment();
          
    const subscription = await this.mongo.models.subscription
      .findOne({
        tenantId: this.mongo.toObjectId(tenantId),
        startDate: { $lte: now },
        endDate: { $gt: now },
      } as any)
      .lean();

    return subscription ? true : false;
  }

  private validateDate(date: Date, fieldName: string): void {
    if (Number.isNaN(date.getTime())) {
      throw new BadRequestException(
        `${fieldName} must be a valid date`,
      );
    }
  }

  private validateObjectId(
    id: string,
    fieldName = 'id',
  ): void {
    if (!Types.ObjectId.isValid(id)) {
      throw new BadRequestException(
        `Invalid ${fieldName}`,
      );
    }
  }

  private isDuplicateKeyError(
    error: unknown,
  ): error is { code: number } {
    return (
      typeof error === 'object' &&
      error !== null &&
      'code' in error &&
      error.code === 11000
    );
  }

  private isHttpException(error: unknown): boolean {
    return (
      error instanceof BadRequestException ||
      error instanceof ConflictException ||
      error instanceof NotFoundException
    );
  }
}
