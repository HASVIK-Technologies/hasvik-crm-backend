import { UserRole } from '../../mongo/enums';

export interface AuthenticatedUser {
  userId: string;
  fullName: string;
  tenantId: string;
  email: string;
  role: UserRole;
}