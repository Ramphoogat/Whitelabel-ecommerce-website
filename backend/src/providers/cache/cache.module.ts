import { Global, Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { CACHE_CLIENT } from './cache.interface';
import { RedisStandaloneCache } from './redis.cache';
import { RedisSentinelCache } from './redis-sentinel.cache';

@Global()
@Module({
  imports: [ConfigModule],
  providers: [
    RedisStandaloneCache,
    RedisSentinelCache,
    {
      provide: CACHE_CLIENT,
      useFactory: (config: ConfigService) => {
        const mode = config.get<string>('redis.mode');
        return mode === 'sentinel'
          ? new RedisSentinelCache(config)
          : new RedisStandaloneCache(config);
      },
      inject: [ConfigService],
    },
  ],
  exports: [CACHE_CLIENT],
})
export class CacheModule {}
