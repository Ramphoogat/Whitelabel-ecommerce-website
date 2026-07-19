export const STORAGE_CLIENT = 'STORAGE_CLIENT';

export interface UploadResult {
  key: string;
  url: string;
}

export interface StorageProvider {
  upload(params: {
    key: string;
    body: Buffer;
    contentType: string;
  }): Promise<UploadResult>;
  getSignedUploadUrl(params: {
    key: string;
    contentType: string;
    expiresInSeconds?: number;
  }): Promise<{ uploadUrl: string; publicUrl: string }>;
  delete(key: string): Promise<void>;
  isHealthy(): Promise<boolean>;
}
