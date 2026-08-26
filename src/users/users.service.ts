import {
  Injectable,
  ConflictException,
  NotFoundException,
} from '@nestjs/common';
import { isObjectIdOrHexString } from 'mongoose';
import * as bcrypt from 'bcrypt';

import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import { MongoService } from '../mongo/mongo.service';
import { User } from 'src/mongo/schemas';
import { UserFilterDto } from './dto/get-user-filter.dto';

@Injectable()
export class UsersService {
  constructor(
    private readonly mongo: MongoService,
  ) {}

  async findById(id: string) {

    if (!isObjectIdOrHexString(id)) {
      throw new NotFoundException('Invalid user id.');
    }

    const user = await this.mongo.models.user
      .findById(id)
      .select('-password')
      .lean();

    if (!user) {
      throw new NotFoundException('User not found.');
    }

    return user;
  }

  async update(
    id: string,
    dto: UpdateUserDto,
  ) {
    const user = await this.mongo.models.user.findByIdAndUpdate(
      id,
      dto,
      {
        new: true,
        runValidators: true,
      },
    );

    if (!user) {
      throw new NotFoundException('User not found.');
    }

    return user;
  }

  async deleteUser(id: string) {
    const user = await this.mongo.models.user.findByIdAndUpdate(
      id,
      {
        isDeleted: true,
        deletedAt: new Date(),
      },
      {
        new: true,
      },
    );

    if (!user) {
      throw new NotFoundException('User not found.');
    }

    return {
      message: 'User deleted successfully.',
    };
  }




  ////

  // CREATE USER
  async create(data: Partial<User>): Promise<User> {
    const existingUser = await this.mongo.models.user.findOne({
      $or: [
        { email: data.email },
        { phoneNumber: data.phoneNumber },
      ],
    });

    if (existingUser) {
      throw new ConflictException(
        'User already exists.',
      );
    }
    const createdUser = new this.mongo.models.user(data);
    return await createdUser.save();
  }

  //FIND BY EMAIL
  async findByEmail(email: string): Promise<User | null> {
    return await this.mongo.models.user.findOne({ email }).exec();
  }


  // FIND BY PHONE 
  async findByPhone(phoneNumber: string): Promise<User | null> {
    return await this.mongo.models.user.findOne({ phoneNumber }).exec();
  }

  // UPDATE REFRESH TOKEN
  async updateRefreshToken(
    userId: string,
    hash: string | null
  ): Promise<void> {
    await this.mongo.models.user.updateOne(
      { _id: userId },
      { refreshTokenHash: hash }
    ).exec();
  }

  // UPDATE USER
  async updateUser(
    userId: string,
    updateData: UpdateUserDto
  ): Promise<User> {

    const updated = await this.mongo.models.user.findByIdAndUpdate(
      userId,
      updateData,
      { returnDocument: 'after' }
    ).exec();

    if (!updated) {
      throw new NotFoundException('User not found');
    }

    return updated;
  }

  // GET ALL USERS (Admin)
  async findAll(query: UserFilterDto): Promise<{ data: User[], total: number }> {
    const { search, isDeleted, sortBy } = query;
    const page = query.page || 1;
    const limit = query.limit || 10;

    let filter: any = {};
    if (search) {
      filter.$or = [
        { name: { $regex: search, $options: 'i' } },
        { email: { $regex: search, $options: 'i' } },
        { phoneNumber: { $regex: search, $options: 'i' } }
      ];
    }

    if (isDeleted) {
      filter.isDeleted = isDeleted === 'true';
    }

    const skip = (page - 1) * limit;
    
    const users = await this.mongo.models.user.find(filter).sort(sortBy).skip(skip).limit(limit).exec();
    const total = await this.mongo.models.user.countDocuments(filter);
    return { data: users, total };
  }

  async updatePhoneNumberVerification(phoneNumber: string, isVerified: boolean): Promise<User> {
    const updated = await this.mongo.models.user.findOneAndUpdate(
      { phoneNumber },
      { isPhoneNumberVerified: isVerified },
      { returnDocument: 'after' }
    ).exec();

    if (!updated) {
      throw new NotFoundException('User not found');
    }

    return updated;
  }
}