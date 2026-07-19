import { registerAs } from '@nestjs/config';

export type RedisMode = 'standalone' | 'sentinel';

export default registerAs('redis', () => ({
  mode: (process.env.REDIS_MODE as RedisMode) || 'standalone',
  host: process.env.REDIS_HOST || 'localhost',
  port: parseInt(process.env.REDIS_PORT || '6379', 10),
  password: process.env.REDIS_PASSWORD || undefined,
  sentinels: (process.env.REDIS_SENTINELS || '')
    .split(',')
    .filter(Boolean)
    .map((entry) => {
      const [host, port] = entry.split(':');
      return { host, port: parseInt(port, 10) };
    }),
  sentinelName: process.env.REDIS_SENTINEL_NAME || 'mymaster',
}));
