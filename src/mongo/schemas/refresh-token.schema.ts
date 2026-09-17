import { Schema, Types } from 'mongoose';

export interface RefreshTokenDocument {
  _id: Types.ObjectId;
  userId: Types.ObjectId;
  jti: string;
  tokenHash: string;
  expiresAt: Date;
  revokedAt?: Date | null;
  createdAt: Date;
  updatedAt: Date;
}

export const RefreshTokenSchema = new Schema<RefreshTokenDocument>(
  {
    userId: {
      type: Schema.Types.ObjectId,
      required: true,
      index: true,
    },

    jti: {
      type: String,
      required: true,
      unique: true,
      index: true,
    },

    tokenHash: {
      type: String,
      required: true,
      unique: true,
      index: true,
    },

    expiresAt: {
      type: Date,
      required: true,
      index: true,
    },

    revokedAt: {
      type: Date,
      default: null,
    },
  },
  {
    timestamps: true,
    collection: 'refresh_tokens',
  },
);

RefreshTokenSchema.index(
  { expiresAt: 1 },
  { expireAfterSeconds: 0 },
);