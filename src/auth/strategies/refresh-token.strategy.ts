import {
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { Strategy } from 'passport-jwt';
import { Request } from 'express';

import { UserRole } from '../../mongo/enums';

interface RefreshTokenPayload {
  userId: string;
  email: string;
  role: UserRole;
  jti: string;
}

@Injectable()
export class RefreshTokenStrategy extends PassportStrategy(
  Strategy,
  'refresh-token',
) {
  constructor() {
    super({
      jwtFromRequest: (request: Request) => {
        return request?.cookies?.refreshToken;
      },

      ignoreExpiration: false,

      secretOrKey: process.env.JWT_REFRESH_SECRET,

      passReqToCallback: true,
    });
  }

  async validate(
    request: Request,
    payload: RefreshTokenPayload,
  ) {
    const refreshToken =
      request.cookies?.refreshToken;

    if (!refreshToken) {
      throw new UnauthorizedException(
        'Refresh token not found',
      );
    }

    if (!payload?.userId || !payload?.jti) {
      throw new UnauthorizedException(
        'Invalid refresh token',
      );
    }

    return {
      userId: payload.userId,
      refreshToken,
    };
  }
}