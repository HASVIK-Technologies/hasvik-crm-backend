import {
  Body,
  Controller,
  Logger,
  Post,
} from '@nestjs/common';
import {
  ApiOperation,
  ApiResponse,
  ApiTags,
} from '@nestjs/swagger';

import { AuthService } from './auth.service';
import { LoginDto } from './dto/login.dto';

@ApiTags('Authentication')
@Controller('auth')
export class AuthController {
  private readonly logger = new Logger(
    AuthController.name,
  );

  constructor(
    private readonly authService: AuthService,
  ) {}

  @Post('login')
  @ApiOperation({
    summary: 'Login using email and password',
  })
  @ApiResponse({
    status: 200,
    description: 'Login successful.',
  })
  @ApiResponse({
    status: 401,
    description: 'Invalid email or password.',
  })
  async login(@Body() dto: LoginDto) {
    this.logger.log(
      `Login request received. Email: ${dto.email}`,
    );

    return this.authService.login(dto);
  }
}