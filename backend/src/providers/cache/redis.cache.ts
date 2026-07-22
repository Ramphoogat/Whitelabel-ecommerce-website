import { Injectable, Logger, OnModuleDestroy } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import Redis from 'ioredis';
import { CacheProvider } from './cache.interface';

@Injectable()
export class RedisStandaloneCache implements CacheProvider, OnModuleDestroy {
  private readonly logger = new Logger(RedisStandaloneCache.name);
  private readonly client: Redis;
  private available = false;

  constructor(private readonly config: ConfigService) {
    this.client = new Redis({
      host: this.config.get<string>('redis.host'),
      port: this.config.get<number>('redis.port'),
      password: this.config.get<string>('redis.password') || undefined,
      lazyConnect: true,
      enableOfflineQueue: false,
      maxRetriesPerRequest: 1,
      retryStrategy: (times) => {
        // Back off: 1s, 2s, 4s … max 30s. Never throws — just retries silently.
        return Math.min(times * 1000, 30_000);
      },
    });

    this.client.on('error', (err) => {
      if (this.available) this.logger.warn(`Redis unavailable: ${err.message}`);
      this.available = false;
    });
    this.client.on('connect', () => {
      this.available = true;
      this.logger.log('Redis (standalone) connected');
    });

    // Attempt initial connection in the background — failure is non-fatal.
    this.client.connect().catch(() => {
      this.logger.warn('Redis not reachable on startup — cache disabled, app continues without it');
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
    } catch { /* swallow — cache is best-effort */ }
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
