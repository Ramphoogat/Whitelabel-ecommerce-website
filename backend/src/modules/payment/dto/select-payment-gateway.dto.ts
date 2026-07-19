import { ApiProperty } from '@nestjs/swagger';
import { IsString } from 'class-validator';

export class SelectPaymentGatewayDto {
  @ApiProperty({ example: 'upi', description: 'One of the modes returned by GET /checkout/payment-options' })
  @IsString()
  mode!: string;

  @ApiProperty({ example: 'razorpay', description: 'One of the gateways listed under the chosen mode' })
  @IsString()
  gateway!: string;
}
