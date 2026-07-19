export const CACHE_CLIENT = 'CACHE_CLIENT';

export interface CacheProvider {
  get<T = string>(key: string): Promise<T | null>;
  set(key: string, value: string, ttlSeconds?: number): Promise<void>;
  del(key: string): Promise<void>;
  isHealthy(): Promise<boolean>;
}
