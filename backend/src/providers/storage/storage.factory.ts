import { ConfigService } from '@nestjs/config';
import { StorageProvider } from './storage.interface';
import { S3CompatibleStorage } from './s3-compatible.storage';

// Known default endpoints for non-AWS providers. STORAGE_ENDPOINT in .env
// always wins if explicitly set, so these are just sensible fallbacks.
const DEFAULT_ENDPOINTS: Record<string, (region: string) => string | undefined> = {
  s3: () => undefined, // AWS SDK resolves the endpoint from region automatically
  contabo: () => 'https://usc1.contabostorage.com',
  zata: () => 'https://idr01.zata.ai',
  minio: () => 'http://localhost:9000',
  r2: () => undefined, // R2 endpoint is account-specific; must be set via STORAGE_ENDPOINT
};

export function createStorageProvider(config: ConfigService): StorageProvider {
  const provider = config.get<string>('storage.provider') || 's3';
  const region = config.get<string>('storage.region') || 'us-east-1';
  const endpoint =
    config.get<string>('storage.endpoint') || DEFAULT_ENDPOINTS[provider]?.(region);

  return new S3CompatibleStorage({
    bucket: config.get<string>('storage.bucket') || '',
    region,
    endpoint,
    accessKey: config.get<string>('storage.accessKey') || '',
    secretKey: config.get<string>('storage.secretKey') || '',
    publicUrl: config.get<string>('storage.publicUrl') || undefined,
    forcePathStyle: provider !== 's3',
  });
}
