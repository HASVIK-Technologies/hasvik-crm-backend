import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';
import { MongoService } from 'src/mongo/mongo.service';

@Injectable()
export class RefreshTokenService {
  private readonly tenantId = process.env.tenantId ?? "hasvik";

  constructor(
    private readonly mongo: MongoService,
  ) {}

  // async upsert(data: {
  //   userId: string;
  //   jti: string;
  //   tokenHash: string;
  //   expiresAt: Date;
  //   tenantId: string;
  // }) {
  //   return await this.mongo.models.refreshToken.findOneAndUpdate(
  //     { userId: data.userId, 
  //       tenantId: data.tenantId },
  //     {
  //       $set: {
  //         jti: data.jti,
  //         tokenHash: data.tokenHash,
  //         expiresAt: data.expiresAt,
  //         revokedAt: null,
  //       },
  //     },
  //     {
  //       upsert: true,
  //       new: true,
  //     },
  //   );
  // }
  async upsert(data: {
  userId: string;
  tenantId: string;
  jti: string;
  tokenHash: string;
  expiresAt: Date;
}) {
  const userId = this.mongo.toObjectId(data.userId);

  const tenantId = this.mongo.toObjectId(data.tenantId);

  return this.mongo.models.refreshToken.findOneAndUpdate(
    {
      userId,
      tenantId,
    },
    {
      $set: {
        jti: data.jti,
        tokenHash: data.tokenHash,
        expiresAt: data.expiresAt,
        revokedAt: null,
      },
    },
    {
      upsert: true,
      new: true,
      runValidators: true,
    },
  ).exec();
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
