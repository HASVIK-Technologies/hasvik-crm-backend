import {
  Injectable,
  Logger,
  NotFoundException,
} from '@nestjs/common';
import { isObjectIdOrHexString, Types } from 'mongoose';

import { MongoService } from '../mongo/mongo.service';
import { FollowUp } from '../mongo/interfaces';

import { CreateFollowUpDto } from './dto/create-follow-up.dto';
import { UpdateFollowUpDto } from './dto/update-follow-up.dto';
import { FollowUpFilterDto } from './dto/get-follow-up-filter.dto';
import { FollowUpStatus, NoteEntityType } from '../mongo/enums';
import { FollowUpKpiResponse } from './interface/kpis-response';
import moment from 'moment-timezone';

@Injectable()
export class FollowUpService {
  private readonly logger = new Logger(FollowUpService.name);

  constructor(
    private readonly mongo: MongoService,
  ) {}

  // CREATE FOLLOW-UP
  async create(
    data: CreateFollowUpDto,
    userId: string,
  ): Promise<FollowUp> {
    this.logger.log(
      `Creating follow-up. Business ID: ${data.businessId}, Assigned To: ${data.assignedTo}, User ID: ${userId}`,
    );

    if (!isObjectIdOrHexString(data.businessId)) {
      this.logger.warn(
        `Invalid business ID while creating follow-up: ${data.businessId}`,
      );

      throw new NotFoundException(
        'Invalid business id.',
      );
    }

    if (!isObjectIdOrHexString(data.assignedTo)) {
      this.logger.warn(
        `Invalid assigned user ID while creating follow-up: ${data.assignedTo}`,
      );

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
      this.logger.warn(
        `Business not found while creating follow-up. Business ID: ${data.businessId}`,
      );

      throw new NotFoundException(
        'Business not found.',
      );
    }

    // Verify assigned user exists
    const user = await this.mongo.models.user.findOne({
      _id: data.assignedTo,
      isDeleted: false,
    });

    if (!user) {
      this.logger.warn(
        `Assigned user not found while creating follow-up. User ID: ${data.assignedTo}`,
      );

      throw new NotFoundException(
        'Assigned user not found.',
      );
    }

    // Create follow-up
    const followUp = new this.mongo.models.followUp({
      ...data,
      createdBy: userId,
    });

    const savedFollowUp = await followUp.save();

    this.logger.log(
      `Follow-up created successfully. Follow-up ID: ${savedFollowUp._id}`,
    );

    if(data.notes) {
      // Create note for the follow-up
      const note = new this.mongo.models.note({ 
        entityId: savedFollowUp._id,
        entityType: NoteEntityType.FOLLOW_UP,
        content: data.notes,
        createdBy: userId,
      });
      await note.save();
      this.logger.log(
        `Note created for follow-up. Note ID: ${note._id}, Follow-up ID: ${savedFollowUp._id}`,
      );
    }

    return savedFollowUp;
  }

  // GET FOLLOW-UP BY ID
  async findById(
    id: string,
  ): Promise<FollowUp & { notes: any[] }> {
    this.logger.log(
      `Fetching follow-up by ID: ${id}`,
    );

    if (!isObjectIdOrHexString(id)) {
      this.logger.warn(
        `Invalid follow-up ID: ${id}`,
      );

      throw new NotFoundException(
        'Invalid follow-up id.',
      );
    }

    const followUp = await this.mongo.models.followUp
      .findById(id)
      .lean()
      .exec();

    if (!followUp) {
      this.logger.warn(
        `Follow-up not found. Follow-up ID: ${id}`,
      );

      throw new NotFoundException(
        'Follow-up not found.',
      );
    }

    const notes = await this.mongo.models.note
      .find({
        entityType: NoteEntityType.FOLLOW_UP,
        entityId: followUp._id,
      })
      .sort({
        createdAt: -1,
      })
      .lean()
      .exec();

    this.logger.log(
      `Follow-up fetched successfully. Follow-up ID: ${id}, Notes: ${notes.length}`,
    );

    return {
      ...followUp,
      notes,
    } as FollowUp & { notes: any[] };
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

    this.logger.log(
      `Fetching follow-ups. Page: ${page}, Limit: ${limit}, Business ID: ${businessId || 'none'}, Assigned To: ${assignedTo || 'none'}`,
    );

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

    this.logger.log(
      `Follow-ups fetched successfully. Count: ${followUps.length}, Total: ${total}`,
    );

    return {
      data: followUps as FollowUp[],
      total,
    };
  }

