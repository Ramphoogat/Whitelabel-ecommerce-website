import { Controller, Get } from '@nestjs/common';
import {
  HealthCheck,
  HealthCheckService,
  MongooseHealthIndicator,
} from '@nestjs/terminus';
import { ApiTags } from '@nestjs/swagger';
import { CacheHealthIndicator } from './indicators/cache-health.indicator';
import { StorageHealthIndicator } from './indicators/storage-health.indicator';

@ApiTags('health')
@Controller('health')
export class HealthController {
  constructor(
    private readonly health: HealthCheckService,
    private readonly mongo: MongooseHealthIndicator,
    private readonly cache: CacheHealthIndicator,
    private readonly storage: StorageHealthIndicator,
  ) {}

  @Get()
  @HealthCheck()
  check() {
    return this.health.check([
      () => this.mongo.pingCheck('mongodb'),
      () => this.cache.isHealthy('redis'),
      () => this.storage.isHealthy('storage'),
    ]);
  }
}
