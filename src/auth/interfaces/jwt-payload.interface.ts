import { UserRole } from "src/mongo/enums";

export interface JwtPayload {
  sub: string;
  email: string;
  role: UserRole;
}