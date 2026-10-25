import { Test, TestingModule } from '@nestjs/testing';
import { TenantService } from './tenant.service';
import { MongoService } from '../mongo/mongo.service';
import { UserService } from '../user/user.service';
import { AuditLogService } from '../audit-log/audit-log.service';
import { UserRole } from '../mongo/enums';

describe('TenantService', () => {
  let service: TenantService;
  let tenantModel: { aggregate: jest.Mock };
  let mongo: { models: { tenant: typeof tenantModel }; toObjectId: jest.Mock };

  beforeEach(async () => {
    tenantModel = {
      aggregate: jest.fn(),
    };
    mongo = {
      models: { tenant: tenantModel },
      toObjectId: jest.fn((id: string) => `object-id:${id}`),
    };
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        TenantService,
        { provide: MongoService, useValue: mongo },
        { provide: UserService, useValue: {} },
        { provide: AuditLogService, useValue: {} },
      ],
    }).compile();

    service = module.get<TenantService>(TenantService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  it('returns total, active, and inactive tenant counts for a superadmin', async () => {
    const expected = { total: 5, active: 3, inactive: 2 };
    tenantModel.aggregate.mockReturnValue({
      exec: jest.fn().mockResolvedValue([expected]),
    });

    await expect(
      service.getKpis({
        userId: 'user-id',
        fullName: 'Admin',
        tenantId: 'tenant-id',
        email: 'admin@example.com',
        role: UserRole.SUPERADMIN,
      }),
    ).resolves.toEqual(expected);
    expect(tenantModel.aggregate).toHaveBeenCalledWith(
      expect.arrayContaining([
        { $match: {} },
        expect.objectContaining({
          $group: expect.objectContaining({
            total: { $sum: 1 },
          }),
        }),
      ]),
    );
    expect(mongo.toObjectId).not.toHaveBeenCalled();
  });

  it('limits non-superadmin KPIs to their tenant', async () => {
    tenantModel.aggregate.mockReturnValue({
      exec: jest.fn().mockResolvedValue([]),
    });

    await expect(
      service.getKpis({
        userId: 'user-id',
        fullName: 'Admin',
        tenantId: 'tenant-id',
        email: 'admin@example.com',
        role: UserRole.ADMIN,
      }),
    ).resolves.toEqual({ total: 0, active: 0, inactive: 0 });
    expect(mongo.toObjectId).toHaveBeenCalledWith('tenant-id');
    expect(tenantModel.aggregate).toHaveBeenCalledWith(
      expect.arrayContaining([{ $match: { _id: 'object-id:tenant-id' } }]),
    );
  });
});
