import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import {
  IsArray,
  IsIn,
  IsMongoId,
  IsObject,
  IsOptional,
  IsString,
  MinLength,
} from 'class-validator';
import { ProductStatus } from '../schemas/product.schema';

const VALID_STATUSES: ProductStatus[] = ['draft', 'active', 'archived'];

export class CreateProductDto {
  @ApiProperty({ example: 'Handwoven Silk Saree' })
  @IsString()
  @MinLength(2)
  title!: string;

  @ApiPropertyOptional({ description: 'Auto-generated from title if omitted' })
  @IsOptional()
  @IsString()
  slug?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  description?: string;

  @ApiPropertyOptional({ type: [String] })
  @IsOptional()
  @IsArray()
  @IsMongoId({ each: true })
  categoryIds?: string[];

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  brand?: string;

  @ApiPropertyOptional({ type: [String] })
  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  images?: string[];

  @ApiPropertyOptional({ enum: VALID_STATUSES, default: 'draft' })
  @IsOptional()
  @IsIn(VALID_STATUSES)
  status?: ProductStatus;

  @ApiPropertyOptional({
    description: 'Free-form theme-specific fields, e.g. { "fabric": "silk", "shelfLifeDays": 7 }',
  })
  @IsOptional()
  @IsObject()
  attributes?: Record<string, unknown>;
}
