import { BadRequestException, Inject, Injectable, Logger } from '@nestjs/common';
import { randomUUID } from 'crypto';
import sharp from 'sharp';
import { STORAGE_CLIENT, StorageProvider } from '../../providers/storage/storage.interface';

/** MIME types that support sharp processing. SVG and PDF go straight to storage. */
const RASTER_IMAGE_TYPES = new Set(['image/jpeg', 'image/png', 'image/webp', 'image/gif']);

const ALLOWED_MIME_TYPES = new Set([
  ...RASTER_IMAGE_TYPES,
  'image/svg+xml',
  'application/pdf',
]);

const MAX_FILE_SIZE_BYTES = 10 * 1024 * 1024; // 10 MB

/** Resize presets applied to every raster image upload. */
const RESIZE_PRESETS = [
  { suffix: 'full', width: 2048, height: 2048, quality: 85 },
  { suffix: 'md',   width: 800,  height: 800,  quality: 82 },
  { suffix: 'thumb', width: 400, height: 400,  quality: 78 },
] as const;

export interface ImageVariant {
  suffix: string;
  key: string;
  url: string;
  widthPx: number;
  heightPx: number;
  sizeBytes: number;
}

export interface UploadedMediaDto {
  key: string;
  url: string;
  originalName: string;
  mimeType: string;
  sizeBytes: number;
  /** Populated for raster images: full / md / thumb WebP variants. */
  variants: ImageVariant[];
}

@Injectable()
export class MediaService {
  private readonly logger = new Logger(MediaService.name);

  constructor(
    @Inject(STORAGE_CLIENT) private readonly storage: StorageProvider,
  ) {}

  async upload(
    file: Express.Multer.File,
    folder = 'uploads',
  ): Promise<UploadedMediaDto> {
    if (!ALLOWED_MIME_TYPES.has(file.mimetype)) {
      throw new BadRequestException(
        `File type "${file.mimetype}" is not allowed. Allowed: ${[...ALLOWED_MIME_TYPES].join(', ')}`,
      );
    }
    if (file.size > MAX_FILE_SIZE_BYTES) {
      throw new BadRequestException(
        `File exceeds the ${MAX_FILE_SIZE_BYTES / 1024 / 1024} MB size limit`,
      );
    }

    const uid = randomUUID();
    const isRaster = RASTER_IMAGE_TYPES.has(file.mimetype);

    // ── Non-raster (SVG, PDF) — store as-is ──────────────────────────────────
    if (!isRaster) {
      const ext = file.originalname.split('.').pop() ?? 'bin';
      const key = `${folder}/${uid}.${ext}`;
      const result = await this.storage.upload({
        key,
        body: file.buffer,
        contentType: file.mimetype,
      });
      return {
        key: result.key,
        url: result.url,
        originalName: file.originalname,
        mimeType: file.mimetype,
        sizeBytes: file.size,
        variants: [],
      };
    }

    // ── Raster image — process with sharp ────────────────────────────────────
    // Probe the original so we can record accurate dimensions on each variant.
    const meta = await sharp(file.buffer).metadata();
    const origWidth = meta.width ?? 0;
    const origHeight = meta.height ?? 0;

    // Store the untouched original first (preserves source quality).
    const origExt = file.originalname.split('.').pop() ?? 'jpg';
    const origKey = `${folder}/${uid}/original.${origExt}`;
    const origResult = await this.storage.upload({
      key: origKey,
      body: file.buffer,
      contentType: file.mimetype,
    });

    // Process and upload each variant in parallel.
    const variants: ImageVariant[] = await Promise.all(
      RESIZE_PRESETS.map(async (preset) => {
        // Only downscale — never upscale a small source image.
        const needsResize = origWidth > preset.width || origHeight > preset.height;

        let pipeline = sharp(file.buffer).rotate(); // auto-rotate from EXIF

        if (needsResize) {
          pipeline = pipeline.resize(preset.width, preset.height, {
            fit: 'inside',
            withoutEnlargement: true,
          });
        }

        const processed = await pipeline
          .webp({ quality: preset.quality, effort: 4 })
          .toBuffer({ resolveWithObject: true });

        const variantKey = `${folder}/${uid}/${preset.suffix}.webp`;
        const variantResult = await this.storage.upload({
          key: variantKey,
          body: processed.data,
          contentType: 'image/webp',
        });

        return {
          suffix: preset.suffix,
          key: variantResult.key,
          url: variantResult.url,
          widthPx: processed.info.width,
          heightPx: processed.info.height,
          sizeBytes: processed.info.size,
        };
      }),
    );

    this.logger.log(
      `Processed "${file.originalname}" → ${variants.length} WebP variants ` +
        `(thumb: ${variants.find((v) => v.suffix === 'thumb')?.sizeBytes ?? 0}B)`,
    );

    return {
      key: origResult.key,
      url: origResult.url,
      originalName: file.originalname,
      mimeType: file.mimetype,
      sizeBytes: file.size,
      variants,
    };
  }

  async getSignedUploadUrl(
    filename: string,
    mimeType: string,
    folder = 'uploads',
  ): Promise<{ uploadUrl: string; publicUrl: string; key: string }> {
    if (!ALLOWED_MIME_TYPES.has(mimeType)) {
      throw new BadRequestException(`File type "${mimeType}" is not allowed`);
    }
    const ext = filename.split('.').pop() ?? 'bin';
    const key = `${folder}/${randomUUID()}/original.${ext}`;
    const { uploadUrl, publicUrl } = await this.storage.getSignedUploadUrl({
      key,
      contentType: mimeType,
      expiresInSeconds: 300,
    });
    return { uploadUrl, publicUrl, key };
  }

  async delete(key: string): Promise<void> {
    await this.storage.delete(key);
  }
}
