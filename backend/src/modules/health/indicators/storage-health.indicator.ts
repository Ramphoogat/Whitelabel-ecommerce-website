import { Inject, Injectable } from '@nestjs/common';
import { HealthIndicator, HealthIndicatorResult, HealthCheckError } from '@nestjs/terminus';
import { STORAGE_CLIENT, StorageProvider } from '../../../providers/storage/storage.interface';

@Injectable()
export class StorageHealthIndicator extends HealthIndicator {
  constructor(@Inject(STORAGE_CLIENT) private readonly storage: StorageProvider) {
    super();
  }

  async isHealthy(key: string): Promise<HealthIndicatorResult> {
    const healthy = await this.storage.isHealthy();
    const result = this.getStatus(key, healthy);
    if (!healthy) {
      throw new HealthCheckError('Storage check failed', result);
    }
    return result;
  }
}
