
import {
  Body,
  Controller,
  Get,
  HttpCode,
  HttpStatus,
  Param,
  Patch,
  Post,
  UseGuards,
  Req,
} from '@nestjs/common';
import {
  ApiBearerAuth,
  ApiOperation,
  ApiParam,
  ApiResponse,
  ApiTags,
} from '@nestjs/swagger';

import { SubscriptionService } from './subscription.service';
import { CreateSubscriptionDto } from './dto/create-subscription.dto';
import { SubscriptionStatusDto } from './dto/subscription-status.dto';
import { RenewSubscriptionDto } from './dto/renew-subscription.dto';
import { PermissionsGuard } from '../auth/guards/permissions.guard';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../auth/decorators/roles.decorator';
import { UserRole } from '../mongo/enums/user-role.enum';

@ApiTags('Subscriptions')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard, PermissionsGuard, RolesGuard)
@Controller('subscriptions')  
export class SubscriptionController {
  constructor(
    private readonly subscriptionService: SubscriptionService,
  ) {}

  @Post()
  @Roles(UserRole.ADMIN)
  @ApiOperation({ summary: 'Create a subscription for a business' })
  @ApiResponse({
    status: HttpStatus.CREATED,
    description: 'Subscription created successfully',
  })
  @ApiResponse({
    status: HttpStatus.BAD_REQUEST,
    description: 'Invalid business, plan, or subscription dates',
  })
  @ApiResponse({
    status: HttpStatus.CONFLICT,
    description: 'Business already has an active subscription',
  })
  create(
    @Body() dto: CreateSubscriptionDto, 
    @Req() req: any
  ) {
    return this.subscriptionService.create(req.user, dto);
  }

  @Get()
  @Roles(UserRole.ADMIN, UserRole.USER)
  @ApiOperation({ summary: 'Get all subscriptions' })
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'Subscriptions retrieved successfully',
  })
  findAll( @Req() req: any ) {
    return this.subscriptionService.findAll(req.user);
  }

  @Get(':id')
  @Roles(UserRole.ADMIN, UserRole.USER)
  @ApiOperation({ summary: 'Get a subscription by ID' })
  @ApiParam({
    name: 'id',
    description: 'MongoDB subscription ID',
    example: '68f123456789012345678901',
  })
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'Subscription retrieved successfully',
  })
  @ApiResponse({
    status: HttpStatus.NOT_FOUND,
    description: 'Subscription not found',
  })
  findOne(@Param('id') id: string , @Req() req: any) {
    return this.subscriptionService.findOne(req.user, id );
  }

  @Patch(':id/status')
  @Roles(UserRole.SUPERADMIN)
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Update subscription status' })
  @ApiParam({
    name: 'id',
    description: 'MongoDB subscription ID',
  })
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'Subscription status updated successfully',
  })
  updateStatus(
    @Param('id') id: string,
    @Body() dto: SubscriptionStatusDto,
    @Req() req: any
  ) {
    return this.subscriptionService.updateStatus(req.user, id, dto );
  }

  @Patch(':id/renew')
  @Roles(UserRole.SUPERADMIN)
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Renew a subscription' })
  @ApiParam({
    name: 'id',
    description: 'MongoDB subscription ID',
  })
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'Subscription renewed successfully',
  })
  @ApiResponse({
    status: HttpStatus.NOT_FOUND,
    description: 'Subscription not found',
  })
  @ApiResponse({
    status: HttpStatus.CONFLICT,
    description: 'Subscription cannot be renewed',
  })
  renew(
    @Param('id') id: string,
    @Body() dto: RenewSubscriptionDto,
    @Req() req: any
  ) {
    return this.subscriptionService.renew(req.user, id, dto);
  }
}
