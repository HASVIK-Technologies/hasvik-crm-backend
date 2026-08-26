import {
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { isObjectIdOrHexString } from 'mongoose';

import { MongoService } from '../mongo/mongo.service';
import { FollowUp, FollowUpStatus } from 'src/mongo/interfaces/follow-up.interface';


import { CreateFollowUpDto } from './dto/create-follow-up.dto';
import { UpdateFollowUpDto } from './dto/update-follow-up.dto';
import { FollowUpFilterDto } from './dto/get-follow-up-filter.dto';

@Injectable()
export class FollowUpService {
  constructor(
    private readonly mongo: MongoService,
  ) {}

  // CREATE FOLLOW-UP
  async create(
    data: CreateFollowUpDto,
    userId: string,
  ): Promise<FollowUp> {
    if (!isObjectIdOrHexString(data.businessId)) {
      throw new NotFoundException(
        'Invalid business id.',
      );
    }

    if (!isObjectIdOrHexString(data.assignedTo)) {
      throw new NotFoundException(
        'Invalid assigned user id.',
      );
    }

    // Verify business exists
    const business = await this.mongo.models.business.findOne({
      _id: data.businessId,
      isDeleted: false,
    });

    if (!business) {
      throw new NotFoundException(
        'Business not found.',
      );
    }

    // Verify assigned user exists
    const user = await this.mongo.models.user.findOne({
      _id: data.assignedTo,
      isDeleted: false,
    });

    // if (!user) {
    //   throw new NotFoundException(
    //     'Assigned user not found.',
    //   );
    // }

    const followUp = new this.mongo.models.followUp({
      ...data,
      createdBy: "6a8f52467269f2cb3f23f0e1",
    });

    return await followUp.save();
  }

  // GET FOLLOW-UP BY ID
  async findById(
    id: string,
  ): Promise<FollowUp> {
    if (!isObjectIdOrHexString(id)) {
      throw new NotFoundException(
        'Invalid follow-up id.',
      );
    }

    const followUp = await this.mongo.models.followUp
      .findById(id)
      .lean()
      .exec();

    if (!followUp) {
      throw new NotFoundException(
        'Follow-up not found.',
      );
    }

    return followUp as FollowUp;
  }

  // GET ALL FOLLOW-UPS
  async findAll(
    query: FollowUpFilterDto,
  ): Promise<{
    data: FollowUp[];
    total: number;
  }> {
    const {
      businessId,
      assignedTo,
      status,
      type,
      fromDate,
      toDate,
    } = query;

    const page = Number(query.page) || 1;
    const limit = Number(query.limit) || 10;

    const filter: Record<string, any> = {};

    if (businessId) {
      filter.businessId = businessId;
    }

    if (assignedTo) {
      filter.assignedTo = assignedTo;
    }

    if (status) {
      filter.status = status;
    }

    if (type) {
      filter.type = type;
    }

    // Date range
    if (fromDate || toDate) {
      filter.scheduledAt = {};

      if (fromDate) {
        filter.scheduledAt.$gte =
          new Date(fromDate);
      }

      if (toDate) {
        filter.scheduledAt.$lte =
          new Date(toDate);
      }
    }

    const skip = (page - 1) * limit;

    const [followUps, total] =
      await Promise.all([
        this.mongo.models.followUp
          .find(filter)
          .sort({ scheduledAt: 1 })
          .skip(skip)
          .limit(limit)
          .lean()
          .exec(),

        this.mongo.models.followUp
          .countDocuments(filter),
      ]);

    return {
      data: followUps as FollowUp[],
      total,
    };
  }

  // GET BUSINESS FOLLOW-UP HISTORY
  async findByBusiness(
    businessId: string,
  ): Promise<FollowUp[]> {
    if (!isObjectIdOrHexString(businessId)) {
      throw new NotFoundException(
        'Invalid business id.',
      );
    }

    return await this.mongo.models.followUp
      .find({
        businessId,
      })
      .sort({
        scheduledAt: -1,
      })
      .lean()
      .exec() as FollowUp[];
  }

  // GET USER FOLLOW-UPS
  async findByAssignedUser(
    userId: string,
  ): Promise<FollowUp[]> {
    if (!isObjectIdOrHexString(userId)) {
      throw new NotFoundException(
        'Invalid user id.',
      );
    }

    return await this.mongo.models.followUp
      .find({
        assignedTo: userId,
      })
      .sort({
        scheduledAt: 1,
      })
      .lean()
      .exec() as FollowUp[];
  }

  // UPDATE FOLLOW-UP
  async update(
    id: string,
    dto: UpdateFollowUpDto,
  ): Promise<FollowUp> {
    if (!isObjectIdOrHexString(id)) {
      throw new NotFoundException(
        'Invalid follow-up id.',
      );
    }

    const followUp =
      await this.mongo.models.followUp
        .findByIdAndUpdate(
          id,
          dto,
          {
            new: true,
            runValidators: true,
          },
        )
        .lean()
        .exec();

    if (!followUp) {
      throw new NotFoundException(
        'Follow-up not found.',
      );
    }

    return followUp as FollowUp;
  }
}