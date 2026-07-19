import { ApiProperty } from '@nestjs/swagger';
import { IsObject, IsString } from 'class-validator';

export class SendTestNotificationDto {
  @ApiProperty({ example: 'order_confirmation' })
  @IsString()
  templateKey!: string;

  @ApiProperty({ example: 'someone@example.com', description: 'Email address or E.164 phone number' })
  @IsString()
  recipient!: string;

  @ApiProperty({ example: { customerName: 'Ram', orderNumber: 'ORD-20260719-AB12' } })
  @IsObject()
  data!: Record<string, unknown>;
}
