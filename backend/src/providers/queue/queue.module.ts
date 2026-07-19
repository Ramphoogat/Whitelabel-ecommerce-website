import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { BullModule } from '@nestjs/bullmq';

@Module({
  imports: [
    BullModule.forRootAsync({
      imports: [ConfigModule],
      inject: [ConfigService],
      useFactory: (config: ConfigService) => {
        const mode = config.get<string>('redis.mode');
        const prefix = config.get<string>('queue.prefix');

        if (mode === 'sentinel') {
          const sentinels =
            config.get<{ host: string; port: number }[]>('redis.sentinels') || [];
          return {
            prefix,
            connection: {
              sentinels,
              name: config.get<string>('redis.sentinelName'),
              password: config.get<string>('redis.password') || undefined,
            },
          };
        }

        return {
          prefix,
          connection: {
            host: config.get<string>('redis.host'),
            port: config.get<number>('redis.port'),
            password: config.get<string>('redis.password') || undefined,
          },
        };
      },
    }),
  ],
  exports: [BullModule],
})
export class QueueModule {}
