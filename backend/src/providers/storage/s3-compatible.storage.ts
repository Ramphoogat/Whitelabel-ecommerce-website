import { Logger } from '@nestjs/common';
import {
  S3Client,
  PutObjectCommand,
  DeleteObjectCommand,
  HeadBucketCommand,
} from '@aws-sdk/client-s3';
import { getSignedUrl } from '@aws-sdk/s3-request-presigner';
import { StorageProvider, UploadResult } from './storage.interface';

export interface S3CompatibleConfig {
  bucket: string;
  region: string;
  endpoint?: string;
  accessKey: string;
  secretKey: string;
  publicUrl?: string;
  forcePathStyle?: boolean;
}

/**
 * Works for AWS S3, Contabo Object Storage, Zata, MinIO, and Cloudflare R2 —
 * they all speak the S3 API. Only the endpoint/credentials differ, which is
 * exactly what STORAGE_PROVIDER + the other STORAGE_* env vars control.
 */
export class S3CompatibleStorage implements StorageProvider {
  private readonly logger = new Logger(S3CompatibleStorage.name);
  private readonly client: S3Client;

  constructor(private readonly cfg: S3CompatibleConfig) {
    this.client = new S3Client({
      region: cfg.region,
      endpoint: cfg.endpoint || undefined,
      forcePathStyle: cfg.forcePathStyle ?? Boolean(cfg.endpoint),
      credentials: {
        accessKeyId: cfg.accessKey,
        secretAccessKey: cfg.secretKey,
      },
    });
  }

  async upload(params: {
    key: string;
    body: Buffer;
    contentType: string;
  }): Promise<UploadResult> {
    await this.client.send(
      new PutObjectCommand({
        Bucket: this.cfg.bucket,
        Key: params.key,
        Body: params.body,
        ContentType: params.contentType,
      }),
    );
    return { key: params.key, url: this.buildPublicUrl(params.key) };
  }

  async getSignedUploadUrl(params: {
    key: string;
    contentType: string;
    expiresInSeconds?: number;
  }): Promise<{ uploadUrl: string; publicUrl: string }> {
    const command = new PutObjectCommand({
      Bucket: this.cfg.bucket,
      Key: params.key,
      ContentType: params.contentType,
    });
    const uploadUrl = await getSignedUrl(this.client, command, {
      expiresIn: params.expiresInSeconds ?? 300,
    });
    return { uploadUrl, publicUrl: this.buildPublicUrl(params.key) };
  }

  async delete(key: string): Promise<void> {
    await this.client.send(
      new DeleteObjectCommand({ Bucket: this.cfg.bucket, Key: key }),
    );
  }

  async isHealthy(): Promise<boolean> {
    try {
      await this.client.send(new HeadBucketCommand({ Bucket: this.cfg.bucket }));
      return true;
    } catch (err) {
      this.logger.error(`Storage health check failed: ${(err as Error).message}`);
      return false;
    }
  }

  private buildPublicUrl(key: string): string {
    if (this.cfg.publicUrl) {
      return `${this.cfg.publicUrl.replace(/\/$/, '')}/${key}`;
    }
    return `${this.cfg.endpoint || `https://s3.${this.cfg.region}.amazonaws.com`}/${this.cfg.bucket}/${key}`;
  }
}
