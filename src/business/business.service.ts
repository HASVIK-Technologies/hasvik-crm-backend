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
import { BusinessFilterDto } from './dto/get-business-filter.dto';
import {BusinessResponse} from './interface/business-response'

@Injectable()
export class BusinessService {
  private readonly logger = new Logger(BusinessService.name);

  constructor(
    private readonly mongo: MongoService,
  ) {}

  // CREATE BUSINESS
  async create(
    data: CreateBusinessDto,
    userId: string,
  ): Promise<BusinessResponse> {
    this.logger.log(
      `Creating business. Name: ${data.name}, User ID: ${userId}`,
    );

    const existingBusiness =
      await this.mongo.models.business.findOne({
        name: data.name,
        city: data.city,
        isDeleted: false,
      });

    if (existingBusiness) {
      this.logger.warn(
        `Business already exists. Name: ${data.name}, City: ${data.city}`,
      );

      throw new ConflictException(
        'Business already exists.',
      );
    }

    const business = new this.mongo.models.business({
      ...data,
      createdBy: userId,
      isDeleted: false,
    });

    let createdBusiness = await business.save();
    createdBusiness = await createdBusiness.populate('categoryId', '_id name');
    this.logger.log(
      `Business created successfully. Business ID: ${createdBusiness._id}`,
    );

    return this.mapBusinessResponse(createdBusiness.toObject());
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
          _id: id,
          isDeleted: false,
        })
        .populate('categoryId', '_id name')
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
            _id: id,
            isDeleted: false,
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
            _id: id,
            isDeleted: false,
          },
          {
            isDeleted: true,
            deletedAt: new Date(),
            updatedBy: userId,
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

  // GET ALL BUSINESSES
  async findAll(
    query: BusinessFilterDto,
  ): Promise<{
    data: BusinessResponse[];
    total: number;
  }> {
    const {
      search,
      status,
      categoryId,
      assignedTo,
      city,
      isDeleted,
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

    this.logger.log(
      `Fetching businesses. Page: ${page}, Limit: ${limit}, Search: ${search || 'none'}`,
    );

    const filter: Record<string, any> = {};

    // By default, don't show deleted businesses
    if (isDeleted !== undefined) {
      filter.isDeleted = isDeleted;
    } else {
      filter.isDeleted = false;
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
      filter.categoryId = categoryId;
    }

    if (assignedTo) {
      filter.assignedTo = assignedTo;
    }

    if (city) {
      filter.city = {
        $regex: city,
        $options: 'i',
      };
    }

    const skip = (page - 1) * limit;

    const [businesses, total] =
      await Promise.all([
        this.mongo.models.business
          .find(filter)
          .populate('categoryId', '_id name')
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

  private mapBusinessResponse(business: any): BusinessResponse {
    const { categoryId, ...businessData } = business;

    return {
      ...businessData,
      category: categoryId,
    };
  }
}