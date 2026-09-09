import { Types } from 'mongoose';
import { NoteEntityType } from '../enums';

export interface Note {
  _id: Types.ObjectId;

  entityType: NoteEntityType;
  entityId: Types.ObjectId;

  content: string;

  createdBy: Types.ObjectId;
  updatedBy?: Types.ObjectId;

  createdAt: Date;
  updatedAt: Date;
}