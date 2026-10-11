import mongoose, { Collection,Document,Model, Schema } from 'mongoose';

import { BusinessSchema, CategorySchema, FollowUpSchema, NoteSchema, SubscriptionPlanSchema, SubscriptionSchema, UserSchema } from './schemas';
import type { Business, Category, FollowUp, ISubscription, ISubscriptionPlan, Note, User } from './interfaces';
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
  {
    key: 'subscriptionPlan',
    name: 'SubscriptionPlan',
    schema: SubscriptionPlanSchema,
  },
   {
    key: 'subscription',
    name: 'Subscription',
    schema: SubscriptionSchema,
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
  readonly subscriptionPlan!: Model<ISubscriptionPlan>;
  readonly subscription!: Model<ISubscription>;

  // Existing MongoDB collection; no Mongoose schema required 
  readonly city!: Collection<Document>;

  constructor() {
    for (const item of SCHEMAS) {
      (this as any)[item.key] =
        mongoose.models[item.name] ??
        mongoose.model(item.name, item.schema);
    }

    this.city = mongoose.connection.collection('cities');
  }
}