import { Module } from '@nestjs/common';
import { TenantController } from './tenant.controller';
import { TenantService } from './tenant.service';
import { UserModule } from '../user/user.module';
import { AuditLogModule } from '../audit-log/audit-log.module';

@Module({
  imports: [UserModule, AuditLogModule],
  controllers: [TenantController],
  providers: [TenantService]
})
export class TenantModule {}
