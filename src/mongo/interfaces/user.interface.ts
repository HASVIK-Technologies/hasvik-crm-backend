import { Types } from 'mongoose';
import { UserRole } from '../enums/user-role.enum';

export interface User {
  _id: Types.ObjectId;

  email: string;
  fullName: string;
  password: string;

  role: UserRole;

  isDeleted: boolean;
  deletedAt?: Date;

  createdAt: Date;
  updatedAt: Date;
}

export type UserResponse = Omit<User, 'password'>;