
import {
  CanActivate,
  ExecutionContext,
  ForbiddenException,
  Injectable,
  ServiceUnavailableException,
  UnauthorizedException,
} from '@nestjs/common';
import { MongoService } from '../../mongo/mongo.service';
import moment from 'moment';
import { SubscriptionStatus, UserRole } from '../../mongo/enums';

@Injectable()
export class SubscriptionGuard implements CanActivate {
  constructor(private readonly mongo: MongoService) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const request = context.switchToHttp().getRequest();
    const user = request.user;

    if (!user) {
      throw new UnauthorizedException('User not authenticated');
    }

    const tenantId = user.tenantId;

    if (!tenantId) {
      throw new ForbiddenException('A valid tenant is required.');
    }

    try {
      const tenant = await this.mongo.models.tenant.findOne({
          _id: this.mongo.toObjectId(tenantId),
      }).lean();

      if (!tenant) {
          throw new ForbiddenException('A valid tenant is required.');
      }

      if (user.role === UserRole.ADMIN) {
          return true;
      }

      const now = moment();
      
      const subscription = await this.mongo.models.subscription
        .findOne({
          tenantId: this.mongo.toObjectId(tenantId),
          startDate: { $lte: now },
          endDate: { $gt: now },
        })
        .lean();

      if (!subscription) {
        throw new ForbiddenException(
          'No active subscription found for this tenant.',
        );
      }

      return true;
    } catch (error) {
      if (
        error instanceof ForbiddenException ||
        error instanceof UnauthorizedException
      ) {
        throw error;
      }

      throw new ServiceUnavailableException(
        'Unable to verify the subscription. Please try again later.',
      );
    }
  }
}
