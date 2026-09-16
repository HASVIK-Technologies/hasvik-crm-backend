import { Types } from 'mongoose';
import { BusinessStatus } from '../enums';




export interface ContactNumber {
  number: string;
  name?: string
  isPrimary: boolean;
}

export interface Business {
  _id: Types.ObjectId;

  name: string;

  description?: string;

  categoryId?: Types.ObjectId;

  status: BusinessStatus;

  phoneNumbers: ContactNumber[];

  whatsappNumbers: ContactNumber[];

  email?: string;

  website?: string;

  address?: string;

  city?: string;

  state?: string;

  pincode?: string;

  latitude?: number;

  longitude?: number;

  assignedTo?: Types.ObjectId;

  createdBy?: Types.ObjectId;

  updatedBy?: Types.ObjectId;

  leadSource?: string;

  isDeleted: boolean;

  createdAt: Date;

  updatedAt: Date;
}