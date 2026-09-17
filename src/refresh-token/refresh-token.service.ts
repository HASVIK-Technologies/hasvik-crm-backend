import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';
import { MongoService } from 'src/mongo/mongo.service';

@Injectable()
export class RefreshTokenService {
  constructor(
    private readonly mongo: MongoService,
  ) {}

  async create(data: {
    userId: string;
    jti: string;
    tokenHash: string;
    expiresAt: Date;
  }) {
    return this.mongo.models.refreshToken.create({
      userId: new Types.ObjectId(data.userId),
      jti: data.jti,
      tokenHash: data.tokenHash,
      expiresAt: data.expiresAt,
    });
  }

  async findByTokenHash(tokenHash: string) {
    return this.mongo.models.refreshToken.findOne({
      tokenHash,
      revokedAt: null,
    });
  }

  async findByJti(jti: string) {
    return this.mongo.models.refreshToken.findOne({
      jti,
      revokedAt: null,
    });
  }

  async revokeByJti(jti: string) {
    return this.mongo.models.refreshToken.updateOne(
      {
        jti,
        revokedAt: null,
      },
      {
        $set: {
          revokedAt: new Date(),
        },
      },
    );
  }

  async revokeByUserId(userId: string) {
    return this.mongo.models.refreshToken.updateMany(
      {
        userId: new Types.ObjectId(userId),
        revokedAt: null,
      },
      {
        $set: {
          revokedAt: new Date(),
        },
      },
    );
  }

  async deleteExpired() {
    return this.mongo.models.refreshToken.deleteMany({
      expiresAt: {
        $lt: new Date(),
      },
    });
  }
}
