import {
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { ExtractJwt, Strategy } from 'passport-jwt';
import { UserService } from 'src/user/user.service';
import { AuthenticatedUser } from '../interfaces/authenticated-user.interface';
import { JwtPayload } from '../interfaces/jwt-payload.interface';

@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy) {
  constructor(
    private readonly userService: UserService,
  ) {
    super({
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
      ignoreExpiration: false,
      secretOrKey: process.env.JWT_ACCESS_SECRET!,
    });
  }

  async validate(payload: JwtPayload): Promise<AuthenticatedUser> {
    const user = await this.userService.findById(payload.userId);

    if (!user || user.isDeleted) {
      throw new UnauthorizedException('User is no longer active');
    }

    return {
      userId: user._id.toString(),
      email: user.email,
      role: user.role,
    };
  }
}

            //         Request
            //            │
            //            ▼
            //     JwtAuthGuard
            //            │
            //            ▼
            //      JWT Strategy
            //            │
            //  Extract Bearer Token
            //            │
            //            ▼
            //      Verify JWT
            //            │
            //     ┌──────┴──────┐
            //     │             │
            //  Invalid        Valid
            //     │             │
            //     ▼             ▼
            //   401        validate(payload)
            //                   │
            //                   ▼
            //            Find User in DB
            //                   │
            //          ┌────────┴────────┐
            //          │                 │
            //       Not found          Active
            //          │                 │
            //          ▼                 ▼
            //         401         request.user