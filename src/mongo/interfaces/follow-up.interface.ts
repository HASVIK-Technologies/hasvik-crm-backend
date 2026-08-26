import { Types } from 'mongoose';

export enum FollowUpStatus {
  PENDING = 'PENDING',
  COMPLETED = 'COMPLETED',
  CANCELLED = 'CANCELLED',
  MISSED = 'MISSED',
}

export enum FollowUpType {
  CALL = 'CALL',
  WHATSAPP = 'WHATSAPP',
  EMAIL = 'EMAIL',
  MEETING = 'MEETING',
  OTHER = 'OTHER',
}
export interface FollowUp {
  _id: Types.ObjectId;

  businessId: Types.ObjectId;

  assignedTo: Types.ObjectId;

  type: FollowUpType;

  scheduledAt: Date;

  status: FollowUpStatus;

  notes?: string;

  completedAt?: Date;

  createdBy: Types.ObjectId;

  updatedBy?: Types.ObjectId;

  createdAt: Date;

  updatedAt: Date;
}