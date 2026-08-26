import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { SwaggerModule, DocumentBuilder } from '@nestjs/swagger';
import { ValidationPipe } from '@nestjs/common';
import * as bodyParser from 'body-parser';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  const bodyLimit = process.env.BODY_LIMIT || '20mb';

  app.use(bodyParser.json({ limit: bodyLimit }));
  app.use(bodyParser.urlencoded({ limit: bodyLimit, extended: true }));

  app.useLogger(['log', 'error', 'warn', 'debug', 'verbose']);

  app.useGlobalPipes(
    new ValidationPipe({
      transform: true,
      whitelist: true,
    }),
  );

  // CORS configuration
  const allowedOrigins = process.env.ALLOW_ORIGIN ? process.env.ALLOW_ORIGIN.split(',') : [];
  if (allowedOrigins.length > 0) {
    app.enableCors({
      origin: allowedOrigins,
      credentials: true,
    });
  } else {
    //Allow all origins for development purposes
    app.enableCors();
  }

  // Global API prefix
  app.setGlobalPrefix('api');

  const config = new DocumentBuilder()
    .setTitle('Hasvik CRM API')
    .setDescription('Auth APIs')
    .setVersion('1.0')
    .addBearerAuth()
    .build();

  const document = SwaggerModule.createDocument(app, config);

  SwaggerModule.setup('swagger', app, document);

  await app.listen(process.env.PORT || 4000, '0.0.0.0');
}
bootstrap();