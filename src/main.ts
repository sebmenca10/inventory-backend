import './polyfills';
import * as crypto from 'crypto';
(global as any).crypto = crypto; // Fix de crypto.randomUUID()

import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import helmet from 'helmet';
import { ValidationPipe } from '@nestjs/common';
import { SwaggerModule, DocumentBuilder } from '@nestjs/swagger';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  app.use(helmet());
  app.enableCors();
  app.useGlobalPipes(new ValidationPipe({ whitelist: true, transform: true }));

  // Swagger setup
  const config = new DocumentBuilder()
    .setTitle('Inventory API')
    .setDescription('Documentación de la API del sistema de inventarios')
    .setVersion('1.0.0')
    .addBearerAuth()
    .build();

  const document = SwaggerModule.createDocument(app, config);
  SwaggerModule.setup('api/docs', app, document, {
    swaggerOptions: { persistAuthorization: true },
  });

  await app.listen(process.env.PORT || 3000);
  console.log(`Server running at http://localhost:${process.env.PORT || 3000}`);
  console.log(`Swagger docs at http://localhost:${process.env.PORT || 3000}/api/docs`);
}
bootstrap();