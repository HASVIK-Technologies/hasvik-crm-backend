import mongoose, { Collection,Document,Model, Schema } from 'mongoose';

import { AuditLogSchema, BusinessSchema, CategorySchema, FollowUpSchema, NoteSchema, NotificationLogSchema, NotificationTemplateSchema, SubscriptionPlanSchema, RefreshTokenSchema, SubscriptionSchema, TagSchema, TenantSchema, UserSchema } from './schemas';
import type { AuditLog, Business, Category, FollowUp, ISubscription, ISubscriptionPlan, Note,NotificationLog,NotificationTemplate, RefreshToken, Tag, Tenant, User } from './interfaces';

type SchemaDefinition = {
  key: string;
  name: string;
  schema: Schema;
};

const SCHEMAS: SchemaDefinition[] = [
  {
    key: 'auditLog',
    name: 'AuditLog',
    schema: AuditLogSchema,
  },
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
    key: 'notificationLog',
    name: 'NotificationLog',
    schema: NotificationLogSchema
  },
  {
    key: 'notificationTemplate',
    name: 'NotificationTemplate',
    schema: NotificationTemplateSchema
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
  {
    key: 'tag',
    name: 'Tag',
    schema: TagSchema,
  },
  {
    key: 'tenant',
    name: 'Tenant',
    schema: TenantSchema,
  },
];

export class MongoModels {
  // Define properties for each schema
  readonly auditLog!: Model<AuditLog>;
  readonly business!: Model<Business>;
  readonly followUp!: Model<FollowUp>;
  readonly category!: Model<Category>;
  readonly notificationLog!: Model<NotificationLog>;
  readonly notificationTemplate!: Model<NotificationTemplate>;
  readonly note!: Model<Note>;
  readonly user!: Model<User>;
  readonly refreshToken!: Model<RefreshToken>
  readonly subscriptionPlan!: Model<ISubscriptionPlan>;
  readonly subscription!: Model<ISubscription>;
  readonly tag!: Model<Tag>;
  readonly tenant!: Model<Tenant>;
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