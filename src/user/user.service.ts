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
import { UserWithTenantInfo } from 'src/auth/interfaces/user-with-tenant-info.interface';

@Injectable()
export class UserService {
  private readonly logger = new Logger(UserService.name);

  constructor(
    private readonly mongo: MongoService,
  ) {}

  // CREATE USER
  async create(
    tenantId: string, 
    data: CreateUserDto,
  ): Promise<UserResponse> {
    this.logger.log(
      `Creating user. Email: ${data.email}`,
    );

    const existingUser =
      await this.mongo.models.user
        .findOne({
          email: data.email,
          tenantId: this.mongo.toObjectId(tenantId),
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
      tenantId: this.mongo.toObjectId(tenantId),
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
        .findOne({ _id: this.mongo.toObjectId(id) })
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
    tenantId: string,
    query: UserFilterDto,
  ): Promise<{
    data: UserResponse[];
    total: number;
  }> {
    const {
      search,
      role,
      isActive,
      page = 1,
      limit = 10,
      sortBy = 'fullName',
      sortOrder = 'asc',
    } = query;

    this.logger.log(
      `Fetching users. Page: ${page}, Limit: ${limit}, Search: ${search || 'none'}`,
    );

    const filter: Record<string, any> = {
      tenantId: this.mongo.toObjectId(tenantId)
    };

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

    if (isActive !== undefined) {
      filter.isActive = isActive;
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
    };
  }

  // UPDATE USER
  async update(
    tenantId: string,
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
            $ne: this.mongo.toObjectId(id),
          },
          tenantId: this.mongo.toObjectId(tenantId),
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
        .findOneAndUpdate(
          {
            _id: this.mongo.toObjectId(id),
            tenantId: this.mongo.toObjectId(tenantId),
          },
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
    tenantId: string,
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
            _id: this.mongo.toObjectId(id),
            isActive: true,
            tenantId: this.mongo.toObjectId(tenantId),
          },
          {
            isActive: false,
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

  /**
   * Get autocomplete suggestions for users
   */
  async autocomplete(
    tenantId: string,
    search?: string,
  ): Promise<User[]> {
    this.logger.log(
      `Fetching user autocomplete. Search: ${search || 'none'}`,
    );

    const filter: Record<string, any> = {
      isActive: true,
      tenantId: this.mongo.toObjectId(tenantId),
    };

    if (search) {
      filter.fullName = {
        $regex: search,
        $options: 'i',
      };
    }

    const users =
      await this.mongo.models.user
        .find(filter)
        .select('_id fullName')
        .sort({ fullName: 1 })
        .limit(50)
        .lean()
        .exec();

    this.logger.log(
      `User autocomplete completed. Count: ${users.length}`,
    );

    return users as User[];
  }

  async findByEmailForAuthentication(email: string): Promise<UserWithTenantInfo | null> {
    const user = await this.mongo.models.user
      .findOne({
        email: email.toLowerCase().trim(),
        isActive: true
      })
      .select('+password')
      .populate('tenantId', 'isActive')
      .exec();

    if (!user) {
      return null;
    }

    const userData = user.toObject() as Record<string, any>;
    return {
      ...userData,
      tenantInfo: userData.tenantId,
    } as unknown as UserWithTenantInfo;
  }
}