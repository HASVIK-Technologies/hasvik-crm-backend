
import {
  BadRequestException,
  ConflictException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { isValidObjectId, Model } from 'mongoose';

import { CreateTenantDto } from './dto/create-tenant.dto';
import { UpdateTenantDto } from './dto/update-tenant.dto';
import { MongoService } from 'src/mongo/mongo.service';
import { UserService } from 'src/user/user.service';
import { UserRole } from 'src/mongo/enums';
import { AuthenticatedUser } from '../auth/interfaces/authenticated-user.interface';

@Injectable()
export class TenantService {
  // to-do
  private readonly superAdmin: string = "admin@hasviktech.com";

  constructor(
    private readonly mongo: MongoService,
    private readonly userService: UserService,
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
      if(fullName && password) {
        const user = await this.userService.create(
          tenant._id.toString(),
          {
            email: contactEmail || '',
            fullName,
            password,
            role: UserRole.ADMIN,
          }
        );
      }
          
      return tenant;
    } catch (error) {
      throw error;
    }
  }

  async findAll(user: AuthenticatedUser, isActive?: boolean) {

    const filter: Record<string, unknown> = { };

    if(user.email !== this.superAdmin) {
      // Super admin can see all tenants
      filter._id = this.mongo.toObjectId(user.tenantId);
    }

    if (isActive !== undefined) {
      filter.isActive = isActive;
    }

    return this.mongo.models.tenant
      .find(filter)
      .select('-__v')
      .sort({ createdAt: -1 })
      .lean()
      .exec();
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

  async update(id: string, dto: UpdateTenantDto) {
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

      return tenant;
    } catch (error) {
      throw error;
    }
  }

  async updateStatus(id: string, isActive: boolean) {
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

    return tenant;
  }

  private validateObjectId(id: string): void {
    if (!isValidObjectId(id)) {
      throw new BadRequestException('Invalid tenant ID');
    }
  }
}
