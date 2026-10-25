import { Test, TestingModule } from '@nestjs/testing';
import { UserController } from './user.controller';
import { UserService } from './user.service';

describe('UserController', () => {
  let controller: UserController;
  let userService: { getKpis: jest.Mock };

  beforeEach(async () => {
    jest.clearAllMocks();
    userService = {
      getKpis: jest.fn(),
    };
    const module: TestingModule = await Test.createTestingModule({
      controllers: [UserController],
      providers: [
        {
          provide: UserService,
          useValue: userService,
        },
      ],
    }).compile();

    controller = module.get<UserController>(UserController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  it('gets KPIs for the authenticated tenant', async () => {
    const expected = { total: 5, active: 3, inactive: 2 };
    userService.getKpis.mockResolvedValue(expected);

    await expect(
      controller.getKpis({ user: { tenantId: 'tenant-id' } }),
    ).resolves.toEqual(expected);
    expect(userService.getKpis).toHaveBeenCalledWith('tenant-id');
  });
});
