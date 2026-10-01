import { Module } from '@nestjs/common';
import { BusinessController } from './business.controller';
import { BusinessService } from './business.service';
import { FollowupModule } from '../followup/followup.module';

@Module({
  imports: [FollowupModule],
  controllers: [BusinessController],
  providers: [BusinessService]
})
export class BusinessModule {}
