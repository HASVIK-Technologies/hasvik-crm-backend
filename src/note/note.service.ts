import {
  Injectable,
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
  constructor(private readonly mongo: MongoService) {}

  /**
   * Create a new note
   */
  async create(
    dto: CreateNoteDto,
    userId: string,
  ): Promise<Note> {
    if (!Types.ObjectId.isValid(dto.entityId)) {
      throw new NotFoundException('Invalid entity id.');
    }

    if (!Types.ObjectId.isValid(userId)) {
      throw new NotFoundException('Invalid user id.');
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

    return await createdNote.save();
  }

  /**
   * Validate referenced entity
   */
  private async validateEntity(
    entityType: NoteEntityType,
    entityId: string,
  ): Promise<void> {
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
        throw new NotFoundException(
          'Invalid note entity type.',
        );
    }

    if (!entity) {
      throw new NotFoundException(
        `${entityType} not found.`,
      );
    }
  }

  /**
   * Get note by ID
   */
  async findById(id: string): Promise<Note> {
    if (!Types.ObjectId.isValid(id)) {
      throw new NotFoundException('Invalid note id.');
    }

    const note = await this.mongo.models.note
      .findById(id)
      .populate('createdBy', 'name email')
      .populate('updatedBy', 'name email')
      .lean()
      .exec();

    if (!note) {
      throw new NotFoundException('Note not found.');
    }

    return note;
  }

  /**
   * Get notes by entity
   */
  async findAll(
    query: NoteFilterDto
  ): Promise<Note[]> {
    const filter: Record<string, any> = {};
    const entityType = query.entityType;
    const entityId = query.entityId;

    if (entityType) {
      filter.entityType = entityType;
    }

    if (entityId) {
      if (!Types.ObjectId.isValid(entityId)) {
        throw new NotFoundException('Invalid entity id.');
      }

      filter.entityId = new Types.ObjectId(entityId);
    }

    return await this.mongo.models.note
      .find(filter)
      .populate('createdBy', 'name email')
      .populate('updatedBy', 'name email')
      .sort({ createdAt: -1 })
      .lean()
      .exec();
  }

  /**
   * Update note
   */
  async update(
    id: string,
    dto: UpdateNoteDto,
    userId: string,
  ): Promise<Note> {
    if (!Types.ObjectId.isValid(id)) {
      throw new NotFoundException('Invalid note id.');
    }

    if (!Types.ObjectId.isValid(userId)) {
      throw new NotFoundException('Invalid user id.');
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
      throw new NotFoundException('Note not found.');
    }

    return note;
  }

  /**
   * Delete note
   */
  async delete(
    id: string,
  ): Promise<{ message: string }> {
    if (!Types.ObjectId.isValid(id)) {
      throw new NotFoundException('Invalid note id.');
    }

    const note = await this.mongo.models.note
      .findByIdAndDelete(id)
      .exec();

    if (!note) {
      throw new NotFoundException('Note not found.');
    }

    return {
      message: 'Note deleted successfully.',
    };
  }
}