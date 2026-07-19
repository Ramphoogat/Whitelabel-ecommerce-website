import { ApiProperty } from '@nestjs/swagger';
import { IsMongoId } from 'class-validator';

export class AddToWishlistDto {
  @ApiProperty({ example: '6650a1f2c1d4e5a6b7c8d9e0' })
  @IsMongoId()
  productId!: string;
}
