import { Types } from 'mongoose';

export interface RefreshToken {
  _id?: Types.ObjectId;
  userId: Types.ObjectId;
  jti: string;
  tokenHash: string;
  expiresAt: Date;
  revokedAt?: Date | null;
  createdAt?: Date;
  updatedAt?: Date;
}