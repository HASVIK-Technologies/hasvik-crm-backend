import {
  Injectable,
  Logger,
  NotFoundException,
} from '@nestjs/common';
import { Types } from 'mongoose';

import { MongoService } from '../mongo/mongo.service';
import { CreateNoteDto } from './dto/create-note.dto';
import { UpdateNoteDto } from './dto/update-note.dto';
import { Note } from '../mongo/interfaces';
import { NoteEntityType } from '../mongo/enums';
import { NoteFilterDto } from './dto/note-filter.dto';

@Injectable()
export class NoteService {
  private readonly logger = new Logger(NoteService.name);

  constructor(
    private readonly mongo: MongoService,
  ) {}

  /**
   * Create a new note
   */
  async create(
    dto: CreateNoteDto,
    userId: string,
  ): Promise<Note> {
    this.logger.log(
      `Creating note. Entity Type: ${dto.entityType}, Entity ID: ${dto.entityId}, User ID: ${userId}`,
    );

    if (!Types.ObjectId.isValid(dto.entityId)) {
      this.logger.warn(
        `Invalid entity ID while creating note: ${dto.entityId}`,
      );

      throw new NotFoundException(
        'Invalid entity id.',
      );
    }

    if (!Types.ObjectId.isValid(userId)) {
      this.logger.warn(
        `Invalid user ID while creating note: ${userId}`,
      );

      throw new NotFoundException(
        'Invalid user id.',
      );
    }

    // Validate that the referenced entity exists
    await this.validateEntity(
      dto.entityType,
      dto.entityId,
    );

    const createdNote = new this.mongo.models.note({
      entityType: dto.entityType,
      entityId: new Types.ObjectId(dto.entityId),
      content: dto.content,
      createdBy: new Types.ObjectId(userId),
    });

    const savedNote = await createdNote.save();

    this.logger.log(
      `Note created successfully. Note ID: ${savedNote._id}`,
    );

    return savedNote;
  }

  /**
   * Validate referenced entity
   */
  private async validateEntity(
    entityType: NoteEntityType,
    entityId: string,
  ): Promise<void> {
    this.logger.log(
      `Validating note entity. Entity Type: ${entityType}, Entity ID: ${entityId}`,
    );

    const objectId = new Types.ObjectId(entityId);

    let entity: any;

    switch (entityType) {
      case NoteEntityType.BUSINESS:
        entity = await this.mongo.models.business.exists({
          _id: objectId,
        });
        break;

      case NoteEntityType.FOLLOW_UP:
        entity = await this.mongo.models.followUp.exists({
          _id: objectId,
        });
        break;

      default:
        this.logger.warn(
          `Invalid note entity type: ${entityType}`,
        );

        throw new NotFoundException(
          'Invalid note entity type.',
        );
    }

    if (!entity) {
      this.logger.warn(
        `Referenced entity not found. Entity Type: ${entityType}, Entity ID: ${entityId}`,
      );

      throw new NotFoundException(
        `${entityType} not found.`,
      );
    }

    this.logger.log(
      `Note entity validated successfully. Entity Type: ${entityType}, Entity ID: ${entityId}`,
    );
  }

  /**
   * Get note by ID
   */
  async findById(id: string): Promise<Note> {
    this.logger.log(
      `Fetching note by ID: ${id}`,
    );

    if (!Types.ObjectId.isValid(id)) {
      this.logger.warn(
        `Invalid note ID: ${id}`,
      );

      throw new NotFoundException(
        'Invalid note id.',
      );
    }

    const note = await this.mongo.models.note
      .findById(id)
      .populate('createdBy', 'name email')
      .populate('updatedBy', 'name email')
      .lean()
      .exec();

    if (!note) {
      this.logger.warn(
        `Note not found. Note ID: ${id}`,
      );

      throw new NotFoundException(
        'Note not found.',
      );
    }

    this.logger.log(
      `Note fetched successfully. Note ID: ${id}`,
    );

    return note;
  }

  /**
   * Get notes by entity
   */
  async findAll(
    query: NoteFilterDto,
  ): Promise<Note[]> {
    const filter: Record<string, any> = {};

    const entityType = query.entityType;
    const entityId = query.entityId;

    this.logger.log(
      `Fetching notes. Entity Type: ${entityType || 'all'}, Entity ID: ${entityId || 'all'}`,
    );

    if (entityType) {
      filter.entityType = entityType;
    }

    if (entityId) {
      if (!Types.ObjectId.isValid(entityId)) {
        this.logger.warn(
          `Invalid entity ID while fetching notes: ${entityId}`,
        );

        throw new NotFoundException(
          'Invalid entity id.',
        );
      }

      filter.entityId = new Types.ObjectId(
        entityId,
      );
    }

    const notes = await this.mongo.models.note
      .find(filter)
      .populate('createdBy', 'name email')
      .populate('updatedBy', 'name email')
      .sort({ createdAt: -1 })
      .lean()
      .exec();

    this.logger.log(
      `Notes fetched successfully. Count: ${notes.length}`,
    );

    return notes;
  }

  /**
   * Update note
   */
  async update(
    id: string,
    dto: UpdateNoteDto,
    userId: string,
  ): Promise<Note> {
    this.logger.log(
      `Updating note. Note ID: ${id}, User ID: ${userId}`,
    );

    if (!Types.ObjectId.isValid(id)) {
      this.logger.warn(
        `Invalid note ID while updating: ${id}`,
      );

      throw new NotFoundException(
        'Invalid note id.',
      );
    }

    if (!Types.ObjectId.isValid(userId)) {
      this.logger.warn(
        `Invalid user ID while updating note: ${userId}`,
      );

      throw new NotFoundException(
        'Invalid user id.',
      );
    }

    const note = await this.mongo.models.note
      .findByIdAndUpdate(
        id,
        {
          content: dto.content,
          updatedBy: new Types.ObjectId(userId),
        },
        {
          new: true,
          runValidators: true,
        },
      )
      .populate('createdBy', 'name email')
      .populate('updatedBy', 'name email')
      .lean()
      .exec();

    if (!note) {
      this.logger.warn(
        `Note not found while updating. Note ID: ${id}`,
      );

      throw new NotFoundException(
        'Note not found.',
      );
    }

    this.logger.log(
      `Note updated successfully. Note ID: ${id}`,
    );

    return note;
  }

  /**
   * Delete note
   */
  async delete(
    id: string,
  ): Promise<{ message: string }> {
    this.logger.log(
      `Deleting note. Note ID: ${id}`,
    );

    if (!Types.ObjectId.isValid(id)) {
      this.logger.warn(
        `Invalid note ID while deleting: ${id}`,
      );

      throw new NotFoundException(
        'Invalid note id.',
      );
    }

    const note = await this.mongo.models.note
      .findByIdAndDelete(id)
      .exec();

    if (!note) {
      this.logger.warn(
        `Note not found while deleting. Note ID: ${id}`,
      );

      throw new NotFoundException(
        'Note not found.',
      );
    }

    this.logger.log(
      `Note deleted successfully. Note ID: ${id}`,
    );

    return {
      message: 'Note deleted successfully.',
    };
  }
}