
import {
  BadRequestException,
  ConflictException,
  Injectable,
  Logger,
  NotFoundException,
} from '@nestjs/common';
import { isValidObjectId, Model } from 'mongoose';

import { CreateTenantDto } from './dto/create-tenant.dto';
import { UpdateTenantDto } from './dto/update-tenant.dto';
import { MongoService } from 'src/mongo/mongo.service';
import { UserService } from 'src/user/user.service';
import { UIUserRole, UserRole } from 'src/mongo/enums';
import { AuthenticatedUser } from '../auth/interfaces/authenticated-user.interface';
import { AuditLogService } from '../audit-log/audit-log.service';
import { AuditLogAction, AuditLogEntityType } from '../mongo/enums';
import { GetTenantFilterDto, TenantKPIsDto } from './dto/get-tenant-filter.dto';

@Injectable()
export class TenantService {
  private readonly logger = new Logger(TenantService.name);

  // to-do
  constructor(
    private readonly mongo: MongoService,
    private readonly userService: UserService,
    private readonly auditLogService: AuditLogService,
  ) {}

  async create(dto: CreateTenantDto) {
    try {

      const existingTenant = await this.mongo.models.tenant
        .findOne({ name: dto.name })
        .lean()
        .exec(); 

      if (existingTenant) {
        throw new ConflictException('A tenant with this name already exists');
      }

      const { fullName, password, name, contactEmail, contactPhone } = dto;
      const tenant = await this.mongo.models.tenant.create({
                      name,
                      contactEmail,
                      contactPhone,
                    });
      await this.auditLogService.createAuditLog({
        tenantId: tenant._id.toString(),
        userId: undefined,
        action: AuditLogAction.CREATE,
        entityType: AuditLogEntityType.TENANT,
        entityId: tenant._id.toString(),
        message: 'Tenant created',
        details: { newData: tenant.toObject() },
      });

      if(fullName && password) {
        await this.userService.create(
          tenant._id.toString(),
          {
            email: contactEmail || '',
            fullName,
            password,
            role: UIUserRole.ADMIN,
          }
        );
      }
          
      return tenant;
    } catch (error) {
      throw error;
    }
  }

  async findAll(user: AuthenticatedUser, query: GetTenantFilterDto,) {
    const { isActive } = query; 
    const page = query.page !== undefined ? Number(query.page) : 1;
    const limit = query.limit !== undefined ? Number(query.limit) : 10;
    const skip = (page - 1) * limit;

    const filter: Record<string, unknown> = { };

    if (user.role !== UserRole.SUPERADMIN) {
      // Super admin can see all tenants
      filter._id = this.mongo.toObjectId(user.tenantId);
    }

    if (isActive !== undefined) {
      filter.isActive = isActive;
    }
    try{
      const [data, total] = await Promise.all([
        this.mongo.models.tenant
        .find(filter)
        .select('-__v')
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(limit)
        .lean()
        .exec(),
        
        this.mongo.models.tenant
        .countDocuments(filter),
      ]);
      
      return { data, total };
    } catch (error) {
      this.logger.error(
        'Failed to retrieve tenants',
        error instanceof Error ? error.stack : String(error),
      );

      throw error;
    }
  }

  async getKpis(
    user: AuthenticatedUser,
    query: TenantKPIsDto,
  ): Promise<{ total: number; active: number; inactive: number }> {

    const filter: Record<string, unknown> = { };

    if (user.role !== UserRole.SUPERADMIN) {
      // Super admin can see all tenants
      filter._id = this.mongo.toObjectId(user.tenantId);
    }

    if (query.isActive !== undefined) {
      filter.isActive = query.isActive;
    }

    const [kpis] = await this.mongo.models.tenant
      .aggregate([
        { $match: filter },
        {
          $group: {
            _id: null,
            total: { $sum: 1 },
            active: {
              $sum: {
                $cond: [{ $eq: ['$isActive', true] }, 1, 0],
              },
            },
            inactive: {
              $sum: {
                $cond: [{ $eq: ['$isActive', false] }, 1, 0],
              },
            },
          },
        },
        {
          $project: {
            _id: 0,
            total: 1,
            active: 1,
            inactive: 1,
          },
        },
      ])
      .exec();

    return kpis ?? { total: 0, active: 0, inactive: 0 };
  }

  async findOne(id: string) {
    this.validateObjectId(id);

    const tenant = await this.mongo.models.tenant
      .findById(id)
      .select('-__v')
      .lean()
      .exec();

    if (!tenant) {
      throw new NotFoundException('Tenant not found');
    }

    return tenant;
  }

  async update(id: string, dto: UpdateTenantDto, userId?: string) {
    this.validateObjectId(id);

    try {
      const tenant = await this.mongo.models.tenant
        .findByIdAndUpdate(
          id,
          { $set: dto },
          {
            new: true,
            runValidators: true,
          },
        )
        .select('-__v')
        .lean()
        .exec();

      if (!tenant) {
        throw new NotFoundException('Tenant not found');
      }

      await this.auditLogService.createAuditLog({
        tenantId: id,
        userId,
        action: AuditLogAction.UPDATE,
        entityType: AuditLogEntityType.TENANT,
        entityId: id,
        message: 'Tenant updated',
        details: { changedFields: Object.keys(dto) },
      });

      return tenant;
    } catch (error) {
      throw error;
    }
  }

  async updateStatus(id: string, isActive: boolean, userId?: string) {
    this.validateObjectId(id);

    const tenant = await this.mongo.models.tenant
      .findByIdAndUpdate(
        id,
        { $set: { isActive } },
        {
          new: true,
          runValidators: true,
        },
      )
      .select('-__v')
      .lean()
      .exec();

    if (!tenant) {
      throw new NotFoundException('Tenant not found');
    }

    await this.auditLogService.createAuditLog({
      tenantId: id,
      userId,
      action: isActive
        ? AuditLogAction.STATUS_CHANGE
        : AuditLogAction.DELETE,
      entityType: AuditLogEntityType.TENANT,
      entityId: id,
      message: `Tenant ${isActive ? 'activated' : 'deactivated'}`,
      details: { isActive },
    });

    return tenant;
  }

  private validateObjectId(id: string): void {
    if (!isValidObjectId(id)) {
      throw new BadRequestException('Invalid tenant ID');
    }
  }
}
