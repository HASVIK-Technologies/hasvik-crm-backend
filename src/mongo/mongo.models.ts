import mongoose, { Model, Schema } from 'mongoose';

import { BusinessSchema, CategorySchema, FollowUpSchema, NoteSchema, UserSchema } from './schemas';
import type { Business, Category, FollowUp, Note, User } from './interfaces';
import { RefreshTokenSchema } from './schemas/refresh-token.schema';
import { RefreshToken } from './interfaces/refresh-token.interface';

type SchemaDefinition = {
  key: string;
  name: string;
  schema: Schema;
};

const SCHEMAS: SchemaDefinition[] = [
  {
    key: 'user',
    name: 'User',
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
  {
    key: 'refreshToken',
    name: 'RefreshToken',
    schema: RefreshTokenSchema,
  },
];

export class MongoModels {
  // Define properties for each schema
  readonly business!: Model<Business>;
  readonly followUp!: Model<FollowUp>;
  readonly category!: Model<Category>;
  readonly note!: Model<Note>;
  readonly user!: Model<User>;
  readonly refreshToken!: Model<RefreshToken>
  
  constructor() {
    for (const item of SCHEMAS) {
      (this as any)[item.key] =
        mongoose.models[item.name] ??
        mongoose.model(item.name, item.schema);
    }
  }
}