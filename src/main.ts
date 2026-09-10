import { NestFactory } from '@nestjs/core';
import { ExpressAdapter } from '@nestjs/platform-express';
import { AppModule } from './app.module';
import {
  SwaggerModule,
  DocumentBuilder,
} from '@nestjs/swagger';
import { ValidationPipe } from '@nestjs/common';
import * as bodyParser from 'body-parser';
import express from 'express';

async function bootstrap() {
  const server = express();

  const app = await NestFactory.create(
    AppModule,
    new ExpressAdapter(server),
  );

  // Body parser
  const bodyLimit = process.env.BODY_LIMIT || '20mb';

  app.use(
    bodyParser.json({
      limit: bodyLimit,
    }),
  );

  app.use(
    bodyParser.urlencoded({
      limit: bodyLimit,
      extended: true,
    }),
  );

  // Logger
  app.useLogger([
    'log',
    'error',
    'warn',
    'debug',
    'verbose',
  ]);

  // Validation
  app.useGlobalPipes(
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
    app.enableCors({
      origin: allowedOrigins,
      credentials: true,
    });
  } else {
    app.enableCors();
  }

  // API prefix
  app.setGlobalPrefix('api');

  // Swagger configuration
  const swaggerConfig = new DocumentBuilder()
    .setTitle('Hasvik CRM API')
    .setDescription('Hasvik CRM API Documentation')
    .setVersion('1.0')
    .addBearerAuth()
    .build();

  const swaggerDocument = SwaggerModule.createDocument(
    app,
    swaggerConfig,
  );

  // Swagger UI
  SwaggerModule.setup(
    'swagger',
    app,
    swaggerDocument,
  );

  await app.listen(4000);

  console.log(
    'Hasvik CRM API running on http://localhost:4000',
  );

  console.log(
    'Swagger running on http://localhost:4000/swagger',
  );
}

bootstrap();