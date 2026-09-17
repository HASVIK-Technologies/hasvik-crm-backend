import {
  CanActivate,
  ExecutionContext,
  Injectable,
} from '@nestjs/common';
import { Reflector } from '@nestjs/core';

import { UserRole } from '../../mongo/enums';
import { ROLES_KEY } from '../decorators/roles.decorator';

@Injectable()
export class RolesGuard implements CanActivate {
  constructor(private readonly reflector: Reflector) {}

  canActivate(context: ExecutionContext): boolean {
    const requiredRoles = this.reflector.getAllAndOverride<UserRole[]>(
      ROLES_KEY,
      [context.getHandler(), context.getClass()],
    );

    // No @Roles() decorator means no role restriction.
    if (!requiredRoles || requiredRoles.length === 0) {
      return true;
    }

    const request = context.switchToHttp().getRequest();

    const user = request.user;

    if (!user) {
      return false;
    }

    return requiredRoles.includes(user.role);
  }
}

// Request
//    │
//    ▼
// JwtAuthGuard
//    │
//    │ Valid JWT?
//    ▼
// request.user
//    │
//    ▼
// RolesGuard
//    │
//    │ @Roles(ADMIN, MANAGER)
//    │
//    ├── ADMIN   → ✅
//    ├── MANAGER → ✅
//    ├── SALES   → ❌
//    └── USER    → ❌
//    │
//    ▼
// Controller
// ```