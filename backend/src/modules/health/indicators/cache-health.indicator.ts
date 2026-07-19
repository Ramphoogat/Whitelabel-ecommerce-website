import { Inject, Injectable } from '@nestjs/common';
import { HealthIndicator, HealthIndicatorResult, HealthCheckError } from '@nestjs/terminus';
import { CACHE_CLIENT, CacheProvider } from '../../../providers/cache/cache.interface';

@Injectable()
export class CacheHealthIndicator extends HealthIndicator {
  constructor(@Inject(CACHE_CLIENT) private readonly cache: CacheProvider) {
    super();
  }

  async isHealthy(key: string): Promise<HealthIndicatorResult> {
    const healthy = await this.cache.isHealthy();
    const result = this.getStatus(key, healthy);
    if (!healthy) {
      throw new HealthCheckError('Redis check failed', result);
    }
    return result;
  }
}
