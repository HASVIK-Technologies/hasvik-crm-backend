import {
  Injectable,
  ConflictException,
  NotFoundException,
  Logger,
} from '@nestjs/common';
import { isObjectIdOrHexString } from 'mongoose';

import { MongoService } from '../mongo/mongo.service';
import { Business } from 'src/mongo/interfaces';

import { CreateBusinessDto } from './dto/create-business.dto';
import { UpdateBusinessDto } from './dto/update-business.dto';
import { BusinessFilterDto, BusinessKPIsDto } from './dto/get-business-filter.dto';
import {BusinessResponse} from './interface/business-response';
import {BusinessKpiResponse} from './interface/kpis-response'
import { BusinessStatus } from '../mongo/enums';
import { FollowUpService } from '../followup/followup.service';
import { FollowUpResponse } from 'src/followup/interface/followup-response';

@Injectable()
export class BusinessService {
  private readonly logger = new Logger(BusinessService.name);

  constructor(
    private readonly mongo: MongoService,
    private readonly followUpService: FollowUpService,
  ) {}

  // CREATE BUSINESS
  async create(
    data: CreateBusinessDto,
    userId: string,
  ): Promise<BusinessResponse & { followUp: FollowUpResponse | null }> {
    this.logger.log(
      `Creating business. Name: ${data.name}, User ID: ${userId}`,
    );

    const existingBusiness =
      await this.mongo.models.business.findOne({
        name: data.name,
        city: data.city,
      });

    if (existingBusiness) {
      this.logger.warn(
        `Business already exists. Name: ${data.name}, City: ${data.city}`,
      );

      const errorMessage: string = existingBusiness.isActive ? 
        `Business already exists with Name: ${data.name}, City: ${data.city}`
       : 
        `Business is inactive with Name: ${data.name}, City: ${data.city}`
      ;
      throw new ConflictException(errorMessage);
    }

    // Remove followUp before creating the Business document
    const { followUp: followUpData, ...businessData } = data;
  
    const business = new this.mongo.models.business({
      ...businessData,
      createdBy: this.mongo.toObjectId(userId)
    });

    let createdBusiness = await business.save();

    await createdBusiness.populate([
      {
        path: 'categoryId',
        select: '_id name',
      },
      {
        path: 'assignedTo',
        select: '_id fullName',
      },
    ]);
    
    this.logger.log(
      `Business created successfully. Business ID: ${createdBusiness._id}`,
    );

    let followUp:FollowUpResponse | null = null;
    if (followUpData) {
      followUp = await this.followUpService.create(
        {
          ...followUpData,
          businessId: createdBusiness._id.toString(),
        },
        userId,
      );
    }

    const businessResponse = this.mapBusinessResponse(
      createdBusiness.toObject(),
    );

    return {
      ...businessResponse,
      followUp,
    };
  }

  // FIND BUSINESS BY ID
  async findById(id: string): Promise<BusinessResponse> {
    this.logger.log(
      `Fetching business by ID: ${id}`,
    );

    if (!isObjectIdOrHexString(id)) {
      this.logger.warn(
        `Invalid business ID: ${id}`,
      );

      throw new NotFoundException(
        'Invalid business id.',
      );
    }

    const business =
      await this.mongo.models.business
        .findOne({
          _id: this.mongo.toObjectId(id),
        })
        .populate('categoryId', '_id name')
        .populate('assignedTo', '_id fullName')
        .lean()
        .exec();

    if (!business) {
      this.logger.warn(
        `Business not found. Business ID: ${id}`,
      );

      throw new NotFoundException(
        'Business not found.',
      );
    }

    this.logger.log(
      `Business fetched successfully. Business ID: ${id}`,
    );

    //return business as Business;
    return this.mapBusinessResponse(business);
  }

