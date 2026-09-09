import { Types } from 'mongoose';
import {FollowUpType,FollowUpStatus } from '../enums'

export interface FollowUp {
  _id: Types.ObjectId;

  businessId: Types.ObjectId;

  assignedTo: Types.ObjectId;

  type: FollowUpType;

  scheduledAt: Date;

  status: FollowUpStatus;

  completedAt?: Date;

  createdBy: Types.ObjectId;

  updatedBy?: Types.ObjectId;

  createdAt: Date;

  updatedAt: Date;
}