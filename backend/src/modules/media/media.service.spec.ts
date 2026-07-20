import { Test, TestingModule } from '@nestjs/testing';
import { BadRequestException } from '@nestjs/common';
import { MediaService } from './media.service';
import { STORAGE_CLIENT } from '../../providers/storage/storage.interface';

// sharp does real image processing — provide a tiny valid JPEG so it doesn't throw.
// 1×1 red pixel JPEG (base64).
const TINY_JPEG_B64 =
  '/9j/4AAQSkZJRgABAQEASABIAAD/2wBDAAgGBgcGBQgHBwcJCQgKDBQNDAsLDBkS' +
  'Ew8UHRofHh0aHBwgJC4nICIsIxwcKDcpLDAxNDQ0Hyc5PTgyPC4zNDL/2wBDAQkJ' +
  'CQwLDBgNDRgyIRwhMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIy' +
  'MjIyMjIyMjIyMjL/wAARCAABAAEDASIAAhEBAxEB/8QAFAABAAAAAAAAAAAAAAAAAAAACf/' +
  'EABQQAQAAAAAAAAAAAAAAAAAAAAD/xAAUAQEAAAAAAAAAAAAAAAAAAAAA/8QAFBEBAAAA' +
  'AAAAAAAAAAAAAAD/2gAMAwEAAhEDEQA/AJIA/9k=';
const TINY_JPEG = Buffer.from(TINY_JPEG_B64, 'base64');

const mockStorage = {
  upload: jest.fn().mockImplementation(({ key }: { key: string }) =>
    Promise.resolve({ key, url: `https://cdn.example.com/${key}` }),
  ),
  getSignedUploadUrl: jest.fn().mockResolvedValue({
    uploadUrl: 'https://s3.presigned.url/upload',
    publicUrl: 'https://cdn.example.com/uploads/file.jpg',
  }),
  delete: jest.fn().mockResolvedValue(undefined),
};

function makeFile(overrides: Partial<Express.Multer.File> = {}): Express.Multer.File {
  return {
    fieldname: 'file',
    originalname: 'photo.jpg',
    encoding: '7bit',
    mimetype: 'image/jpeg',
    size: TINY_JPEG.length,
    buffer: TINY_JPEG,
    destination: '',
    filename: '',
    path: '',
    stream: null as any,
    ...overrides,
  };
}

describe('MediaService', () => {
  let service: MediaService;

  beforeEach(async () => {
    jest.clearAllMocks();
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        MediaService,
        { provide: STORAGE_CLIENT, useValue: mockStorage },
      ],
    }).compile();
    service = module.get<MediaService>(MediaService);
  });

  // ── upload — raster images ─────────────────────────────────────────────────

  it('uploads a JPEG and returns original URL + 3 WebP variants', async () => {
    const file = makeFile();
    const result = await service.upload(file, 'products');

    // Original stored as-is
    expect(result.key).toMatch(/products\/[a-f0-9-]+\/original\.jpg/);
    expect(result.url).toContain('cdn.example.com');
    expect(result.mimeType).toBe('image/jpeg');
    expect(result.originalName).toBe('photo.jpg');

    // Three WebP variants: full, md, thumb
    expect(result.variants).toHaveLength(3);
    const suffixes = result.variants.map((v) => v.suffix);
    expect(suffixes).toContain('full');
    expect(suffixes).toContain('md');
    expect(suffixes).toContain('thumb');
  });

  it('variant keys are all under the same UID folder', async () => {
    const result = await service.upload(makeFile(), 'media');
    const [, uid] = result.key.split('/');
    for (const v of result.variants) {
      expect(v.key).toContain(`media/${uid}/`);
      expect(v.key).toMatch(/\.webp$/);
    }
  });

  it('variant URLs point to cdn', async () => {
    const result = await service.upload(makeFile(), 'products');
    for (const v of result.variants) {
      expect(v.url).toContain('cdn.example.com');
    }
  });

  it('calls storage.upload once per variant plus once for the original (4 total)', async () => {
    await service.upload(makeFile(), 'products');
    // 1 original + 3 variants
    expect(mockStorage.upload).toHaveBeenCalledTimes(4);
  });

  it('uploads a PNG and produces WebP variants', async () => {
    // Use same JPEG buffer — sharp handles it; we just need a valid raster buffer.
    const file = makeFile({ mimetype: 'image/png', originalname: 'banner.png' });
    const result = await service.upload(file);
    expect(result.variants.length).toBeGreaterThan(0);
    expect(result.variants[0].key).toMatch(/\.webp$/);
  });

  // ── upload — non-raster passthrough ───────────────────────────────────────

  it('stores SVG directly without generating variants', async () => {
    const svgBuf = Buffer.from('<svg xmlns="http://www.w3.org/2000/svg"><rect/></svg>');
    const file = makeFile({ mimetype: 'image/svg+xml', originalname: 'logo.svg', buffer: svgBuf, size: svgBuf.length });
    const result = await service.upload(file, 'logos');

    expect(result.variants).toHaveLength(0);
    expect(result.key).toMatch(/logos\/[a-f0-9-]+\.svg/);
    expect(mockStorage.upload).toHaveBeenCalledTimes(1);
  });

  it('stores PDF directly without generating variants', async () => {
    const pdfBuf = Buffer.from('%PDF-1.4 fake');
    const file = makeFile({ mimetype: 'application/pdf', originalname: 'doc.pdf', buffer: pdfBuf, size: pdfBuf.length });
    const result = await service.upload(file, 'docs');

    expect(result.variants).toHaveLength(0);
    expect(result.key).toMatch(/docs\/[a-f0-9-]+\.pdf/);
    expect(mockStorage.upload).toHaveBeenCalledTimes(1);
  });

  // ── validation ─────────────────────────────────────────────────────────────

  it('rejects files with disallowed MIME types', async () => {
    const file = makeFile({ mimetype: 'application/exe', originalname: 'virus.exe' });
    await expect(service.upload(file)).rejects.toThrow(BadRequestException);
    expect(mockStorage.upload).not.toHaveBeenCalled();
  });

  it('rejects files exceeding 10 MB', async () => {
    const file = makeFile({ size: 11 * 1024 * 1024 });
    await expect(service.upload(file)).rejects.toThrow(BadRequestException);
    expect(mockStorage.upload).not.toHaveBeenCalled();
  });

  // ── getSignedUploadUrl ─────────────────────────────────────────────────────

  it('returns uploadUrl and a key under the given folder', async () => {
    const result = await service.getSignedUploadUrl('image.png', 'image/png', 'avatars');
    expect(result.uploadUrl).toContain('presigned');
    expect(result.key).toMatch(/^avatars\/[a-f0-9-]+\/original\.png$/);
  });

  it('rejects disallowed MIME in signed URL request', async () => {
    await expect(service.getSignedUploadUrl('script.sh', 'application/x-sh')).rejects.toThrow(BadRequestException);
  });

  // ── delete ─────────────────────────────────────────────────────────────────

  it('delegates delete to the storage provider', async () => {
    await service.delete('products/abc/original.jpg');
    expect(mockStorage.delete).toHaveBeenCalledWith('products/abc/original.jpg');
  });
});
