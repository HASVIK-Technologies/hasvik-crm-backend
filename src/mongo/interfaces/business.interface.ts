import { Types } from 'mongoose';

export enum BusinessStatus {
  NEW = 'NEW',
  ACTIVE = 'ACTIVE',
  INACTIVE = 'INACTIVE',
  CONVERTED = 'CONVERTED',
  LOST = 'LOST',
}

export enum BusinessType {
  RETAILER = 'RETAILER',
  WHOLESALER = 'WHOLESALER',
  DISTRIBUTOR = 'DISTRIBUTOR',
  MANUFACTURER = 'MANUFACTURER',
  SERVICE_PROVIDER = 'SERVICE_PROVIDER',
  OTHER = 'OTHER',
}

export interface ContactNumber {
  number: string;
  isPrimary: boolean;
}

export interface Business {
  _id: Types.ObjectId;

  name: string;

  description?: string;

  categoryId?: Types.ObjectId;

  businessType: BusinessType;

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