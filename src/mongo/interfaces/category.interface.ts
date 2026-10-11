import { Types } from 'mongoose';

export interface Category {
  _id: Types.ObjectId;

  tenantId: Types.ObjectId;
  
  name: string;

  description?: string;

  isActive: boolean;

  createdBy: Types.ObjectId;

  updatedBy?: Types.ObjectId;

  createdAt: Date;

  updatedAt: Date;
}