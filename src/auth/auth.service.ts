import {
  Injectable,
  Logger,
  UnauthorizedException,
} from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import * as bcrypt from 'bcrypt';

import { MongoService } from '../mongo/mongo.service';
import { LoginDto } from './dto/login.dto';

@Injectable()
export class AuthService {
  private readonly logger = new Logger(AuthService.name);

  constructor(
    private readonly mongo: MongoService,
    private readonly jwtService: JwtService,
  ) {}

  async login(dto: LoginDto) {
    this.logger.log(
      `Login attempt. Email: ${dto.email}`,
    );

    const user = await this.mongo.models.user
      .findOne({
        email: dto.email,
        isDeleted: false,
      })
      .select('+password')
      .lean()
      .exec();

    if (!user) {
      this.logger.warn(
        `Login failed. User not found or inactive. Email: ${dto.email}`,
      );

      throw new UnauthorizedException(
        'Invalid email or password.',
      );
    }

    const passwordMatches = await bcrypt.compare(
      dto.password,
      user.password,
    );

    if (!passwordMatches) {
      this.logger.warn(
        `Login failed. Invalid password. User ID: ${user._id}`,
      );

      throw new UnauthorizedException(
        'Invalid email or password.',
      );
    }

    const payload = {
      sub: user._id.toString(),
      email: user.email,
      role: user.role,
    };

    const accessToken =
      await this.jwtService.signAsync(payload);

    this.logger.log(
      `Login successful. User ID: ${user._id}`,
    );

    return {
      accessToken,
      user: {
        _id: user._id,
        email: user.email,
        fullName: user.fullName,
        role: user.role,
        isDeleted: user.isDeleted,
        createdAt: user.createdAt,
        updatedAt: user.updatedAt,
      },
    };
  }

  async validateUser(userId: string) {
    const user = await this.mongo.models.user
      .findOne({
        _id: userId,
        isDeleted: false,
      })
      .select('-password')
      .lean()
      .exec();

    if (!user) {
      this.logger.warn(
        `Authenticated user not found or deleted. User ID: ${userId}`,
      );

      throw new UnauthorizedException(
        'User not found.',
      );
    }

    return user;
  }
}