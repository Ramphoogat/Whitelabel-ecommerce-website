import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import {
  IsBoolean,
  IsMongoId,
  IsNumber,
  IsObject,
  IsOptional,
  IsString,
  Min,
} from 'class-validator';

export class CreateVariantDto {
  @ApiProperty({ description: 'Parent product id' })
  @IsMongoId()
  productId!: string;

  @ApiProperty({ example: 'SAREE-BLU-M' })
  @IsString()
  sku!: string;

  @ApiProperty({ description: 'Price in minor units (paise/cents)', example: 149900 })
  @IsNumber()
  @Min(0)
  priceCents!: number;

  @ApiPropertyOptional({ description: 'Strike-through original price, minor units' })
  @IsOptional()
  @IsNumber()
  @Min(0)
  compareAtPriceCents?: number;

  @ApiPropertyOptional({ example: { size: 'M', color: 'Blue' } })
  @IsOptional()
  @IsObject()
  options?: Record<string, string>;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  imageUrl?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsBoolean()
  isActive?: boolean;

  @ApiPropertyOptional()
  @IsOptional()
  @IsNumber()
  @Min(0)
  weightGrams?: number;

  @ApiPropertyOptional({
    description: 'Starting stock quantity — creates the matching InventoryItem',
    example: 25,
  })
  @IsOptional()
  @IsNumber()
  @Min(0)
  initialQuantity?: number;
}
