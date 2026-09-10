import { NestFactory } from '@nestjs/core';
import { ExpressAdapter } from '@nestjs/platform-express';
import { AppModule } from '../src/app.module';
import {
  SwaggerModule,
  DocumentBuilder,
} from '@nestjs/swagger';
import { ValidationPipe } from '@nestjs/common';
import * as bodyParser from 'body-parser';
import express from 'express';

const server = express();

let app: any;

async function bootstrap() {
  if (!app) {
    const nestApp = await NestFactory.create(
      AppModule,
      new ExpressAdapter(server),
    );

    const bodyLimit = process.env.BODY_LIMIT || '20mb';

    nestApp.use(bodyParser.json({ limit: bodyLimit }));
    nestApp.use(
      bodyParser.urlencoded({
        limit: bodyLimit,
        extended: true,
      }),
    );

    nestApp.useLogger([
      'log',
      'error',
      'warn',
      'debug',
      'verbose',
    ]);

    nestApp.useGlobalPipes(
      new ValidationPipe({
        transform: true,
        whitelist: true,
      }),
    );

    const allowedOrigins = process.env.ALLOW_ORIGIN
      ? process.env.ALLOW_ORIGIN.split(',')
      : [];

    if (allowedOrigins.length > 0) {
      nestApp.enableCors({
        origin: allowedOrigins,
        credentials: true,
      });
    } else {
      nestApp.enableCors();
    }

    // API prefix
    nestApp.setGlobalPrefix('api');

    // Swagger
    const config = new DocumentBuilder()
      .setTitle('Hasvik CRM API')
      .setDescription('Auth APIs')
      .setVersion('1.0')
      .addBearerAuth()
      .build();

    const document = SwaggerModule.createDocument(
      nestApp,
      config,
    );

    SwaggerModule.setup(
      'swagger',
      nestApp,
      document,
    );

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