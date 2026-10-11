import { User,Tenant  } from '../../mongo/interfaces';

export interface UserWithTenantInfo extends User {
  tenant: Tenant | null;
}