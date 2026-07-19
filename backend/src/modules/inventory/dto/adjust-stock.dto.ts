import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsInt, IsMongoId, IsOptional, IsString } from 'class-validator';

export class AdjustStockDto {
  @ApiProperty({ description: 'Variant id whose stock is being adjusted' })
  @IsMongoId()
  variantId!: string;

  @ApiProperty({
    description: 'Positive to add stock, negative to remove/correct it',
    example: 50,
  })
  @IsInt()
  quantityDelta!: number;

  @ApiPropertyOptional({ example: 'Restock from supplier PO #1234' })
  @IsOptional()
  @IsString()
  note?: string;
}
