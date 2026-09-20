import {
  Body,
  Controller,
  Get,
  Param,
  Patch,
  Post,
  Query,
  UseGuards
} from '@nestjs/common';

import {
  ApiBearerAuth,
  ApiOperation,
  ApiParam,
  ApiResponse,
  ApiTags,
} from '@nestjs/swagger';

import { CreateFollowUpDto } from './dto/create-follow-up.dto';
import { UpdateFollowUpDto } from './dto/update-follow-up.dto';
import { FollowUpFilterDto } from './dto/get-follow-up-filter.dto';
import { FollowUpService } from './followup.service';

import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { PermissionsGuard } from '../auth/guards/permissions.guard';
import { Permissions } from '../auth/decorators/permissions.decorator';
import { Permission } from '../auth/enums/permission.enum';

@ApiTags('Follow Ups')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard, PermissionsGuard)
@Controller('follow-ups')
export class FollowUpController {
  constructor(
    private readonly followUpService: FollowUpService,
  ) {}

  /**
   * Create Follow-up
   */
  @Post()
  @Permissions(Permission.FOLLOW_UP_CREATE)
  @ApiOperation({
    summary: 'Create a new follow-up',
  })
  @ApiResponse({
    status: 201,
    description: 'Follow-up created successfully.',
  })
  async create(
    @Body() dto: CreateFollowUpDto,
  ) {
    // Replace with authenticated user ID
    const userId = '6a8f3be16f9d9afdbc79974f';

    return await this.followUpService.create(
      dto,
      userId,
    );
  }

  /**
   * Get all Follow-ups
   */
  @Get()
  @ApiOperation({
    summary: 'Get follow-ups',
    description:
      'Get follow-ups with optional filtering and pagination.',
  })
  @Permissions(Permission.FOLLOW_UP_READ)
  @ApiResponse({
    status: 200,
    description: 'Follow-ups retrieved successfully.',
  })
  async findAll(
    @Query() query: FollowUpFilterDto,
  ) {
    return await this.followUpService.findAll(query);
  }

  /**
   * Get Follow-ups by Business
   */
  @Get('business/:businessId')
  @Permissions(Permission.FOLLOW_UP_READ)
  @ApiOperation({
    summary: 'Get follow-up history for a business',
  })
  @ApiParam({
    name: 'businessId',
    description: 'Business ID',
    example: '665c12345678901234567890',
  })
  async findByBusiness(
    @Param('businessId') businessId: string,
  ) {
    return await this.followUpService.findByBusiness(
      businessId,
    );
  }

  /**
   * Get Follow-ups by Assigned User
   */
  @Get('assigned/:userId')
  @Permissions(Permission.FOLLOW_UP_READ)
  @ApiOperation({
    summary: 'Get follow-ups assigned to a user',
  })
  @ApiParam({
    name: 'userId',
    description: 'Assigned user ID',
    example: '665c98765432109876543210',
  })
  async findByAssignedUser(
    @Param('userId') userId: string,
  ) {
    return await this.followUpService.findByAssignedUser(
      userId,
    );
  }

  /**
   * Get Follow-up by ID
   */
  @Get(':id')
  @Permissions(Permission.FOLLOW_UP_READ)
  @ApiOperation({
    summary: 'Get follow-up by ID',
  })
  @ApiParam({
    name: 'id',
    description: 'Follow-up ID',
    example: '665cabcd1234567890123456',
  })
  async findById(
    @Param('id') id: string,
  ) {
    return await this.followUpService.findById(id);
  }

  /**
   * Update Follow-up
   */
  @Patch(':id')
  @Permissions(Permission.FOLLOW_UP_UPDATE)
  @ApiOperation({
    summary: 'Update follow-up',
    description:
      'Update follow-up details such as type, schedule, assignment or notes.',
  })
  @ApiParam({
    name: 'id',
    description: 'Follow-up ID',
    example: '665cabcd1234567890123456',
  })
  async update(
    @Param('id') id: string,
    @Body() dto: UpdateFollowUpDto,
  ) {
    return await this.followUpService.update(
      id,
      dto,
    );
  }
}