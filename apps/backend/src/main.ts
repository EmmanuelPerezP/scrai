import 'reflect-metadata';
import { ValidationPipe } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { AppConfig } from './config/configuration';
import { runSeed } from './database/seeds/seed';
import { setupSwagger, SWAGGER_PATH } from './swagger';
import { DataSource } from 'typeorm';

async function bootstrap() {
  const app = await NestFactory.create(AppModule, { bufferLogs: false });
  const config = app.get(ConfigService<AppConfig, true>);

  app.setGlobalPrefix('api');
  app.enableCors({ origin: config.get('corsOrigin', { infer: true }), credentials: true });
  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      transform: true,
      transformOptions: { enableImplicitConversion: true },
    }),
  );

  setupSwagger(app);

  // Seed mock patients on first boot (idempotent — only if table is empty).
  if (config.get('database', { infer: true }).runSeed) {
    await runSeed(app.get(DataSource));
  }

  const port = config.get('port', { infer: true });
  await app.listen(port);

  // eslint-disable-next-line no-console
  console.log(`🚀 API ready at http://localhost:${port}/api`);
  // eslint-disable-next-line no-console
  console.log(`📚 Swagger docs at http://localhost:${port}/${SWAGGER_PATH}`);
}

bootstrap();
