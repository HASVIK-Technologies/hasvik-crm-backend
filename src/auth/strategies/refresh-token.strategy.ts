import {
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { Strategy } from 'passport-jwt';
import { Request } from 'express';

import { UserRole } from '../../mongo/enums';

interface RefreshTokenPayload {
  sub: string;
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

    if (!payload?.sub || !payload?.jti) {
      throw new UnauthorizedException(
        'Invalid refresh token',
      );
    }

    return {
      userId: payload.sub,
      refreshToken,
    };
  }
}


    //              Refresh Cookie
    //                    │
    //                    ▼
    //          RefreshTokenStrategy
    //                    │
    //              Verify JWT
    //                    │
    //                    ▼
    //           Extract userId
    //                    │
    //                    ▼
    //          AuthService / DB
    //                    │
    //          Find refresh session
    //                    │
    //       ┌────────────┴────────────┐
    //       │                         │
    //    Invalid                    Valid
    //       │                         │
    //       ▼                         ▼
    //    401                   Rotate token
    //                                 │
    //                                 ▼
    //                         New access token
    //                                 +
    //                         New refresh token
// ````

// ### Recommended MongoDB model

// Something like:

// ```typescript
// interface RefreshToken {
//   _id: Types.ObjectId;
//   userId: Types.ObjectId;
//   tokenHash: string;
//   expiresAt: Date;
//   revokedAt?: Date;
//   createdAt: Date;
// }
// ```

// The raw refresh token should **not** be stored in MongoDB.

// ### Your refresh endpoint

// With the strategy above:

// ```typescript
// @Post('refresh')
// @UseGuards(AuthGuard('refresh-token'))
// refresh(@Req() req: Request) {
//   return this.authService.refresh(req.user);
// }
// ```

// However, because we want **refresh-token rotation and replay detection**, I'd slightly change the design from the simple strategy above:

// ```text
// JWT Refresh Token
//        │
//        ▼
// Validate signature + expiry
//        │
//        ▼
// Check token/session hash in MongoDB
//        │
//        ▼
// Check revokedAt
//        │
//        ▼
// Check expiration
//        │
//        ▼
// Rotate refresh token
//        │
//        ├── Revoke old token
//        │
//        └── Create new token
// ```

// That is the design I'd use for a production HASVIK CRM.

// Also make sure your NestJS app has cookie parsing enabled:

// ```typescript
// import * as cookieParser from 'cookie-parser';

// app.use(cookieParser());
// ```

// And your React client sends cookies with requests:

// ```typescript
// axios.defaults.withCredentials = true;
// ```

// The next file I'd recommend implementing is **`permissions.guard.ts`**, followed by the **`auth.service.ts`** tying login → JWT → refresh-token rotation → logout together.
