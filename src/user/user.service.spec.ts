import { Test, TestingModule } from '@nestjs/testing';
import { UserService } from './user.service';
import { MongoService } from '../mongo/mongo.service';

describe('UserService', () => {
  let service: UserService;
  let aggregateExec: jest.Mock;
  let aggregate: jest.Mock;

  beforeEach(async () => {
    aggregateExec = jest.fn();
    aggregate = jest.fn().mockReturnValue({ exec: aggregateExec });

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        UserService,
        {
          provide: MongoService,
          useValue: {
            models: {
              user: { aggregate },
            },
            toObjectId: jest.fn((id: string) => id),
          },
        },
      ],
    }).compile();

    service = module.get<UserService>(UserService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  it('returns total, active, and inactive counts for a tenant', async () => {
    const expected = { total: 5, active: 3, inactive: 2 };
    aggregateExec.mockResolvedValue([expected]);

    await expect(service.getKpis('tenant-id')).resolves.toEqual(expected);
    expect(aggregate).toHaveBeenCalledWith(
      expect.arrayContaining([
        { $match: { tenantId: 'tenant-id' } },
      ]),
    );
  });

  it('returns zero counts when the tenant has no users', async () => {
    aggregateExec.mockResolvedValue([]);

    await expect(service.getKpis('tenant-id')).resolves.toEqual({
      total: 0,
      active: 0,
      inactive: 0,
    });
  });
});
