import { UserRole } from "src/mongo/enums";

export interface JwtPayload {
  userId: string;
  email: string;
  role: UserRole;
}