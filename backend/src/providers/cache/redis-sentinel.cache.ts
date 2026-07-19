import { Injectable, Logger, OnModuleDestroy } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import Redis from 'ioredis';
import { CacheProvider } from './cache.interface';

@Injectable()
export class RedisSentinelCache implements CacheProvider, OnModuleDestroy {
  private readonly logger = new Logger(RedisSentinelCache.name);
  private readonly client: Redis;

  constructor(private readonly config: ConfigService) {
    const sentinels = this.config.get<{ host: string; port: number }[]>('redis.sentinels') || [];

    this.client = new Redis({
      sentinels,
      name: this.config.get<string>('redis.sentinelName'),
      password: this.config.get<string>('redis.password') || undefined,
    });

    this.client.on('error', (err) => this.logger.error(`Redis Sentinel error: ${err.message}`));
    this.client.on('connect', () => this.logger.log('Redis (sentinel) connected'));
  }

  async get<T = string>(key: string): Promise<T | null> {
    const value = await this.client.get(key);
    return value as unknown as T | null;
  }

  async set(key: string, value: string, ttlSeconds?: number): Promise<void> {
    if (ttlSeconds) {
      await this.client.set(key, value, 'EX', ttlSeconds);
    } else {
      await this.client.set(key, value);
    }
  }

  async del(key: string): Promise<void> {
    await this.client.del(key);
  }

  async isHealthy(): Promise<boolean> {
    try {
      const pong = await this.client.ping();
      return pong === 'PONG';
    } catch {
      return false;
    }
  }

  async onModuleDestroy(): Promise<void> {
    await this.client.quit();
  }
}
