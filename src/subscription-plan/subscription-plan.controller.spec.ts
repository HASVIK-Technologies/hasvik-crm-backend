import { Test, TestingModule } from '@nestjs/testing';
import { SubscriptionPlanController } from './subscription-plan.controller';

describe('SubscriptionPlanController', () => {
  let controller: SubscriptionPlanController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [SubscriptionPlanController],
    }).compile();

    controller = module.get<SubscriptionPlanController>(SubscriptionPlanController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
