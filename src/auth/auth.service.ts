import {
  BadRequestException,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import * as bcrypt from 'bcrypt';
import { createHash, randomUUID } from 'crypto';

import { LoginDto } from './dto/login.dto';
import { UserRole } from '../mongo/enums';
import { UserService } from '../user/user.service';
import { RefreshTokenService } from '../refresh-token/refresh-token.service';
import { AuthenticatedUser } from './interfaces/authenticated-user.interface';

interface RefreshTokenPayload {
  userId: string;
  email: string;
  role: UserRole;
  jti: string;
  iat?: number;
  exp?: number;
}

interface RefreshUser {
  userId: string;
  refreshToken: string;
}

@Injectable()
export class AuthService {
  constructor(
    private readonly jwtService: JwtService,
    private readonly userService: UserService,
    private readonly refreshTokenService: RefreshTokenService,
  ) {}

  /**
   * Login user
   */
  async login(loginDto: LoginDto) {
    const user = await this.userService.findByEmail(
      loginDto.email,
    );

    if (!user || user.isDeleted) {
      throw new BadRequestException(
        'Invalid email or password',
      );
    }

    const passwordMatched = await bcrypt.compare(
      loginDto.password,
      user.password,
    );

    if (!passwordMatched) {
      throw new BadRequestException(
        'Invalid email or password',
      );
    }

    const authenticatedUser: AuthenticatedUser = {
      userId: user._id.toString(),
      email: user.email,
      role: user.role,
    };

    const accessToken = await this.generateAccessToken(
      authenticatedUser,
    );

    const refreshToken = await this.generateRefreshToken(
      authenticatedUser,
    );

    return {
      accessToken,
      refreshToken,
    };
  }

  /**
   * Generate access token
   */
  private async generateAccessToken(
    user: AuthenticatedUser,
  ): Promise<string> {
    const payload = {
      userId: user.userId,
      email: user.email,
      role: user.role,
    };

    return this.jwtService.signAsync(payload, {
      secret: process.env.JWT_ACCESS_SECRET,
      expiresIn: '120m', // Make it 15m
    });
  }

  /**
   * Generate refresh token and store its hash
   * in MongoDB.
   */
  private async generateRefreshToken(
    user: AuthenticatedUser,
  ): Promise<string> {
    const jti = randomUUID();

    const payload = {
      userId: user.userId,
      email: user.email,
      role: user.role,
      jti,
    };

    const refreshToken = await this.jwtService.signAsync(
      payload,
      {
        secret: process.env.JWT_REFRESH_SECRET,
        expiresIn: '7d',
      },
    );

    const tokenHash = this.hashToken(refreshToken);

    const expiresAt = new Date(
      Date.now() + 7 * 24 * 60 * 60 * 1000,
    );

    await this.refreshTokenService.upsert({
      userId: user.userId,
          jti,
          tokenHash,
          expiresAt,
    });

    return refreshToken;
  }

  async refresh(refreshToken: string) {
    if (!refreshToken) {
      throw new UnauthorizedException(
        'Invalid refresh token',
      );
    }

    let payload: RefreshTokenPayload;

    try {
      payload =
        await this.jwtService.verifyAsync<RefreshTokenPayload>(
          refreshToken,
          {
            secret: process.env.JWT_REFRESH_SECRET,
          },
        );
    } catch (error) {

      throw new UnauthorizedException(
        'Invalid or expired refresh token',
      );
    }

    if (!payload?.userId || !payload?.jti) {
      throw new UnauthorizedException(
        'Invalid refresh token',
      );
    }

    const tokenHash = this.hashToken(refreshToken);

    const storedToken =
      await this.refreshTokenService.findByTokenHash(
        tokenHash,
      );

    if (!storedToken) {
      throw new UnauthorizedException(
        'Refresh token has been revoked or is invalid',
      );
    }

    if (storedToken.jti !== payload.jti) {
      throw new UnauthorizedException(
        'Invalid refresh token',
      );
    }

    /*
     * Check expiration in case the database record
     * has not yet been removed by MongoDB TTL.
     */
    if (storedToken.expiresAt <= new Date()) {
      throw new UnauthorizedException(
        'Refresh token has expired',
      );
    }

    /*
     * Get the latest user information from MongoDB.
     *
     * This ensures changes to role/email/deleted status
     * are reflected when issuing new tokens.
     */
    const user = await this.userService.findById(
      payload.userId,
    );

    if (!user || user.isDeleted) {
      throw new UnauthorizedException(
        'User is no longer active',
      );
    }

    const authenticatedUser: AuthenticatedUser = {
      userId: user._id.toString(),
      email: user.email,
      role: user.role,
    };

    /*
     * IMPORTANT:
     * Revoke the old refresh token BEFORE
     * generating the replacement.
     */
    await this.refreshTokenService.revokeByJti(
      payload.jti,
    );

    /*
     * Generate new tokens.
     */
    const accessToken = await this.generateAccessToken(
      authenticatedUser,
    );

    const newRefreshToken =
      await this.generateRefreshToken(
        authenticatedUser,
      );

    return {
      accessToken,
      refreshToken: newRefreshToken,
      //user: authenticatedUser,
    };
  }

  /**
   * Logout user.
   *
   * This currently revokes all refresh sessions
   * belonging to the user.
   */
  async logout(userId: string) {
    await this.refreshTokenService.revokeByUserId(
      userId,
    );

    return {
      message: 'Logged out successfully',
    };
  }

  /**
   * Hash refresh token.
   *
   * Raw refresh tokens are never stored in MongoDB.
   */
  private hashToken(token: string): string {
    return createHash('sha256')
      .update(token)
      .digest('hex');
  }
}
