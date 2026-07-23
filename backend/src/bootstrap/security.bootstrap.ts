import { INestApplication } from '@nestjs/common';
import helmet from 'helmet';
import * as compression from 'compression';

export function setupSecurity(app: INestApplication, corsOrigin: string): void {
  app.use(helmet());
  app.use(compression());
  app.enableCors({
    origin: corsOrigin === '*' ? true : corsOrigin.split(','),
    credentials: true,
    exposedHeaders: ['x-cart-token'],
  });
}
