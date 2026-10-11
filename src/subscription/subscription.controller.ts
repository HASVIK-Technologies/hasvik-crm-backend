
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
import { PermissionsGuard } from 'src/auth/guards/permissions.guard';
import { JwtAuthGuard } from 'src/auth/guards/jwt-auth.guard';

@ApiTags('Subscriptions')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard, PermissionsGuard)
@Controller('subscriptions')
export class SubscriptionController {
  constructor(
    private readonly subscriptionService: SubscriptionService,
  ) {}

  @Post()
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
    const tenantId = req.user.tenantId;
    return this.subscriptionService.create(tenantId, dto);
  }

  @Get()
  @ApiOperation({ summary: 'Get all subscriptions' })
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'Subscriptions retrieved successfully',
  })
  findAll( @Req() req: any ) {
    const tenantId = req.user.tenantId;
    return this.subscriptionService.findAll(tenantId);
  }

  @Get(':id')
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
    const tenantId = req.user.tenantId;
    return this.subscriptionService.findOne(tenantId, id );
  }

  @Patch(':id/status')
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
    const tenantId = req.user.tenantId;
    return this.subscriptionService.updateStatus(tenantId, id, dto );
  }

  @Patch(':id/renew')
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
    const tenantId = req.user.tenantId;
    return this.subscriptionService.renew(tenantId, id, dto);
  }
}
