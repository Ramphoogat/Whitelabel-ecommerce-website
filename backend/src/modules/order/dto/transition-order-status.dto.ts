import { ApiProperty } from '@nestjs/swagger';
import { IsIn } from 'class-validator';
import { OrderStatus } from '../schemas/order.schema';

const VALID_STATUSES: OrderStatus[] = ['pending', 'paid', 'fulfilled', 'cancelled', 'refunded'];

export class TransitionOrderStatusDto {
  @ApiProperty({ enum: VALID_STATUSES })
  @IsIn(VALID_STATUSES)
  status!: OrderStatus;
}
