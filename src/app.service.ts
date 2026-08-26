import { Injectable, OnApplicationBootstrap, OnApplicationShutdown } from '@nestjs/common';
import { MongoService } from './mongo/mongo.service';

@Injectable()
export class AppService implements OnApplicationBootstrap, OnApplicationShutdown {
  
  constructor(private readonly mongoService: MongoService) {}

  async onApplicationBootstrap() {
    await this.mongoService.connect();
  }

  async onApplicationShutdown() {
    await this.mongoService.disconnect();
  }
  
  getHello(): string {
    return 'Hello World!';
  }
}
