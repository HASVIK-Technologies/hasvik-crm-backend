import {
  Injectable,
  Logger,
  UnauthorizedException,
} from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { ExtractJwt, Strategy } from 'passport-jwt';

import { AuthService } from '../auth.service';

@Injectable()
export class JwtStrategy extends PassportStrategy(
  Strategy,
) {
  private readonly logger = new Logger(
    JwtStrategy.name,
  );

  constructor(
    private readonly authService: AuthService,
  ) {
    super({
      jwtFromRequest:
        ExtractJwt.fromAuthHeaderAsBearerToken(),

      ignoreExpiration: false,

      secretOrKey:
        process.env.JWT_SECRET,
    });
  }

  async validate(payload: {
    sub: string;
    email: string;
    role: string;
  }) {
    this.logger.debug(
      `Validating JWT. User ID: ${payload.sub}`,
    );

    if (!payload?.sub) {
      throw new UnauthorizedException(
        'Invalid authentication token.',
      );
    }

    return this.authService.validateUser(
      payload.sub,
    );
  }
}