import mongoose, { Model, Schema } from 'mongoose';

import {
  User,
  UserDocument,
  UserSchema,
} from './schemas/user.schema';
import { BusinessSchema, CategorySchema, FollowUpSchema, NoteSchema } from './schemas';
import type { Business, Category, FollowUp, Note } from './interfaces';

type SchemaDefinition = {
  key: string;
  name: string;
  schema: Schema;
};

const SCHEMAS: SchemaDefinition[] = [
  {
    key: 'user',
    name: User.name,
    schema: UserSchema,
  },
  {
    key: 'business',
    name: 'Business',
    schema: BusinessSchema,
  },
  {
    key: 'followUp',
    name: 'FollowUp',
    schema: FollowUpSchema,
  },
  {
    key: 'category',
    name: 'Category',
    schema: CategorySchema,
  },
  {
    key: 'note',
    name: 'Note',
    schema: NoteSchema,
  },
  // {
  //   key: 'booking',
  //   name: Booking.name,
  //   schema: BookingSchema,
  // },
];

export class MongoModels {
  // Define properties for each schema
  readonly user!: Model<UserDocument>;
  readonly business!: Model<Business>;
  readonly followUp!: Model<FollowUp>;
  readonly category!: Model<Category>;
  readonly note!: Model<Note>;
  
  constructor() {
    for (const item of SCHEMAS) {
      (this as any)[item.key] =
        mongoose.models[item.name] ??
        mongoose.model(item.name, item.schema);
    }
  }
}