  // UPDATE BUSINESS
  async update(
    id: string,
    dto: UpdateBusinessDto,
    userId: string,
  ): Promise<BusinessResponse> {
    this.logger.log(
      `Updating business. Business ID: ${id}, User ID: ${userId}`,
    );

    if (!isObjectIdOrHexString(id)) {
      this.logger.warn(
        `Invalid business ID: ${id}`,
      );

      throw new NotFoundException(
        'Invalid business id.',
      );
    }

    const business =
      await this.mongo.models.business
        .findOneAndUpdate(
          {
            _id: this.mongo.toObjectId(id),
          },
          {
            ...dto,
            updatedBy: userId,
          },
          {
            new: true,
            runValidators: true,
          },
        )
        .populate('categoryId', '_id name')
        .populate('assignedTo', '_id fullName')
        .lean()
        .exec();

    if (!business) {
      this.logger.warn(
        `Business not found while updating. Business ID: ${id}`,
      );

      throw new NotFoundException(
        'Business not found.',
      );
    }

    this.logger.log(
      `Business updated successfully. Business ID: ${id}`,
    );

    return this.mapBusinessResponse(business);
  }

  // DELETE BUSINESS
  async delete(
    id: string,
    userId: string,
  ): Promise<{ message: string }> {
    this.logger.log(
      `Soft deleting business. Business ID: ${id}, User ID: ${userId}`,
    );

    if (!isObjectIdOrHexString(id)) {
      this.logger.warn(
        `Invalid business ID: ${id}`,
      );

      throw new NotFoundException(
        'Invalid business id.',
      );
    }

    const business =
      await this.mongo.models.business
        .findOneAndUpdate(
          {
            _id: this.mongo.toObjectId(id),
            isActive: true,
          },
          {
            isActive: false,
            deletedAt: new Date(),
            updatedBy: this.mongo.toObjectId(userId),
          },
          {
            new: true,
          },
        )
        .exec();

    if (!business) {
      this.logger.warn(
        `Business not found or already deleted. Business ID: ${id}`,
      );

      throw new NotFoundException(
        'Business not found.',
      );
    }

    this.logger.log(
      `Business deleted successfully. Business ID: ${id}`,
    );

    return {
      message: 'Business deleted successfully.',
    };
  }

  /**
   * Get autocomplete suggestions for businesses
   */
  async autocomplete(
    search?: string,
  ): Promise<Business[]> {
    this.logger.log(
      `Fetching business autocomplete. Search: ${search || 'none'}`,
    );

    const filter: Record<string, any> = {
      isActive: true,
    };

    if (search) {
      filter.name = {
        $regex: search,
        $options: 'i',
      };
    }

    const business =
      await this.mongo.models.business
        .find(filter)
        .select('_id name')
        .sort({ name: 1 })
        .limit(50)
        .lean()
        .exec();

    this.logger.log(
      `Business autocomplete completed. Count: ${business.length}`,
    );

    return business as Business[];
  }

  async getCityAutocomplete(search?: string){
    this.logger.log(
      `Fetching city autocomplete. Search: ${search || 'none'}`,
    );
    const filter: Record<string, any> = {};

    if (search) {
      filter.city = {
        $regex: search,
        $options: 'i',
      };
    }

    const response = await this.mongo.models.business.aggregate([
      { $match: filter},
      {
        $group: {   _id: '$city' },
      },
      {
        $project: {
          _id: 0,
          city: '$_id',
        },
      },
      {
        $sort: { city: 1}
      },
      {$limit: 50,},
    ]);

    return response as Business[];
  }

  /**
   * Get status suggestions for businesses
   */
  getStatus(): Record<string, string> {

    this.logger.log(`Fetching business status`);

    const statusObject: Record<string, string> = Object.entries(BusinessStatus).reduce(
      (acc, [key, value]) => {
        acc[key] = value;
        return acc;
      },
      {} as Record<string, string>,
    );

    return statusObject;
  }

