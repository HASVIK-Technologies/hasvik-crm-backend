
import {
  BadRequestException,
  ConflictException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';

import { isObjectIdOrHexString, Types } from 'mongoose';

import { CreateTagDto } from './dto/create-tag.dto';
import { UpdateTagDto } from './dto/update-tag.dto';
import { QueryTagDto } from './dto/query-tag.dto';

import { MongoService } from 'src/mongo/mongo.service';
import { TagAutocompleteDto } from './dto/tag-autocomplete.dto';

export enum TagEntityType {
  USER = 'USER',
  BUSINESS = 'BUSINESS',
  FOLLOWUP = 'FOLLOWUP',
  CATEGORY = 'CATEGORY',
  SUBSCRIPTION = 'SUBSCRIPTION',
}

interface TagEntitiesQuery {
  entityType?: TagEntityType;
  page?: number;
  limit?: number;
}

@Injectable()
export class TagService {
  constructor(private readonly mongo: MongoService) {}

  /**
   * Entity type to MongoDB model mapping.
   * Adjust model names according to your MongoModels registry.
   */
  private readonly entityModelMap: Record<string, string> = {
    [TagEntityType.USER]: 'User',
    [TagEntityType.BUSINESS]: 'Business',
    [TagEntityType.FOLLOWUP]: 'FollowUp',
    [TagEntityType.CATEGORY]: 'Category',
    [TagEntityType.SUBSCRIPTION]: 'Subscription',
  };

  /**
   * Generate a URL-friendly tag key.
   */
  private generateTagKey(name: string): string {
    const key = name
      .trim()
      .toLowerCase()
      .normalize('NFD')
      .replace(/[\u0300-\u036f]/g, '')
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/^-+|-+$/g, '');

    if (!key) {
      throw new BadRequestException(
        'Tag name must contain at least one alphanumeric character',
      );
    }

    return key;
  }

  /**
   * Validate MongoDB ObjectId.
   */
  private validateObjectId(id: string, fieldName = 'id'): void {
    if (!Types.ObjectId.isValid(id)) {
      throw new BadRequestException(`Invalid ${fieldName}`);
    }
  }

  /**
   * Handle MongoDB duplicate key error.
   */
  private handleDuplicateError(error: any): never {
    if (error?.code === 11000) {
      throw new ConflictException(
        'A tag with this name already exists',
      );
    }

    throw error;
  }

  /**
   * Find an active tag belonging to the authenticated tenant.
   */
  private async getTag(tagId: string, tenantId: string) {
    this.validateObjectId(tagId, 'tag ID');

    const tag = await this.mongo.models.tag.findOne({
      _id: this.mongo.toObjectId(tagId),
      tenantId: this.mongo.toObjectId(tenantId),
      isActive: true,
    }).lean();

    if (!tag) {
      throw new NotFoundException('Tag not found');
    }

    return tag;
  }

  /**
   * POST /tags
   * Create a tag.
   */
  async create(
    dto: CreateTagDto,
    tenantId: string,
    userId: string,
  ) {
    const name = dto.name.trim().replace(/\s+/g, ' ');
    const key = this.generateTagKey(name);

    try {
      const tag = await this.mongo.models.tag.create({
        tenantId: this.mongo.toObjectId(tenantId),
        name,
        key,
        color: dto.color ?? '#64748B',
        description: dto.description?.trim() || undefined,
        isActive: true,
        createdBy: this.mongo.toObjectId(userId),
      });

      return tag;
    } catch (error) {
      this.handleDuplicateError(error);
    }
  }

  /**
   * GET /tags
   * List tenant tags with pagination and filters.
   */
  async findAll(
    tenantId: string,
    query: QueryTagDto,
  ) {
    const {
      entityType,
      search,
      isActive,
    } = query;

    const page = query.page !== undefined ? Number(query.page) : 1;
    const limit = query.limit !== undefined ? Number(query.limit) : 10;
    const skip = (page - 1) * limit;

    const filter: Record<string, any> = {
      tenantId: this.mongo.toObjectId(tenantId),
    };

    if (entityType) {
      filter.entityType = entityType;
    }

    if (search?.trim()) {
      const escapedSearch = search.trim().replace(
        /[.*+?^${}()|[\]\\]/g,
        '\\$&',
      );

      filter.$or = [
        {
          name: {
            $regex: escapedSearch,
            $options: 'i',
          },
        },
        {
          key: {
            $regex: escapedSearch,
            $options: 'i',
          },
        },
      ];
    }

    const [data, total] = await Promise.all([
      this.mongo.models.tag.find(filter)
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(limit)
        .lean(),

      this.mongo.models.tag.countDocuments(filter),
    ]);

    return {
      data,
      total
    };
  }

  /**
   * GET /tags/:id
   * Get tag details.
   */
  async findOne(
    id: string,
    tenantId: string,
  ) {
    const tag = await this.getTag(id, tenantId);

    return tag;
  }

  /**
   * PATCH /tags/:id
   * Update tag details.
   *
   * Tag key remains immutable after creation.
   */
  async update(
    id: string,
    dto: UpdateTagDto,
    tenantId: string,
    userId: string,
  ) {
    await this.getTag(id, tenantId);

    const updateData: Record<string, any> = {
      updatedBy: this.mongo.toObjectId(userId),
    };

    if (dto.name !== undefined) {
      updateData.name = dto.name.trim().replace(/\s+/g, ' ');
    }

    if (dto.color !== undefined) {
      updateData.color = dto.color;
    }

    if (dto.description !== undefined) {
      updateData.description = dto.description.trim() || null;
    }

    try {
      const tag = await this.mongo.models.tag.findOneAndUpdate(
        {
          _id: this.mongo.toObjectId(id),
          tenantId: this.mongo.toObjectId(tenantId),
          isActive: true,
        },
        {
          $set: updateData,
        },
        {
          new: true,
          runValidators: true,
        },
      ).lean();

      if (!tag) {
        throw new NotFoundException('Tag not found');
      }

      return {
        success: true,
        message: 'Tag updated successfully',
        data: tag,
      };
    } catch (error) {
      this.handleDuplicateError(error);
    }
  }

  /**
   * DELETE /tags/:id
   * Delete a tag.
   */
  async remove(
    id: string,
    tenantId: string,
    userId: string,
  ) {
    await this.getTag(id, tenantId);

    const tag = await this.mongo.models.tag.deleteOne(
      {
        _id: this.mongo.toObjectId(id),
        tenantId: this.mongo.toObjectId(tenantId),
      }
    ).lean();

    if (!tag) {
      throw new NotFoundException('Tag not found');
    }

    return {
      message: 'Tag deleted successfully',
    };
  }

  // TAG AUTOCOMPLETE
  async autocomplete(
    tenantId: string,
    query: TagAutocompleteDto,
  ) {
    const { search, entityType } = query;
    const limit = Number(query.limit) || 10;

    if (!isObjectIdOrHexString(tenantId)) {
      throw new BadRequestException('Invalid tenant ID.');
    }

    // Escape regex special characters
    const escapedSearch = search.replace(
      /[.*+?^${}()|[\]\\]/g,
      '\\$&',
    );

    const tags = await this.mongo.models.tag.find({
      tenantId: this.mongo.toObjectId(tenantId),
      entityType,
      isActive: true,
      name: {
        $regex: escapedSearch,
        $options: 'i',
      },
    })
      .select('_id name key color entityType')
      .sort({ name: 1 })
      .limit(limit)
      .lean()
      .exec();

    return tags;
  }

  /**
   * GET /tags/:tagId/entities
   * Get entities associated with a tag.
   */
  async findEntities(
    tagId: string,
    tenantId: string,
    query: TagEntitiesQuery,
  ) {
    // await this.getTag(tagId, tenantId);

    // const {
    //   entityType,
    //   page = 1,
    //   limit = 10,
    // } = query;

    // if (
    //   entityType &&
    //   !Object.values(TagEntityType).includes(entityType)
    // ) {
    //   throw new BadRequestException('Invalid entity type');
    // }

    // const assignmentFilter: Record<string, any> = {
    //   tenantId: this.mongo.toObjectId(tenantId),
    //   tagId: this.mongo.toObjectId(tagId),
    // };

    // if (entityType) {
    //   assignmentFilter.entityType = entityType;
    // }

    // const skip = (page - 1) * limit;

    // const [assignments, total] = await Promise.all([
    //   this.mongo.models.TagAssignment.find(assignmentFilter)
    //     .sort({ createdAt: -1 })
    //     .skip(skip)
    //     .limit(limit)
    //     .lean(),

    //   this.mongo.models.TagAssignment.countDocuments(
    //     assignmentFilter,
    //   ),
    // ]);

    // // Group entity IDs by entity type.
    // const groupedIds = new Map<string, Types.ObjectId[]>();

    // for (const assignment of assignments) {
    //   const type = assignment.entityType;

    //   if (!this.entityModelMap[type]) {
    //     continue;
    //   }

    //   if (!groupedIds.has(type)) {
    //     groupedIds.set(type, []);
    //   }

    //   groupedIds.get(type)!.push(assignment.entityId);
    // }

    // // Fetch corresponding entities.
    // const entityResults = await Promise.all(
    //   Array.from(groupedIds.entries()).map(
    //     async ([type, entityIds]) => {
    //       const modelName = this.entityModelMap[type];

    //       const model = (this.mongo.models as any)[modelName];

    //       if (!model) {
    //         throw new Error(
    //           `MongoDB model ${modelName} is not registered`,
    //         );
    //       }

    //       const entities = await model.find({
    //         _id: { $in: entityIds },
    //         tenantId: this.mongo.toObjectId(tenantId),
    //       }).lean();

    //       return [type, entities] as const;
    //     },
    //   ),
    // );

    // const entityMap = new Map<string, any>();

    // for (const [type, entities] of entityResults) {
    //   for (const entity of entities) {
    //     entityMap.set(
    //       `${type}:${entity._id.toString()}`,
    //       entity,
    //     );
    //   }
    // }

    // const data = assignments.map((assignment) => ({
    //   entityType: assignment.entityType,
    //   entityId: assignment.entityId,
    //   entity:
    //     entityMap.get(
    //       `${assignment.entityType}:${assignment.entityId.toString()}`,
    //     ) ?? null,
    //   assignedAt: assignment.createdAt,
    // }));

    // return {
    //   success: true,
    //   data,
    //   pagination: {
    //     total,
    //     page,
    //     limit,
    //     totalPages: Math.ceil(total / limit),
    //   },
    // };
  }
}
