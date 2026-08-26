import { Schema, Types } from 'mongoose';
import { BusinessStatus, BusinessType, Business, ContactNumber } from '../interfaces';

const ContactNumberSchema: Schema<ContactNumber> = new Schema(
  {
    number: {
      type: String,
      required: true,
      trim: true,
    },

    isPrimary: {
      type: Boolean,
      default: false,
    },
  },
  {
    _id: false,
  },
);

export const BusinessSchema: Schema<Business> = new Schema(
  {
    name: {
      type: String,
      required: true,
      trim: true,
      index: true,
    },
    description: {
      type: String
    },
    categoryId: {
      type: Types.ObjectId,
      ref: 'Category',
      index: true,
    },

    businessType: {
      type: String,
      enum: Object.values(BusinessType),
      default: BusinessType.OTHER,
      index: true,
    },

    status: {
      type: String,
      enum: Object.values(BusinessStatus),
      default: BusinessStatus.NEW,
      index: true,
    },

    phoneNumbers: {
      type: [ContactNumberSchema],
      default: [],
    },

    whatsappNumbers: {
      type: [ContactNumberSchema],
      default: [],
    },

    email: {
      type: String,
      trim: true,
      lowercase: true,
    },

    website: {
      type: String,
      trim: true,
    },

    address: {
      type: String,
      trim: true,
    },

    city: {
      type: String,
      trim: true,
      index: true,
    },

    state: {
      type: String,
      trim: true,
      index: true,
    },

    pincode: {
      type: String,
      trim: true,
    },

    latitude: {
      type: Number,
    },

    longitude: {
      type: Number,
    },

    assignedTo: {
      type: Types.ObjectId,
      ref: 'User',
      index: true,
    },

    createdBy: {
      type: Types.ObjectId,
      ref: 'User',
    },

    updatedBy: {
      type: Types.ObjectId,
      ref: 'User',
    },

    leadSource: {
      type: String,
      trim: true,
      index: true,
    },

    isDeleted: {
      type: Boolean,
      default: false,
      index: true,
    },
  },

  {
    timestamps: true,
    collection: 'businesses',
  },
);

/**
 * Compound indexes
 */

BusinessSchema.index({
  status: 1,
  categoryId: 1,
  assignedTo: 1,
});

BusinessSchema.index({
  city: 1,
  state: 1,
});

BusinessSchema.index({
  createdAt: -1,
});

/**
 * Text search
 */

BusinessSchema.index({
  name: 'text',
  email: 'text',
});