import { Test, TestingModule } from '@nestjs/testing';
import { ConfigService } from '@nestjs/config';
import { Types } from 'mongoose';

import { MongoService } from '../mongo/mongo.service';
import { AuditLogService } from './audit-log.service';

describe('AuditLogService', () => {
  let service: AuditLogService;
  let mongo: {
    models: {
      auditLog: {
        create: jest.Mock;
        find: jest.Mock;
        countDocuments: jest.Mock;
      };
    };
    toObjectId: (id: string) => Types.ObjectId;
  };

  beforeEach(async () => {
    mongo = {
      models: {
        auditLog: {
          create: jest.fn(),
          find: jest.fn(),
          countDocuments: jest.fn(),
        },
      },
      toObjectId: (id) => new Types.ObjectId(id),
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        AuditLogService,
        { provide: MongoService, useValue: mongo },
        {
          provide: ConfigService,
          useValue: { get: jest.fn().mockReturnValue('true') },
        },
      ],
    }).compile();

    service = module.get<AuditLogService>(AuditLogService);
  });

  it('records an audit event with tenant and actor references', async () => {
    const tenantId = new Types.ObjectId().toString();
    const userId = new Types.ObjectId().toString();
    const created = { _id: new Types.ObjectId() };
    mongo.models.auditLog.create.mockResolvedValue(created);

    await expect(
      service.record({
        tenantId,
        userId,
        action: 'UPDATE',
        entityType: 'BUSINESS',
        message: 'Business details updated',
        details: { name: { before: 'Old', after: 'New' } },
      }),
    ).resolves.toBe(created);

    expect(mongo.models.auditLog.create).toHaveBeenCalledWith(
      expect.objectContaining({
        tenantId: new Types.ObjectId(tenantId),
        userId: new Types.ObjectId(userId),
        action: 'UPDATE',
        entityType: 'BUSINESS',
        message: 'Business details updated',
      }),
    );
  });

  it('scopes audit log queries to the current tenant', async () => {
    const tenantId = new Types.ObjectId().toString();
    const findQuery = {
      populate: jest.fn().mockReturnThis(),
      sort: jest.fn().mockReturnThis(),
      skip: jest.fn().mockReturnThis(),
      limit: jest.fn().mockReturnThis(),
      lean: jest.fn().mockReturnThis(),
      exec: jest.fn().mockResolvedValue([]),
    };
    const countQuery = { exec: jest.fn().mockResolvedValue(0) };
    mongo.models.auditLog.find.mockReturnValue(findQuery);
    mongo.models.auditLog.countDocuments.mockReturnValue(countQuery);

    await service.findAll(tenantId, { page: 1, limit: 10, sortOrder: 'desc' });

    expect(mongo.models.auditLog.find).toHaveBeenCalledWith({
      tenantId: new Types.ObjectId(tenantId),
    });
    expect(mongo.models.auditLog.countDocuments).toHaveBeenCalledWith({
      tenantId: new Types.ObjectId(tenantId),
    });
  });
});
