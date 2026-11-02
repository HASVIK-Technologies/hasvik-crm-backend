import {
  ConflictException,
  Injectable,
  NotFoundException,
  BadRequestException,
} from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';

import { CreateNotificationTemplateDto } from './dto/create-notification-template.dto';
import { UpdateNotificationTemplateDto } from './dto/update-notification-template.dto';
import { MongoService } from '../mongo/mongo.service';
import { NotificationTemplate } from 'src/mongo/interfaces/notification-template.interface';
import { NotificationChannel } from 'src/mongo/enums/notification-types.enum';

@Injectable()
export class NotificationTemplateService {
  constructor(

    private readonly mongo: MongoService,
  ) {}

  async create(dto: CreateNotificationTemplateDto) {
    const requiredVariables = this.resolveRequiredVariables(
      dto.body,
      dto.requiredVariables,
    );

    try {
      const template = await this.mongo.models.notificationTemplate.create({
        ...dto,
        code: dto.code.trim().toUpperCase(),
        requiredVariables,
        tenantId: null,
        isActive: dto.isActive ?? true,
      });

      return template;
    } catch (error: unknown) {
      if (this.isDuplicateKeyError(error)) {
        throw new ConflictException(
          'A template with this code and channel already exists.',
        );
      }

      throw error;
    }
  }

  async findAll(filters?: {
    channel?: string;
    category?: string;
    isActive?: boolean;
  }) {
    const query: Record<string, unknown> = {
      tenantId: null,
    };

    if (filters?.channel) {
      query.channel = filters.channel;
    }

    if (filters?.category) {
      query.category = filters.category;
    }

    if (filters?.isActive !== undefined) {
      query.isActive = filters.isActive;
    }

    return this.mongo.models.notificationTemplate
      .find(query)
      .sort({ createdAt: -1 })
      .lean()
      .exec();
  }

  async findById(id: string) {
    if (!Types.ObjectId.isValid(id)) {
      throw new BadRequestException('Invalid notification template ID.');
    }

    const template = await this.mongo.models.notificationTemplate
      .findOne({ _id: id, tenantId: null })
      .lean()
      .exec();

    if (!template) {
      throw new NotFoundException('Notification template not found.');
    }

    return template;
  }

  async update(id: string, dto: UpdateNotificationTemplateDto) {
    const existing = await this.findById(id);

    const nextBody = dto.body ?? existing.body;
    const nextVariables = this.resolveRequiredVariables(
      nextBody,
      dto.requiredVariables ?? existing.requiredVariables,
    );

    const update: Record<string, unknown> = {
      ...dto,
      requiredVariables: nextVariables,
    };

    if (dto.code !== undefined) {
      update.code = dto.code.trim().toUpperCase();
    }

    try {
      const template = await this.mongo.models.notificationTemplate
        .findOneAndUpdate(
          { _id: id, tenantId: null },
          { $set: update },
          { new: true, runValidators: true },
        )
        .lean()
        .exec();

      if (!template) {
        throw new NotFoundException('Notification template not found.');
      }

      return template;
    } catch (error: unknown) {
      if (this.isDuplicateKeyError(error)) {
        throw new ConflictException(
          'A template with this code and channel already exists.',
        );
      }

      throw error;
    }
  }

  async deactivate(id: string) {
    return this.update(id, { isActive: false });
  }

  private resolveRequiredVariables(
    body: string,
    requiredVariables?: string[],
  ): string[] {
    const matches = body.matchAll(
      /{{\s*([a-zA-Z][a-zA-Z0-9_]*)\s*}}/g,
    );

    const placeholders = [
      ...new Set([...matches].map((match) => match[1])),
    ];

    if (requiredVariables === undefined) {
      return placeholders;
    }

    const declared = new Set(requiredVariables);
    const missingDeclarations = placeholders.filter(
      (placeholder) => !declared.has(placeholder),
    );

    if (missingDeclarations.length > 0) {
      throw new BadRequestException(
        `Add these placeholders to requiredVariables: ${missingDeclarations.join(', ')}`,
      );
    }

    return [...new Set(requiredVariables)];
  }

  private isDuplicateKeyError(
    error: unknown,
  ): error is { code: number } {
    return (
      typeof error === 'object' &&
      error !== null &&
      'code' in error &&
      error.code === 11000
    );
  }

  public async findByCode(
  code: string,
  channel: NotificationChannel,
): Promise<NotificationTemplate> {
  const template = await this.mongo.models.notificationTemplate
    .findOne({
      code: code.trim().toUpperCase(),
      channel,
      isActive: true,
      tenantId: null,
    })
    .lean<NotificationTemplate>()
    .exec();

  if (!template) {
    throw new NotFoundException(
      `Active notification template not found: ${code} (${channel})`,
    );
  }

  return template;
}
}