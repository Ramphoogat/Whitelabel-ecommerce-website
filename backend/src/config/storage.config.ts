import { registerAs } from '@nestjs/config';

export type StorageProvider = 's3' | 'contabo' | 'zata' | 'minio' | 'r2';

export default registerAs('storage', () => ({
  provider: (process.env.STORAGE_PROVIDER as StorageProvider) || 's3',
  bucket: process.env.STORAGE_BUCKET || '',
  region: process.env.STORAGE_REGION || 'us-east-1',
  endpoint: process.env.STORAGE_ENDPOINT || undefined,
  accessKey: process.env.STORAGE_ACCESS_KEY || '',
  secretKey: process.env.STORAGE_SECRET_KEY || '',
  publicUrl: process.env.STORAGE_PUBLIC_URL || '',
}));
