
import {
  Body,
  Controller,
  Get,
  HttpCode,
  HttpStatus,
  Param,
  Patch,
  Post,
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
import { ActivateSubscriptionDto } from './dto/activate-subscription.dto';
import { RenewSubscriptionDto } from './dto/renew-subscription.dto';

@ApiTags('Subscriptions')
@ApiBearerAuth()
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
  create(@Body() dto: CreateSubscriptionDto) {
    return this.subscriptionService.create(dto);
  }

  @Get()
  @ApiOperation({ summary: 'Get all subscriptions' })
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'Subscriptions retrieved successfully',
  })
  findAll() {
    return this.subscriptionService.findAll();
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
  findOne(@Param('id') id: string) {
    return this.subscriptionService.findOne(id);
  }

  @Patch(':id/activate')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Activate a subscription' })
  @ApiParam({
    name: 'id',
    description: 'MongoDB subscription ID',
  })
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'Subscription activated successfully',
  })
  @ApiResponse({
    status: HttpStatus.CONFLICT,
    description: 'Business already has an active subscription',
  })
  activate(
    @Param('id') id: string,
    @Body() dto: ActivateSubscriptionDto,
  ) {
    return this.subscriptionService.activate(id, dto);
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
  ) {
    return this.subscriptionService.renew(id, dto);
  }
}
