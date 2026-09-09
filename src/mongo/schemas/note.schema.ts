import { Schema } from 'mongoose';
import { NoteEntityType } from '../enums/note-entity-type.enum';
import { Note } from '../interfaces';

export const NoteSchema : Schema<Note> = new Schema<Note>(
  {
    entityType: {
      type: String,
      enum: Object.values(NoteEntityType),
      required: true,
      index: true,
    },

    entityId: {
      type: Schema.Types.ObjectId,
      required: true,
      index: true,
    },

    content: {
      type: String,
      required: true,
      trim: true,
    },

    createdBy: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      index: true,
    },

    updatedBy: {
      type: Schema.Types.ObjectId,
      ref: 'User',
    },
  },
  {
    timestamps: true,
    collection: 'notes',
  },
);

// Fetch notes for a particular entity efficiently
NoteSchema.index({
  entityType: 1,
  entityId: 1,
  createdAt: -1,
});