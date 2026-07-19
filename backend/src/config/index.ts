import appConfig from './app.config';
import databaseConfig from './database.config';
import redisConfig from './redis.config';
import storageConfig from './storage.config';
import queueConfig from './queue.config';
import securityConfig from './security.config';

export const allConfigs = [
  appConfig,
  databaseConfig,
  redisConfig,
  storageConfig,
  queueConfig,
  securityConfig,
];

export { envValidationSchema } from './env.validation';
