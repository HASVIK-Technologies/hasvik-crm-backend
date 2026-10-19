
import {
  Body,
  Controller,
  Get,
  Param,
  Patch,
  Post,
  Query,
  HttpCode,
  HttpStatus,
  UseGuards,
} from '@nestjs/common';
import {
  ApiBearerAuth,
  ApiOperation,
  ApiParam,
  ApiResponse,
  ApiTags,
} from '@nestjs/swagger';

import { SubscriptionPlanService } from './subscription-plan.service';
import { CreateSubscriptionPlanDto } from './dto/create-subscription-plan.dto';
import { UpdateSubscriptionPlanDto } from './dto/update-subscription-plan.dto';
import { QuerySubscriptionPlanDto } from './dto/query-subscription-plan.dto';
import { UpdateSubscriptionPlanStatusDto } from './dto/update-subscription-plan-status.dto';
import { UserRole } from 'src/mongo/enums/user-role.enum';
import { Roles } from 'src/auth/decorators/roles.decorator';
import { JwtAuthGuard } from 'src/auth/guards/jwt-auth.guard';
import { PermissionsGuard } from 'src/auth/guards/permissions.guard';
import { RolesGuard } from 'src/auth/guards/roles.guard';

@ApiTags('Subscription Plans')
@Controller('subscription-plans')
export class SubscriptionPlanController {
  constructor(
    private readonly subscriptionPlanService: SubscriptionPlanService,
  ) {}

  @Post()
  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard, PermissionsGuard, RolesGuard)
  @Roles(UserRole.ADMIN)
  @ApiOperation({ summary: 'Create a subscription plan' })
  @ApiResponse({
    status: HttpStatus.CREATED,
    description: 'Subscription plan created successfully',
  })
  @ApiResponse({
    status: HttpStatus.CONFLICT,
    description: 'A subscription plan with this code already exists',
  })
  create(@Body() dto: CreateSubscriptionPlanDto) {
    return this.subscriptionPlanService.create(dto);
  }

  @Get()
  @ApiOperation({ summary: 'Get subscription plans with filtering and pagination' })
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'Subscription plans retrieved successfully',
  })
  findAll(@Query() query: QuerySubscriptionPlanDto) {
    return this.subscriptionPlanService.findAll(query);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get a subscription plan by ID' })
  @ApiParam({
    name: 'id',
    description: 'MongoDB subscription plan ID',
    example: '68f123456789012345678901',
  })
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'Subscription plan retrieved successfully',
  })
  @ApiResponse({
    status: HttpStatus.NOT_FOUND,
    description: 'Subscription plan not found',
  })
  findOne(
    @Param('id') id: string,
  ) {
    return this.subscriptionPlanService.findOne(id);
  }

  @Patch(':id')
  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard, PermissionsGuard, RolesGuard)
  @Roles(UserRole.ADMIN)
  @ApiOperation({ summary: 'Update a subscription plan' })
  @ApiParam({
    name: 'id',
    description: 'MongoDB subscription plan ID',
  })
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'Subscription plan updated successfully',
  })
  @ApiResponse({
    status: HttpStatus.NOT_FOUND,
    description: 'Subscription plan not found',
  })
  @ApiResponse({
    status: HttpStatus.CONFLICT,
    description: 'A subscription plan with this code already exists',
  })
  update(
    @Param('id') id: string,
    @Body() dto: UpdateSubscriptionPlanDto,
  ) {
    return this.subscriptionPlanService.update(id, dto);
  }

  @Patch(':id/status')
  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard, PermissionsGuard, RolesGuard)
  @Roles(UserRole.ADMIN)
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Activate or deactivate a subscription plan' })
  @ApiParam({
    name: 'id',
    description: 'MongoDB subscription plan ID',
  })
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'Subscription plan status updated successfully',
  })
  @ApiResponse({
    status: HttpStatus.NOT_FOUND,
    description: 'Subscription plan not found',
  })
  updateStatus(
    @Param('id') id: string,
    @Body() dto: UpdateSubscriptionPlanStatusDto
  ) {
    return this.subscriptionPlanService.updateStatus(id, dto.isActive);
  }
}
