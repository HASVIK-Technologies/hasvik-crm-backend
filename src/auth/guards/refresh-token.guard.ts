import {
  CanActivate,
  ExecutionContext,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';
import { Request } from 'express';

interface RefreshTokenRequest extends Request {
  cookies: {
    refreshToken?: string;
  };

  user?: {
    refreshToken: string;
  };
}

@Injectable()
export class RefreshTokenGuard implements CanActivate {
  canActivate(context: ExecutionContext): boolean {
    const request =
      context.switchToHttp().getRequest<RefreshTokenRequest>();

    const refreshToken = request.cookies?.refreshToken;

    if (!refreshToken) {
      throw new UnauthorizedException(
        'Refresh token not found.',
      );
    }

    request.user = {
      refreshToken,
    };

    return true;
  }
}