  /**
   * Get KPI suggestions for businesses
   */
  async getKpis(query: BusinessKPIsDto): Promise<BusinessKpiResponse> {
  
    this.logger.log(`Fetching business KPIs`);

    const filter: Record<string, any> = this.filterforGetBusinesses(query);
    const matchStage = {
      $match: filter
    };

    const groupStage = {
      $group: {
        _id: null,

        total: {
          $sum: 1,
        },

        active: {
          $sum: {
            $cond: [
              {
                $in: [
                  '$status',
                  [
                    "NEW",
                    "CONTACTED",
                    "INTERESTED",
                    "PROPOSAL_AND_NEGOTIATION",
                  ],
                ],
              },
              1,
              0,
            ],
          },
        },

        new: {
          $sum: {
            $cond: [
              { $eq: ['$status', "NEW"] },
              1,
              0,
            ],
          },
        },

        inactive: {
          $sum: {
            $cond: [
              { $eq: ['$isActive', false] },
              1,
              0,
            ],
          },
        },

        interested: {
          $sum: {
            $cond: [
              { $eq: ['$status', "INTERESTED"] },
              1,
              0,
            ],
          },
        },

        won: {
          $sum: {
            $cond: [
              { $eq: ['$status', "WON"] },
              1,
              0,
            ],
          },
        },
      },
    };
    
    const projectStage = {
      $project: {
        _id: 0,
        total: 1,
        active: 1,
        new: 1,
        inactive: 1,
        interested: 1,
        won: 1,
      },
    }


    const pipeline: any = [];
    Object.keys(filter).length > 0 && pipeline.push(matchStage);
    pipeline.push(groupStage);
    pipeline.push(projectStage);

    const kpis = await this.mongo.models.business.aggregate(pipeline).exec();
    if (kpis.length > 0) {
      return kpis[0];
    }
    else{
      return ({
        total: 0,
        active: 0,
        new: 0,
        inactive: 0,
        interested: 0,
        won: 0
      })
    }
  }

  // GET ALL BUSINESSES
  async findAll(
    query: BusinessFilterDto,
  ): Promise<{
    data: BusinessResponse[];
    total: number;
  }> {
    const {
      sortBy,
    } = query;

    const page =
      query.page !== undefined
        ? Number(query.page)
        : 1;

    const limit =
      query.limit !== undefined
        ? Number(query.limit)
        : 10;

    const filter: Record<string, any> = this.filterforGetBusinesses(query);

    const skip = (page - 1) * limit;

    const [businesses, total] =
      await Promise.all([
        this.mongo.models.business
          .find(filter)
          .populate('categoryId', '_id name')
          .populate('assignedTo', '_id fullName')
          .sort(sortBy || { createdAt: -1 })
          .skip(skip)
          .limit(limit)
          .lean()
          .exec(),

        this.mongo.models.business
          .countDocuments(filter),
      ]);

    this.logger.log(
      `Businesses fetched successfully. Count: ${businesses.length}, Total: ${total}`,
    );

    return {
      data: businesses.map((business) => this.mapBusinessResponse(business)),
      total
    };
  }

  filterforGetBusinesses(query: BusinessFilterDto){
    const {
      search,
      status,
      categoryId,
      city,
      isActive,
    } = query;

    const filter: Record<string, any> = {};

    // By default, don't show deleted businesses
    if (isActive !== undefined) {
      filter.isActive = isActive.toLowerCase() == 'false' ? false : true;
    }

    if (search) {
      filter.$or = [
        {
          name: {
            $regex: search,
            $options: 'i',
          },
        },
        {
          email: {
            $regex: search,
            $options: 'i',
          },
        },
        {
          'phoneNumbers.number': {
            $regex: search,
            $options: 'i',
          },
        },
        {
          'whatsappNumbers.number': {
            $regex: search,
            $options: 'i',
          },
        },
      ];
    }

    if (status) {
      filter.status = status;
    }

    if (categoryId) {
      filter.categoryId = this.mongo.toObjectId(categoryId);
    }

    if (city) {
      filter.city = {
        $regex: city,
        $options: 'i',
      };
    }
    return filter;
  }

  private mapBusinessResponse(business: any): BusinessResponse {
    const { categoryId, assignedTo,...businessData } = business;
    return {
      ...businessData,
      assignee: assignedTo,
      category: categoryId,
    };
  }
}