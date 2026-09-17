import {
  Body,
  Controller,
  Get,
  Post,
  Req,
  Res,
  UseGuards,
} from '@nestjs/common';
import {
  ApiBearerAuth,
  ApiOperation,
  ApiResponse,
  ApiTags,
} from '@nestjs/swagger';
import { AuthGuard } from '@nestjs/passport';
import type { Request, Response } from 'express';
import { AuthService } from './auth.service';
import { LoginDto } from './dto/login.dto';
import { JwtAuthGuard } from './guards/jwt-auth.guard';
import { CurrentUser } from './decorators/current-user.decorator';
import type { AuthenticatedUser } from './interfaces/authenticated-user.interface';

@ApiTags('Auth')
@Controller('auth')
export class AuthController {
  private readonly cookiePath = '/api/auth';
  constructor(
    private readonly authService: AuthService,
  ) {}

  @Post('login')
  @ApiOperation({
    summary: 'Login user',
  })
  @ApiResponse({
    status: 200,
    description: 'User logged in successfully.',
  })
  @ApiResponse({
    status: 401,
    description: 'Invalid email or password.',
  })
  async login(
    @Body() loginDto: LoginDto,
    @Res({ passthrough: true }) response: Response,
  ) {
    const result = await this.authService.login(loginDto);

    response.cookie('refreshToken', result.refreshToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      path: this.cookiePath,
      maxAge: 7 * 24 * 60 * 60 * 1000,
    });

    return {
      accessToken: result.accessToken,
      user: result.user,
    };
  }

  @Post('refresh')
  @UseGuards(AuthGuard('refresh-token'))
  @ApiOperation({
    summary: 'Refresh access token',
  })
  @ApiResponse({
    status: 200,
    description: 'Access token refreshed successfully.',
  })
  @ApiResponse({
    status: 401,
    description: 'Invalid or expired refresh token.',
  })
  async refresh(
    @Req()
    request: Request & {
      user: { userId: string; refreshToken: string };
    },
    @Res({ passthrough: true }) response: Response,
  ) {

    const result = await this.authService.refresh(
      request.user,
    );

    response.cookie('refreshToken', result.refreshToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      path: this.cookiePath,
      maxAge: 7 * 24 * 60 * 60 * 1000,
    });

    return {
      accessToken: result.accessToken,
      user: result.user,
    };
  }

  @Post('logout')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({
    summary: 'Logout user',
  })
  @ApiResponse({
    status: 200,
    description: 'User logged out successfully.',
  })
  async logout(
    @CurrentUser() user: AuthenticatedUser,
    @Res({ passthrough: true }) response: Response,
  ) {
    await this.authService.logout(user.userId);

    response.clearCookie('refreshToken', {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      path: this.cookiePath,
    });

    return {
      message: 'Logged out successfully',
    };
  }

  @Get('me')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({
    summary: 'Get current authenticated user',
  })
  @ApiResponse({
    status: 200,
    description: 'Current user returned successfully.',
  })
  @ApiResponse({
    status: 401,
    description: 'Unauthorized.',
  })
  getCurrentUser(
    @CurrentUser() user: AuthenticatedUser,
  ) {
    return user;
  }
}

// POST /auth/login
//        │
//        ├── accessToken → response
//        └── refreshToken → HttpOnly cookie
//                               │
//                               ▼
//                      POST /auth/refresh
//                               │
//                               ▼
//                     RefreshTokenStrategy
//                               │
//                               ▼
//                     AuthService.refresh()
//                               │
//                        Token rotation
//                               │
//                  ┌────────────┴────────────┐
//                  ▼                         ▼
//           New access token          New refresh token
//                                            │
//                                            ▼
//                                   HttpOnly cookie
