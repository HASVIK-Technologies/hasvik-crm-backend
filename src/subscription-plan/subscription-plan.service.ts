
import {
  ConflictException,
  Injectable,
  Logger,
  NotFoundException,
  BadRequestException,
} from '@nestjs/common';
import { Types } from 'mongoose';

import { CreateSubscriptionPlanDto } from './dto/create-subscription-plan.dto';
import { UpdateSubscriptionPlanDto } from './dto/update-subscription-plan.dto';
import { QuerySubscriptionPlanDto } from './dto/query-subscription-plan.dto';
import { MongoService } from 'src/mongo/mongo.service';

@Injectable()
export class SubscriptionPlanService {
  private readonly logger = new Logger(SubscriptionPlanService.name);

  constructor(private readonly mongo: MongoService) {}

  /**
   * Create a subscription plan.
   */
  async create(dto: CreateSubscriptionPlanDto) {
    try {
      const code = dto.code.trim().toUpperCase();

      const existingPlan = await this.mongo.models.subscriptionPlan
        .findOne({ code })
        .lean()
        .exec();

      if (existingPlan) {
        throw new ConflictException(
          `Subscription plan with code '${code}' already exists`,
        );
      }

      const plan = await this.mongo.models.subscriptionPlan.create({
        ...dto,
        name: dto.name.trim(),
        code,
        currency: (dto.currency ?? 'INR').trim().toUpperCase(),
        isActive: dto.isActive ?? true,
      });

      this.logger.log(`Subscription plan created: ${plan._id}`);

      return plan;
    } catch (error) {
      if (error instanceof ConflictException) {
        throw error;
      }

      if (this.isDuplicateKeyError(error)) {
        throw new ConflictException(
          'A subscription plan with this code already exists',
        );
      }

      this.logger.error(
        'Failed to create subscription plan',
        error instanceof Error ? error.stack : String(error),
      );

      throw error;
    }
  }

  /**
   * Get subscription plans with search, filters, sorting, and pagination.
   * By default, only active plans are returned.
   */
  async findAll(query: QuerySubscriptionPlanDto) {
    const {
      search,
      billingCycle,
      isActive,
      page = 1,
      limit = 10,
      sortBy = "createdAt",
    } = query;

    const filter: Record<string, unknown> = {
      isActive: isActive ?? true,
    };

    if (billingCycle) {
      filter.billingCycle = billingCycle;
    }

    if (search?.trim()) {
      const escapedSearch = this.escapeRegex(search.trim());
      const searchRegex = new RegExp(escapedSearch, 'i');

      filter.$or = [
        { name: searchRegex },
        { code: searchRegex },
        { description: searchRegex },
      ];
    }

    const skip = (page - 1) * limit;
    const sortDirection = sortBy.startsWith('-') ? -1 : 1;
    const sortField = sortBy.startsWith('-') ? sortBy.substring(1) : sortBy;

    const sort: Record<string, 1 | -1> = {
      [sortField]: sortDirection,
    };

    try {
      const [plans, total] = await Promise.all([
        this.mongo.models.subscriptionPlan
          .find(filter)
          .sort(sort)
          .skip(skip)
          .limit(limit)
          .lean()
          .exec(),

        this.mongo.models.subscriptionPlan
          .countDocuments(filter)
          .exec(),
      ]);

      return {
        data: plans,
        total
      };
    } catch (error) {
      this.logger.error(
        'Failed to retrieve subscription plans',
        error instanceof Error ? error.stack : String(error),
      );

      throw error;
    }
  }

  /**
   * Get a subscription plan by ID.
   */
  async findOne(id: string) {
    this.validateObjectId(id);

    const plan = await this.mongo.models.subscriptionPlan
      .findById(id)
      .lean()
      .exec();

    if (!plan) {
      throw new NotFoundException(
        `Subscription plan with ID '${id}' not found`,
      );
    }

    return plan;
  }

  /**
   * Update a subscription plan.
   * Only supplied fields are updated.
   */
  async update(id: string, dto: UpdateSubscriptionPlanDto) {
    this.validateObjectId(id);

    try {
      const updateData: Record<string, unknown> = {
        ...dto,
      };

      if (dto.name !== undefined) {
        updateData.name = dto.name.trim();
      }

      if (dto.code !== undefined) {
        updateData.code = dto.code.trim().toUpperCase();
      }

      if (dto.currency !== undefined) {
        updateData.currency = dto.currency.trim().toUpperCase();
      }

      const plan = await this.mongo.models.subscriptionPlan
        .findByIdAndUpdate(
          id,
          { $set: updateData },
          {
            new: true,
            runValidators: true,
          },
        )
        .exec();

      if (!plan) {
        throw new NotFoundException(
          `Subscription plan with ID '${id}' not found`,
        );
      }

      this.logger.log(`Subscription plan updated: ${id}`);

      return plan;
    } catch (error) {
      if (
        error instanceof NotFoundException ||
        error instanceof ConflictException
      ) {
        throw error;
      }

      if (this.isDuplicateKeyError(error)) {
        throw new ConflictException(
          'A subscription plan with this code already exists',
        );
      }

      this.logger.error(
        `Failed to update subscription plan: ${id}`,
        error instanceof Error ? error.stack : String(error),
      );

      throw error;
    }
  }

  /**
   * Activate or deactivate a subscription plan.
   */
  async updateStatus(id: string, isActive: boolean) {
    this.validateObjectId(id);

    if (typeof isActive !== 'boolean') {
      throw new BadRequestException(
        'isActive must be a boolean',
      );
    }

    const plan = await this.mongo.models.subscriptionPlan
      .findByIdAndUpdate(
        id,
        { $set: { isActive } },
        {
          new: true,
          runValidators: true,
        },
      )
      .exec();

    if (!plan) {
      throw new NotFoundException(
        `Subscription plan with ID '${id}' not found`,
      );
    }

    this.logger.log(
      `Subscription plan ${id} ${isActive ? 'activated' : 'deactivated'}`,
    );

    return plan;
  }

  /**
   * Validate MongoDB ObjectId.
   */
  private validateObjectId(id: string): void {
    if (!Types.ObjectId.isValid(id)) {
      throw new BadRequestException('Invalid subscription plan ID');
    }
  }

  /**
   * Escape special characters before constructing a search regex.
   */
  private escapeRegex(value: string): string {
    return value.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
  }

  /**
   * Check for MongoDB duplicate-key errors.
   */
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
}
