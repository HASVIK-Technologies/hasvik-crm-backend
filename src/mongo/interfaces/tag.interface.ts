
import { Types } from 'mongoose';

export interface Tag {
  _id: Types.ObjectId;
  tenantId: Types.ObjectId;

  name: string;
  key: string;
  color?: string;
  description?: string;

  isActive: boolean;

  createdBy: Types.ObjectId;
  updatedBy?: Types.ObjectId;

  createdAt: Date;
  updatedAt: Date;
}
