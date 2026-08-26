import {
  Injectable,
  ConflictException,
  NotFoundException,
} from '@nestjs/common';
import { isObjectIdOrHexString } from 'mongoose';

import { MongoService } from '../mongo/mongo.service';
import { Business } from 'src/mongo/interfaces';
import { CreateBusinessDto } from './dto/create-business.dto';
import { UpdateBusinessDto } from './dto/update-business.dto';
import { BusinessFilterDto } from './dto/get-business-filter.dto';

@Injectable()
export class BusinessService {
  constructor(
    private readonly mongo: MongoService,
  ) {}

  // CREATE BUSINESS
  async create(data: CreateBusinessDto): Promise<Business> {
    const existingBusiness = await this.mongo.models.business.findOne({
      name: data.name,
      city: data.city,
      isDeleted: false,
    });

    if (existingBusiness) {
      throw new ConflictException(
        'Business already exists.',
      );
    }

    const business = new this.mongo.models.business(data);

    return await business.save();
  }

  // FIND BUSINESS BY ID
  async findById(id: string): Promise<Business> {
    if (!isObjectIdOrHexString(id)) {
      throw new NotFoundException('Invalid business id.');
    }

    const business = await this.mongo.models.business
      .findOne({
        _id: id,
        isDeleted: false,
      })
      .lean()
      .exec();

    if (!business) {
      throw new NotFoundException('Business not found.');
    }

    return business as Business;
  }

  // UPDATE BUSINESS
  async update(
    id: string,
    dto: UpdateBusinessDto,
  ): Promise<Business> {
    if (!isObjectIdOrHexString(id)) {
      throw new NotFoundException('Invalid business id.');
    }

    const business = await this.mongo.models.business
      .findOneAndUpdate(
        {
          _id: id,
          isDeleted: false,
        },
        dto,
        {
          new: true,
          runValidators: true,
        },
      )
      .exec();

    if (!business) {
      throw new NotFoundException('Business not found.');
    }

    return business;
  }

  // DELETE BUSINESS
  async delete(id: string) {
    if (!isObjectIdOrHexString(id)) {
      throw new NotFoundException('Invalid business id.');
    }

    const business = await this.mongo.models.business.findOneAndUpdate(
      {
        _id: id,
        isDeleted: false,
      },
      {
        isDeleted: true,
        deletedAt: new Date(),
      },
      {
        new: true,
      },
    );

    if (!business) {
      throw new NotFoundException('Business not found.');
    }

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

    const page = query.page !== undefined ? Number(query.page) : 1;
    const limit = query.limit !== undefined ? Number(query.limit) : 10;

    const filter: Record<string, any> = {};

    // By default don't show deleted businesses
    filter.isDeleted = isDeleted === 'true';

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

    const [businesses, total] = await Promise.all([
      this.mongo.models.business
        .find(filter)
        .sort(sortBy || { createdAt: -1 })
        .skip(skip)
        .limit(limit)
        .lean()
        .exec(),

      this.mongo.models.business.countDocuments(filter),
    ]);

    return {
      data: businesses as Business[],
      total,
    };
  }

  // FIND BUSINESSES BY CATEGORY
  async findByCategory(
    categoryId: string,
  ): Promise<Business[]> {
    if (!isObjectIdOrHexString(categoryId)) {
      throw new NotFoundException('Invalid category id.');
    }

    return await this.mongo.models.business
      .find({
        categoryId,
        isDeleted: false,
      })
      .lean()
      .exec() as Business[];
  }

  // FIND BUSINESSES ASSIGNED TO USER
  async findByAssignedUser(
    userId: string,
  ): Promise<Business[]> {
    if (!isObjectIdOrHexString(userId)) {
      throw new NotFoundException('Invalid user id.');
    }

    return await this.mongo.models.business
      .find({
        assignedTo: userId,
        isDeleted: false,
      })
      .sort({ createdAt: -1 })
      .lean()
      .exec() as Business[];
  }
}