import {
  Body,
  Controller,
  Delete,
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
  ApiTags,
} from '@nestjs/swagger';

import { NotificationTemplateService } from './notification-template.service';
import { CreateNotificationTemplateDto } from './dto/create-notification-template.dto';
import { UpdateNotificationTemplateDto } from './dto/update-notification-template.dto';
import {
  NotificationCategory,
  NotificationChannel,
} from '../mongo/enums';

@ApiTags('Notification Templates')
@Controller('notification-templates')
export class NotificationTemplateController {
  constructor(
    private readonly templateService: NotificationTemplateService,
  ) {}

  @Post()
  @ApiOperation({ summary: 'Create a notification template' })
  async create(@Body() dto: CreateNotificationTemplateDto) {
    return this.templateService.create(dto);
  }

  @Get()
  @ApiOperation({ summary: 'List notification templates' })
  @ApiQuery({ name: 'channel', enum: NotificationChannel, required: false })
  @ApiQuery({ name: 'category', enum: NotificationCategory, required: false })
  @ApiQuery({
    name: 'isActive',
    required: false,
    enum: ['true', 'false'],
  })
  async findAll(
    @Query('channel') channel?: NotificationChannel,
    @Query('category') category?: NotificationCategory,
    @Query('isActive') isActive?: string,
  ) {
    if (isActive !== undefined && !['true', 'false'].includes(isActive)) {
      // Keep query parameters explicit rather than treating arbitrary strings as booleans.
      return this.templateService.findAll({
        channel,
        category,
        isActive: undefined,
      });
    }

    return this.templateService.findAll({
      channel,
      category,
      isActive:
        isActive === undefined ? undefined : isActive === 'true',
    });
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get a notification template by ID' })
  @ApiParam({ name: 'id', description: 'MongoDB template ID' })
  async findById(@Param('id') id: string) {
    return this.templateService.findById(id);
  }

  @Patch(':id')
  @ApiOperation({ summary: 'Update a notification template' })
  @ApiParam({ name: 'id', description: 'MongoDB template ID' })
  async update(
    @Param('id') id: string,
    @Body() dto: UpdateNotificationTemplateDto,
  ) {
    return this.templateService.update(id, dto);
  }

  @Delete(':id')
  @ApiOperation({ summary: 'Deactivate a notification template' })
  @ApiParam({ name: 'id', description: 'MongoDB template ID' })
  async deactivate(@Param('id') id: string) {
    return this.templateService.deactivate(id);
  }
}