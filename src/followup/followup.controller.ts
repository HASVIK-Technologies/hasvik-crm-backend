import {
  Body,
  Controller,
  Get,
  Param,
  Patch,
  Post,
  Query,
} from '@nestjs/common';
import {
  ApiOperation,
  ApiParam,
  ApiQuery,
  ApiResponse,
  ApiTags,
} from '@nestjs/swagger';

import { CreateFollowUpDto } from './dto/create-follow-up.dto';
import { UpdateFollowUpDto } from './dto/update-follow-up.dto';
import { FollowUpFilterDto } from './dto/get-follow-up-filter.dto';
import { FollowUpService } from './followup.service';

@ApiTags('Follow Ups')
@Controller('follow-ups')
export class FollowUpController {
  constructor(
    private readonly followUpService: FollowUpService,
  ) {}

  /**
   * Create Follow-up
   */
  @Post()
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
    const userId = 'CURRENT_USER_ID';

    return this.followUpService.create(
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
  @ApiResponse({
    status: 200,
    description: 'Follow-ups retrieved successfully.',
  })
  async findAll(
    @Query() query: FollowUpFilterDto,
  ) {
    return this.followUpService.findAll(query);
  }

  /**
   * Get Follow-ups by Business
   */
  @Get('business/:businessId')
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
    return this.followUpService.findByBusiness(
      businessId,
    );
  }

  /**
   * Get Follow-ups by Assigned User
   */
  @Get('assigned/:userId')
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
    return this.followUpService.findByAssignedUser(
      userId,
    );
  }

  /**
   * Get Follow-up by ID
   */
  @Get(':id')
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
    return this.followUpService.findById(id);
  }

  /**
   * Update Follow-up
   */
  @Patch(':id')
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
    return this.followUpService.update(
      id,
      dto,
    );
  }
}