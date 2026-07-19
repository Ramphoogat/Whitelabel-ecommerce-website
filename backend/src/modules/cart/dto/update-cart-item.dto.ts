import { ApiProperty } from '@nestjs/swagger';
import { IsInt, Min } from 'class-validator';

export class UpdateCartItemDto {
  @ApiProperty({ minimum: 0, description: '0 removes the item from the cart' })
  @IsInt()
  @Min(0)
  quantity!: number;
}
