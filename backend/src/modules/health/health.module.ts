import { Module } from '@nestjs/common';
import { TerminusModule } from '@nestjs/terminus';
import { HealthController } from './health.controller';
import { CacheHealthIndicator } from './indicators/cache-health.indicator';
import { StorageHealthIndicator } from './indicators/storage-health.indicator';

@Module({
  imports: [TerminusModule],
  controllers: [HealthController],
  providers: [CacheHealthIndicator, StorageHealthIndicator],
})
export class HealthModule {}
