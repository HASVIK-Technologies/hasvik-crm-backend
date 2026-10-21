import { User,Tenant, UserResponse  } from '../../mongo/interfaces';

export interface UserWithTenantInfo extends User {
  tenant: Tenant | null;
}

export interface UserInfo extends UserResponse{
  hasActiveSubscription: boolean;
}