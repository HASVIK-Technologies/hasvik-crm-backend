import { User,Tenant  } from '../../mongo/interfaces';

export interface UserWithTenantInfo extends User {
  tenantInfo: Tenant | null;
}