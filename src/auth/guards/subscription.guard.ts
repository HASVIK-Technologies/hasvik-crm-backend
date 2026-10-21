
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
import { SubscriptionService } from '../../subscription/subscription.service';

@Injectable()
export class SubscriptionGuard implements CanActivate {
  constructor(
    private readonly mongo: MongoService, 
    private readonly subscriptionService: SubscriptionService,
  ) {}

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
      
      const subscription = await this.subscriptionService.hasTenantActiveSubscriptions(tenantId);

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
