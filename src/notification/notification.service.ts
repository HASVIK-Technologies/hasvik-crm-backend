import {
  ConflictException,
  Injectable,
  Logger,
} from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';

import { NOTIFICATION_LOG_MODEL } from './notification.constants';
import { CreateNotificationDto } from './dto/create-notification.dto';
import { NotificationStatus } from '../mongo/enums';
import { NotificationProviderFactory } from './providers/notification-provider.factory';
import { MongoService } from 'src/mongo/mongo.service';
import { NotificationTemplateService } from './notification-template.service';
import { ConfigService } from '@nestjs/config';
import { getNotificationDeliveryBlockReason } from '../common/notification-delivery.guard';

interface NotificationLogRecord {
  _id: Types.ObjectId;
  channel: string;
  category: string;
  recipient: string;
  templateCode: string;
  variables: Record<string, unknown>;
  status: NotificationStatus;
  provider: string;
  scheduledAt: Date;
  idempotencyKey?: string | null;
  createdAt: Date;
}

@Injectable()
export class NotificationService {
  private readonly logger = new Logger(
    NotificationService.name,
  );

  constructor(
  private readonly mongo: MongoService,
  private readonly notificationTemplateService: NotificationTemplateService,
  private readonly providerFactory:
    NotificationProviderFactory,
  private readonly configService: ConfigService,
) {}

  async createNotification(dto: CreateNotificationDto) {
    const providerName =
        this.providerFactory.getProviderName(dto.channel);

    try {
        const notification =
        await this.mongo.models.notificationLog.create({
            channel: dto.channel,
            category: dto.category,
            recipient: dto.recipient,
            templateCode: dto.templateCode,
            variables: dto.variables ?? {},
            scheduledAt: dto.scheduledAt
            ? new Date(dto.scheduledAt)
            : new Date(),
            idempotencyKey: dto.idempotencyKey ?? null,
            provider: providerName,
            status: NotificationStatus.QUEUED,
        });

        return {
        id: notification._id,
        channel: notification.channel,
        provider: providerName,
        status: notification.status,
        scheduledAt: notification.scheduledAt,
        };
    } catch (error) {
        if (
        error instanceof Error &&
        'code' in error &&
        error.code === 11000
        ) {
        throw new ConflictException(
            'A notification with this idempotency key already exists',
        );
        }

        throw error;
    }
    }

  async findById(id: string) {
    if (!Types.ObjectId.isValid(id)) {
      return null;
    }

    return this.mongo.models.notificationLog
      .findById(id)
      .select('-variables')
      .lean()
      .exec();
  }

  async sendNotification(dto: CreateNotificationDto) {
  // Save the log first
  const log = await this.createNotification(dto);

  try {
    const deliveryBlockReason = getNotificationDeliveryBlockReason(
      this.configService,
      dto.channel,
    );
    console.log('Delivery block reason:', deliveryBlockReason);
    if (deliveryBlockReason) {
      // Update the log to reflect the failure and return it from here
      return await this.mongo.models.notificationLog.findByIdAndUpdate(
        log.id,
        {
          $set: {
            status: NotificationStatus.FAILED,
            lastError: deliveryBlockReason,
            processedAt: new Date(),
          },
        },
        { new: true },
      );
    }

    // Call your existing provider-selection logic
    const provider = this.providerFactory.getProvider(dto.channel);

    // Load the saved template
    const template = await this.notificationTemplateService.findByCode(
      dto.templateCode,
      dto.channel,
    );

    const result = await provider.send({
      channel: dto.channel,
      recipient: dto.recipient,
      templateCode: template.code,
      providerTemplateId: template.providerTemplateId ?? undefined,
      requiredVariables: template.requiredVariables,
      variables: dto.variables ?? {},
    });

    // Update the log after MSG91 responds
    return await this.mongo.models.notificationLog.findByIdAndUpdate(
      log.id,
      {
        $set: {
          status: NotificationStatus.ACCEPTED,
          provider: provider.name,
          providerMessageId: result.providerMessageId,
          processedAt: new Date(),
        },
      },
      { new: true },
    );
  } catch (error) {
    await this.mongo.models.notificationLog.findByIdAndUpdate(log.id, {
      $set: {
        status: NotificationStatus.FAILED,
        lastError: error instanceof Error ? error.message : 'Send failed',
        processedAt: new Date(),
      },
    });

    throw error;
  }
}
}