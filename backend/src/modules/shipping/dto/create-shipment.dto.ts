import { ApiProperty } from '@nestjs/swagger';
import { IsMongoId, IsString } from 'class-validator';

export class CreateShipmentDto {
  @ApiProperty()
  @IsMongoId()
  orderId!: string;

  @ApiProperty({ example: 'shiprocket' })
  @IsString()
  carrier!: string;
}
