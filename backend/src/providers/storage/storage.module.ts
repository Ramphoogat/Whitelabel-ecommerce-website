import { Global, Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { STORAGE_CLIENT } from './storage.interface';
import { createStorageProvider } from './storage.factory';

@Global()
@Module({
  imports: [ConfigModule],
  providers: [
    {
      provide: STORAGE_CLIENT,
      useFactory: (config: ConfigService) => createStorageProvider(config),
      inject: [ConfigService],
    },
  ],
  exports: [STORAGE_CLIENT],
})
export class StorageModule {}
