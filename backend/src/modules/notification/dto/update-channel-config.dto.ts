import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsBoolean, IsObject, IsOptional, IsString } from 'class-validator';

export class UpdateChannelConfigDto {
  @ApiProperty({ example: 'sendgrid' })
  @IsString()
  provider!: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsBoolean()
  isActive?: boolean;

  @ApiPropertyOptional({
    description: 'Raw (plaintext) credentials, encrypted server-side before being persisted',
  })
  @IsOptional()
  @IsObject()
  credentials?: Record<string, string>;
}
