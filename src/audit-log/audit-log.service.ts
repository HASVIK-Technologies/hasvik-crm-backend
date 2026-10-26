import {
  Injectable,
  Logger,
  BadRequestException,
  NotFoundException,
} from '@nestjs/common';
import { Types } from 'mongoose';
import { ConfigService } from '@nestjs/config';

import { AuditLog } from '../mongo/interfaces';
import { MongoService } from '../mongo/mongo.service';
import { AuditLogFilterDto } from './dto/audit-log-filter.dto';
import {
  AuditLogAction,
  AuditLogEntityType,
} from '../mongo/enums';


export interface CreateAuditLogRequest {
  tenantId: string;
  userId?: string;
  action: AuditLogAction;
  entityType: AuditLogEntityType;
  entityId?: string;
  message?: string;
  details?: Record<string, unknown>;
}

@Injectable()
export class AuditLogService {
  private readonly logger = new Logger(AuditLogService.name);

  constructor(
    private readonly mongo: MongoService,
    private readonly configService: ConfigService,
  ) {}

  async createAuditLog(input: CreateAuditLogRequest): Promise<AuditLog | null> {
    const enabled = this.configService.get<string>('AUDIT_LOG_ENABLED', 'true');
    if (!['true', '1', 'yes', 'on'].includes(enabled.toLowerCase())) {
      return null;
    }

    if (!Types.ObjectId.isValid(input.tenantId)) {
      throw new BadRequestException('Invalid tenant id.');
    }

    if (input.userId && !Types.ObjectId.isValid(input.userId)) {
      throw new BadRequestException('Invalid user id.');
    }

    if (input.entityId && !Types.ObjectId.isValid(input.entityId)) {
      throw new BadRequestException('Invalid entity id.');
    }

    if (!input.action.trim() || !input.entityType.trim()) {
      throw new BadRequestException('Action and entity type are required.');
    }

    const auditLog = await this.mongo.models.auditLog.create({
      tenantId: this.mongo.toObjectId(input.tenantId),
      userId: input.userId
        ? this.mongo.toObjectId(input.userId)
        : undefined,
      action: input.action,
      entityType: input.entityType,
      entityId: input.entityId
        ? this.mongo.toObjectId(input.entityId)
        : undefined,
      message: input.message,
      details: input.details,
    });

    this.logger.log(
      `Audit log recorded. ID: ${auditLog._id}, Action: ${input.action}, Entity Type: ${input.entityType}`,
    );
    return auditLog;
  }

  async record(input: CreateAuditLogRequest): Promise<AuditLog | null> {
    return this.createAuditLog(input);
  }

  async findAll(
    tenantId: string,
    query: AuditLogFilterDto,
  ): Promise<{ data: AuditLog[]; total: number }> {
    const filter: Record<string, unknown> = {
      tenantId: this.mongo.toObjectId(tenantId),
    };

    if (query.action) filter.action = query.action;
    if (query.entityType) filter.entityType = query.entityType;
    if (query.entityId) filter.entityId = this.mongo.toObjectId(query.entityId);
    if (query.userId) filter.userId = this.mongo.toObjectId(query.userId);
    
    const page = query.page !== undefined ? Number(query.page) : 1;
    const limit = query.limit !== undefined ? Number(query.limit) : 10;
    const skip = (page - 1) * limit;
    const sortDirection = query.sortOrder === 'asc' ? 1 : -1;

    const [data, total] = await Promise.all([
      this.mongo.models.auditLog
        .find(filter)
        .populate('userId', 'fullName email')
        .sort({ createdAt: sortDirection, _id: sortDirection })
        .skip(skip)
        .limit(limit)
        .lean()
        .exec(),
      this.mongo.models.auditLog.countDocuments(filter).exec(),
    ]);

    return { data, total };
  }

  async findById(tenantId: string, id: string): Promise<AuditLog> {
    if (!Types.ObjectId.isValid(id)) {
      throw new NotFoundException('Invalid audit log id.');
    }

    const auditLog = await this.mongo.models.auditLog
      .findOne({
        _id: this.mongo.toObjectId(id),
        tenantId: this.mongo.toObjectId(tenantId),
      })
      .populate('userId', 'fullName email')
      .lean()
      .exec();

    if (!auditLog) {
      throw new NotFoundException('Audit log not found.');
    }

    return auditLog;
  }
}
