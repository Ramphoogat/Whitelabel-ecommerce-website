import { Module, Logger } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { BullModule } from '@nestjs/bullmq';

const logger = new Logger('QueueModule');

@Module({
  imports: [
    BullModule.forRootAsync({
      imports: [ConfigModule],
      inject: [ConfigService],
      useFactory: (config: ConfigService) => {
        const mode = config.get<string>('redis.mode');
        const prefix = config.get<string>('queue.prefix');

        const sharedOpts = {
          enableOfflineQueue: false,
          lazyConnect: true,
          maxRetriesPerRequest: 1,
          retryStrategy: (times: number) => times > 3 ? null : Math.min(times * 1000, 5_000),
        };

        if (mode === 'sentinel') {
          const sentinels =
            config.get<{ host: string; port: number }[]>('redis.sentinels') || [];
          return {
            prefix,
            connection: {
              sentinels,
              name: config.get<string>('redis.sentinelName'),
              password: config.get<string>('redis.password') || undefined,
              ...sharedOpts,
            },
          };
        }

        const connection = {
          host: config.get<string>('redis.host'),
          port: config.get<number>('redis.port'),
          password: config.get<string>('redis.password') || undefined,
          ...sharedOpts,
        };

        // Log once so the developer knows queues are optional
        (connection as any)['onConnect'] = () => logger.log('BullMQ Redis connected');

        return { prefix, connection };
      },
    }),
  ],
  exports: [BullModule],
})
export class QueueModule {}
