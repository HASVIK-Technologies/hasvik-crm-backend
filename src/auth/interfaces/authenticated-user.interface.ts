import { UserRole } from '../../mongo/enums';

export interface AuthenticatedUser {
  userId: string;
  email: string;
  role: UserRole;
}