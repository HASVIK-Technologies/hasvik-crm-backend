
import { Types } from 'mongoose';
import { EntityType } from '../enums';

export interface Tag {
  _id: Types.ObjectId;
  tenantId: Types.ObjectId;

  name: string;
  key: string;
  color?: string;
  description?: string;
  entityType: EntityType

  isActive: boolean;

  createdBy: Types.ObjectId;
  updatedBy?: Types.ObjectId;

  createdAt: Date;
  updatedAt: Date;
}
