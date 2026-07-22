import { Injectable, Logger, OnModuleDestroy } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import Redis from 'ioredis';
import { CacheProvider } from './cache.interface';

@Injectable()
export class RedisSentinelCache implements CacheProvider, OnModuleDestroy {
  private readonly logger = new Logger(RedisSentinelCache.name);
  private readonly client: Redis;
  private available = false;

  constructor(private readonly config: ConfigService) {
    const sentinels = this.config.get<{ host: string; port: number }[]>('redis.sentinels') || [];

    this.client = new Redis({
      sentinels,
      name: this.config.get<string>('redis.sentinelName'),
      password: this.config.get<string>('redis.password') || undefined,
      enableOfflineQueue: false,
      maxRetriesPerRequest: 1,
    });

    this.client.on('error', (err) => {
      if (this.available) this.logger.warn(`Redis Sentinel unavailable: ${err.message}`);
      this.available = false;
    });
    this.client.on('connect', () => {
      this.available = true;
      this.logger.log('Redis (sentinel) connected');
    });
  }

  async get<T = string>(key: string): Promise<T | null> {
    if (!this.available) return null;
    try {
      const value = await this.client.get(key);
      return value as unknown as T | null;
    } catch {
      return null;
    }
  }

  async set(key: string, value: string, ttlSeconds?: number): Promise<void> {
    if (!this.available) return;
    try {
      if (ttlSeconds) {
        await this.client.set(key, value, 'EX', ttlSeconds);
      } else {
        await this.client.set(key, value);
      }
    } catch { /* swallow */ }
  }

  async del(key: string): Promise<void> {
    if (!this.available) return;
    try {
      await this.client.del(key);
    } catch { /* swallow */ }
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
    try { await this.client.quit(); } catch { /* ignore */ }
  }
}
