import 'reflect-metadata';
import { NestFactory } from '@nestjs/core';
import { ConfigService } from '@nestjs/config';
import { Logger } from '@nestjs/common';
import { AppModule } from './app.module';
import { setupSwagger } from './bootstrap/swagger.bootstrap';
import { setupValidation } from './bootstrap/validation.bootstrap';
import { setupSecurity } from './bootstrap/security.bootstrap';

async function bootstrap() {
  const app = await NestFactory.create(AppModule, { bufferLogs: true, rawBody: true });
  const config = app.get(ConfigService);

  const port = config.get<number>('app.port') ?? 4000;
  const apiPrefix = config.get<string>('app.apiPrefix') ?? 'api';
  const corsOrigin = config.get<string>('app.corsOrigin') ?? '*';

  app.setGlobalPrefix(apiPrefix);
  setupSecurity(app, corsOrigin);
  setupValidation(app);
  setupSwagger(app, apiPrefix);

  await app.listen(port);

  Logger.log(
    `🚀 ${config.get<string>('app.storeName')} API running on http://localhost:${port}/${apiPrefix}`,
    'Bootstrap',
  );
  Logger.log(
    `📘 Swagger docs at http://localhost:${port}/${apiPrefix}/docs`,
    'Bootstrap',
  );
}

bootstrap();
