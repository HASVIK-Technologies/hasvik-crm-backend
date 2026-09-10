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

let initialized = false;

async function bootstrap() {
  if (initialized) {
    return;
  }

  const nestApp = await NestFactory.create(
    AppModule,
    new ExpressAdapter(server),
  );

  // Body parser
  const bodyLimit = process.env.BODY_LIMIT || '20mb';

  nestApp.use(
    bodyParser.json({
      limit: bodyLimit,
    }),
  );

  nestApp.use(
    bodyParser.urlencoded({
      limit: bodyLimit,
      extended: true,
    }),
  );

  // Logger
  nestApp.useLogger([
    'log',
    'error',
    'warn',
    'debug',
    'verbose',
  ]);

  // Validation
  nestApp.useGlobalPipes(
    new ValidationPipe({
      transform: true,
      whitelist: true,
    }),
  );

  // CORS
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
  const swaggerConfig = new DocumentBuilder()
    .setTitle('Hasvik CRM API')
    .setDescription('Auth APIs')
    .setVersion('1.0')
    .addBearerAuth()
    .build();

  const swaggerDocument = SwaggerModule.createDocument(
    nestApp,
    swaggerConfig,
  );

  SwaggerModule.setup(
    'swagger',
    nestApp,
    swaggerDocument,
  );

  await nestApp.init();

  initialized = true;
}

export default async function handler(
  req: any,
  res: any,
) {
  await bootstrap();

  return server(req, res);
}