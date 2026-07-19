import { Logger } from '@nestjs/common';
import { Connection } from 'mongoose';

const logger = new Logger('MongoDB');

export function registerDatabaseLogging(connection: Connection): void {
  connection.on('connected', () => logger.log('MongoDB connected'));
  connection.on('disconnected', () => logger.warn('MongoDB disconnected'));
  connection.on('error', (err) => logger.error(`MongoDB error: ${err.message}`));
}
