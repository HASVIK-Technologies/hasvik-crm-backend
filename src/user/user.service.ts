import {
  ConflictException,
  Injectable,
  Logger,
  NotFoundException,
} from '@nestjs/common';
import { isObjectIdOrHexString } from 'mongoose';
import * as bcrypt from 'bcrypt';

import { MongoService } from '../mongo/mongo.service';
import { User, UserResponse } from '../mongo/interfaces';

import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import { UserFilterDto } from './dto/get-user-filter.dto';

@Injectable()
export class UserService {
  private readonly logger = new Logger(UserService.name);

  constructor(
    private readonly mongo: MongoService,
  ) {}

  // CREATE USER
  async create(
    data: CreateUserDto,
  ): Promise<UserResponse> {
    this.logger.log(
      `Creating user. Email: ${data.email}`,
    );

    const existingUser =
      await this.mongo.models.user
        .findOne({
          email: data.email,
        })
        .exec();

    if (existingUser) {
      this.logger.warn(
        `User already exists with email: ${data.email}`,
      );

      throw new ConflictException(
        'User with this email already exists.',
      );
    }

    const hashedPassword =
      await bcrypt.hash(data.password, 12);

    const user = new this.mongo.models.user({
      ...data,
      password: hashedPassword,
      isDeleted: false,
    });

    const createdUser = await user.save();

    this.logger.log(
      `User created successfully. User ID: ${createdUser._id}`,
    );

    const {
      password: _,
      ...userResponse
    } = createdUser.toObject();

    return userResponse as UserResponse;
  }

  // GET USER BY ID
  async findById(
    id: string,
  ): Promise<UserResponse> {
    this.logger.log(
      `Fetching user by ID: ${id}`,
    );

    if (!isObjectIdOrHexString(id)) {
      this.logger.warn(
        `Invalid user ID: ${id}`,
      );

      throw new NotFoundException(
        'Invalid user id.',
      );
    }

    const user =
      await this.mongo.models.user
        .findById(id)
        .select('-password')
        .lean()
        .exec();

    if (!user) {
      this.logger.warn(
        `User not found. User ID: ${id}`,
      );

      throw new NotFoundException(
        'User not found.',
      );
    }

    this.logger.log(
      `User fetched successfully. User ID: ${id}`,
    );

    return user as UserResponse;
  }

  // GET ALL USERS
  async findAll(
    query: UserFilterDto,
  ): Promise<{
    data: UserResponse[];
    total: number;
    page: number;
    limit: number;
    totalPages: number;
  }> {
    const {
      search,
      role,
      isDeleted,
      page = 1,
      limit = 10,
      sortBy = 'fullName',
      sortOrder = 'asc',
    } = query;

    this.logger.log(
      `Fetching users. Page: ${page}, Limit: ${limit}, Search: ${search || 'none'}`,
    );

    const filter: Record<string, any> = {};

    if (search) {
      filter.$or = [
        {
          fullName: {
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
      ];
    }

    if (role) {
      filter.role = role;
    }

    if (isDeleted !== undefined) {
      filter.isDeleted = isDeleted;
    }

    const skip = (page - 1) * limit;

    const sort: Record<string, 1 | -1> = {
      [sortBy]:
        sortOrder === 'asc' ? 1 : -1,
    };

    const [users, total] =
      await Promise.all([
        this.mongo.models.user
          .find(filter)
          .select('-password')
          .sort(sort)
          .skip(skip)
          .limit(limit)
          .lean()
          .exec(),

        this.mongo.models.user
          .countDocuments(filter),
      ]);

    this.logger.log(
      `Users fetched successfully. Count: ${users.length}, Total: ${total}`,
    );

    return {
      data: users as UserResponse[],
      total,
      page,
      limit,
      totalPages: Math.ceil(
        total / limit,
      ),
    };
  }

  // UPDATE USER
  async update(
    id: string,
    data: UpdateUserDto,
  ): Promise<UserResponse> {
    this.logger.log(
      `Updating user. User ID: ${id}`,
    );

    if (!isObjectIdOrHexString(id)) {
      this.logger.warn(
        `Invalid user ID: ${id}`,
      );

      throw new NotFoundException(
        'Invalid user id.',
      );
    }

    // Check duplicate email
    if (data.email) {
      const existingUser =
        await this.mongo.models.user.findOne({
          email: data.email,
          _id: {
            $ne: id,
          },
        });

      if (existingUser) {
        this.logger.warn(
          `Duplicate email found while updating user. User ID: ${id}, Email: ${data.email}`,
        );

        throw new ConflictException(
          'Another user with this email already exists.',
        );
      }
    }

    const updateData: Record<string, any> = {
      ...data,
    };

    // Hash password only when password is changed
    if (data.password) {
      this.logger.log(
        `Hashing new password for user. User ID: ${id}`,
      );

      updateData.password =
        await bcrypt.hash(
          data.password,
          12,
        );
    }

    const user =
      await this.mongo.models.user
        .findByIdAndUpdate(
          id,
          updateData,
          {
            new: true,
            runValidators: true,
          },
        )
        .select('-password')
        .lean()
        .exec();

    if (!user) {
      this.logger.warn(
        `User not found while updating. User ID: ${id}`,
      );

      throw new NotFoundException(
        'User not found.',
      );
    }

    this.logger.log(
      `User updated successfully. User ID: ${id}`,
    );

    return user as UserResponse;
  }

  // SOFT DELETE USER
  async deleteUser(
    id: string,
  ): Promise<{ message: string }> {
    this.logger.log(
      `Soft deleting user. User ID: ${id}`,
    );

    if (!isObjectIdOrHexString(id)) {
      this.logger.warn(
        `Invalid user ID: ${id}`,
      );

      throw new NotFoundException(
        'Invalid user id.',
      );
    }

    const user =
      await this.mongo.models.user
        .findOneAndUpdate(
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
        )
        .exec();

    if (!user) {
      this.logger.warn(
        `User not found or already deleted. User ID: ${id}`,
      );

      throw new NotFoundException(
        'User not found.',
      );
    }

    this.logger.log(
      `User deleted successfully. User ID: ${id}`,
    );

    return {
      message: 'User deleted successfully.',
    };
  }
}