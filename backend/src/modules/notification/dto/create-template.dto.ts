import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsBoolean, IsIn, IsOptional, IsString } from 'class-validator';
import { NotificationChannel } from '../schemas/notification-channel-config.schema';

const VALID_CHANNELS: NotificationChannel[] = ['email', 'sms'];

export class CreateTemplateDto {
  @ApiProperty({ example: 'order_confirmation' })
  @IsString()
  key!: string;

  @ApiProperty({ enum: VALID_CHANNELS })
  @IsIn(VALID_CHANNELS)
  channel!: NotificationChannel;

  @ApiPropertyOptional({ description: 'Email only -- ignored for sms' })
  @IsOptional()
  @IsString()
  subjectTemplate?: string;

  @ApiProperty({ example: 'Hi {{customerName}}, your order {{orderNumber}} is confirmed!' })
  @IsString()
  bodyTemplate!: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsBoolean()
  isActive?: boolean;
}
