import { NestFactory } from '@nestjs/core';
import { ExpressAdapter } from '@nestjs/platform-express';
import { AppModule } from '../src/app.module';
import express from 'express';

const server = express();

let app: any;

async function bootstrap() {
  if (!app) {
    const nestApp = await NestFactory.create(
      AppModule,
      new ExpressAdapter(server),
    );

    nestApp.enableCors();
    await nestApp.init();

    app = nestApp;
  }

  return server;
}

export default async function handler(
  req: any,
  res: any,
) {
  const serverInstance = await bootstrap();

  return serverInstance(req, res);
}