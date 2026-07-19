import { ApiPropertyOptional } from '@nestjs/swagger';
import {
  IsArray,
  IsBoolean,
  IsIn,
  IsNumber,
  IsObject,
  IsOptional,
} from 'class-validator';
import { PaymentModeCode } from '../schemas/payment-gateway-config.schema';

const VALID_MODES: PaymentModeCode[] = ['upi', 'card', 'netbanking', 'wallet', 'cod'];

export class UpdateGatewayConfigDto {
  @ApiPropertyOptional({ description: 'Turn this gateway on/off for checkout' })
  @IsOptional()
  @IsBoolean()
  isActive?: boolean;

  @ApiPropertyOptional({
    description: 'Which payment modes this gateway supports',
    isArray: true,
    enum: VALID_MODES,
  })
  @IsOptional()
  @IsArray()
  @IsIn(VALID_MODES, { each: true })
  supportedModes?: PaymentModeCode[];

  @ApiPropertyOptional({
    description:
      'Raw (plaintext) credentials — e.g. { "keyId": "...", "keySecret": "..." }. ' +
      'Encrypted server-side before being persisted; never returned in any GET response.',
  })
  @IsOptional()
  @IsObject()
  credentials?: Record<string, string>;

  @ApiPropertyOptional({ description: 'Display order when multiple gateways share a mode' })
  @IsOptional()
  @IsNumber()
  priority?: number;

  @ApiPropertyOptional()
  @IsOptional()
  @IsBoolean()
  isTestMode?: boolean;
}
