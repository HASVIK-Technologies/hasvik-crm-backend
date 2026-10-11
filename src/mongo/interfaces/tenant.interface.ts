import { Types } from 'mongoose';

export interface Tenant {
  _id: Types.ObjectId;
  name: string;
  contactEmail?: string;
  contactPhone?: string;
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
}