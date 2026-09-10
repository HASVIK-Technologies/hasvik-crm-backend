import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import {
  SwaggerModule,
  DocumentBuilder,
} from '@nestjs/swagger';
import { ValidationPipe } from '@nestjs/common';
import * as bodyParser from 'body-parser';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  const bodyLimit = process.env.BODY_LIMIT || '20mb';

  app.use(bodyParser.json({ limit: bodyLimit }));
  app.use(
    bodyParser.urlencoded({
      limit: bodyLimit,
      extended: true,
    }),
  );

  app.useLogger([
    'log',
    'error',
    'warn',
    'debug',
    'verbose',
  ]);

  app.useGlobalPipes(
    new ValidationPipe({
      transform: true,
      whitelist: true,
    }),
  );

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

  app.setGlobalPrefix('api');

  // Swagger
  const config = new DocumentBuilder()
    .setTitle('Hasvik CRM API')
    .setDescription('Auth APIs')
    .setVersion('1.0')
    .addBearerAuth()
    .build();

  const document = SwaggerModule.createDocument(app, config);

  SwaggerModule.setup('swagger', app, document);

  const port = process.env.PORT || 4000;

  await app.listen(port);

  console.log(`Application running on port ${port}`);
  console.log(`Swagger: http://localhost:${port}/swagger`);
}

bootstrap();