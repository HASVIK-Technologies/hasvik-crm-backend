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
  ): Promise<Business> {
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

    const createdBusiness = await business.save();

    this.logger.log(
      `Business created successfully. Business ID: ${createdBusiness._id}`,
    );

    return createdBusiness.toObject() as Business;
  }

  // FIND BUSINESS BY ID
  async findById(id: string): Promise<Business> {
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

    return business as Business;
  }

  // UPDATE BUSINESS
  async update(
    id: string,
    dto: UpdateBusinessDto,
    userId: string,
  ): Promise<Business> {
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

    return business as Business;
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
    data: Business[];
    total: number;
    page: number;
    limit: number;
    totalPages: number;
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
      data: businesses as Business[],
      total,
      page,
      limit,
      totalPages: Math.ceil(total / limit),
    };
  }

  // FIND BUSINESSES BY CATEGORY
  async findByCategory(
    categoryId: string,
  ): Promise<Business[]> {
    this.logger.log(
      `Fetching businesses by category. Category ID: ${categoryId}`,
    );

    if (!isObjectIdOrHexString(categoryId)) {
      this.logger.warn(
        `Invalid category ID: ${categoryId}`,
      );

      throw new NotFoundException(
        'Invalid category id.',
      );
    }

    const businesses =
      await this.mongo.models.business
        .find({
          categoryId,
          isDeleted: false,
        })
        .sort({ createdAt: -1 })
        .lean()
        .exec();

    this.logger.log(
      `Businesses fetched by category. Category ID: ${categoryId}, Count: ${businesses.length}`,
    );

    return businesses as Business[];
  }

  // FIND BUSINESSES ASSIGNED TO USER
  async findByAssignedUser(
    userId: string,
  ): Promise<Business[]> {
    this.logger.log(
      `Fetching businesses assigned to user. User ID: ${userId}`,
    );

    if (!isObjectIdOrHexString(userId)) {
      this.logger.warn(
        `Invalid user ID: ${userId}`,
      );

      throw new NotFoundException(
        'Invalid user id.',
      );
    }

    const businesses =
      await this.mongo.models.business
        .find({
          assignedTo: userId,
          isDeleted: false,
        })
        .sort({ createdAt: -1 })
        .lean()
        .exec();

    this.logger.log(
      `Businesses fetched for user. User ID: ${userId}, Count: ${businesses.length}`,
    );

    return businesses as Business[];
  }
}