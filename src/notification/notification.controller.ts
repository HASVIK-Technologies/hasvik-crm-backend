import {
  BadRequestException,
  Body,
  Controller,
  Get,
  HttpCode,
  HttpStatus,
  NotFoundException,
  Param,
  Post,
} from '@nestjs/common';
import {
  ApiOperation,
  ApiTags,
} from '@nestjs/swagger';

import { NotificationService } from './notification.service';
import { CreateNotificationDto } from './dto/create-notification.dto';
import { NotificationChannel } from 'src/mongo/enums/notification-types.enum';

@ApiTags('Notifications')
@Controller('notifications')
export class NotificationController {
  constructor(
    private readonly notificationService: NotificationService,
  ) {}

  @Post()
  @HttpCode(HttpStatus.ACCEPTED)
  @ApiOperation({
    summary: 'Create a notification request',
  })
  async create(@Body() dto: CreateNotificationDto) {
    return this.notificationService.createNotification(dto);
  }

  @Get(':id')
  @ApiOperation({
    summary: 'Get notification request status',
  })
  async getById(@Param('id') id: string) {
    const notification =
      await this.notificationService.findById(id);

    if (!notification) {
      throw new NotFoundException(
        'Notification not found',
      );
    }

    return notification;
  }

  @Post('test-whatsapp')
  async testWhatsApp(@Body() dto: CreateNotificationDto) {

    if (dto.channel !== NotificationChannel.WHATSAPP) {
    throw new BadRequestException(
      'This endpoint supports WhatsApp only',
    );
  }
  return this.notificationService.sendNotification(dto);
}
}