  // GET BUSINESS FOLLOW-UP HISTORY
  async findByBusiness(
    businessId: string,
  ): Promise<FollowUp[]> {
    this.logger.log(
      `Fetching follow-up history. Business ID: ${businessId}`,
    );

    if (!isObjectIdOrHexString(businessId)) {
      this.logger.warn(
        `Invalid business ID: ${businessId}`,
      );

      throw new NotFoundException(
        'Invalid business id.',
      );
    }

    const followUps =
      await this.mongo.models.followUp
        .find({
          businessId,
        })
        .sort({
          scheduledAt: -1,
        })
        .lean()
        .exec();

    this.logger.log(
      `Business follow-up history fetched successfully. Business ID: ${businessId}, Count: ${followUps.length}`,
    );

    return followUps as FollowUp[];
  }

  // GET USER FOLLOW-UPS
  async findByAssignedUser(
    userId: string,
  ): Promise<FollowUp[]> {
    this.logger.log(
      `Fetching follow-ups for assigned user. User ID: ${userId}`,
    );

    if (!isObjectIdOrHexString(userId)) {
      this.logger.warn(
        `Invalid user ID: ${userId}`,
      );

      throw new NotFoundException(
        'Invalid user id.',
      );
    }

    const followUps =
      await this.mongo.models.followUp
        .find({
          assignedTo: userId,
        })
        .sort({
          scheduledAt: 1,
        })
        .lean()
        .exec();

    this.logger.log(
      `User follow-ups fetched successfully. User ID: ${userId}, Count: ${followUps.length}`,
    );

    return followUps as FollowUp[];
  }

  // UPDATE FOLLOW-UP
  async update(
    id: string,
    dto: UpdateFollowUpDto,
  ): Promise<FollowUp> {
    this.logger.log(
      `Updating follow-up. Follow-up ID: ${id}`,
    );

    if (!isObjectIdOrHexString(id)) {
      this.logger.warn(
        `Invalid follow-up ID: ${id}`,
      );

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
      this.logger.warn(
        `Follow-up not found while updating. Follow-up ID: ${id}`,
      );

      throw new NotFoundException(
        'Follow-up not found.',
      );
    }

    this.logger.log(
      `Follow-up updated successfully. Follow-up ID: ${id}`,
    );

    return followUp as FollowUp;
  }

  async getKpis(): Promise<FollowUpKpiResponse> {
    this.logger.log(
      `Fetching follow-up KPIs.`,
    );
    
    const startOfToday = moment.utc().startOf('day');
    const startOfTomorrow = moment.utc().add(1, 'day').startOf('day');

    const match: Record<string, any> = {};

    const pipeline: any = [
      {
        $match: match,
      },

      {
        $facet: {
          // Total Follow-ups
          total: [
            {
              $count: 'count',
            },
          ],

          // Today's Follow-ups
          today: [
            {
              $match: {
                scheduledAt: {
                  $gte: startOfToday.toDate(),
                  $lt: startOfTomorrow.toDate(),
                },
              },
            },
            {
              $count: 'count',
            },
          ],

          // Upcoming Follow-ups
          upcoming: [
            {
              $match: {
                scheduledAt: {
                  $gte: startOfTomorrow.toDate(),
                },
                status: FollowUpStatus.SCHEDULED,
              },
            },
            {
              $count: 'count',
            },
          ],

          // Overdue Follow-ups
          overdue: [
            {
              $match: {
                scheduledAt: {
                  $lt: startOfToday.toDate(),
                },
                status: FollowUpStatus.SCHEDULED,
              },
            },
            {
              $count: 'count',
            },
          ],
        },
      },

      {
        $project: {
          total: {
            $ifNull: [
              { $arrayElemAt: ['$total.count', 0] },
              0,
            ],
          },

          today: {
            $ifNull: [
              { $arrayElemAt: ['$today.count', 0] },
              0,
            ],
          },

          upcoming: {
            $ifNull: [
              { $arrayElemAt: ['$upcoming.count', 0] },
              0,
            ],
          },

          overdue: {
            $ifNull: [
              { $arrayElemAt: ['$overdue.count', 0] },
              0,
            ],
          },
        },
      },
    ];
    
    const [result] = await this.mongo.models.followUp.aggregate(pipeline);

    return (
      result ?? {
        total: 0,
        today: 0,
        upcoming: 0,
        overdue: 0,
      }
    );
  }
}