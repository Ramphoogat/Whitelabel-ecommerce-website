import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, HydratedDocument } from 'mongoose';
import { SUPPORTED_GATEWAYS } from '../../../providers/payment/payment.factory';

export type PaymentModeCode = 'upi' | 'card' | 'netbanking' | 'wallet' | 'cod';

export type PaymentGatewayConfigDocument = HydratedDocument<PaymentGatewayConfig>;

@Schema({ timestamps: true, collection: 'payment_gateway_configs' })
export class PaymentGatewayConfig extends Document {
  @Prop({ required: true, enum: SUPPORTED_GATEWAYS, unique: true })
  provider!: string;

  @Prop({ default: false })
  isActive!: boolean;

  @Prop({ type: [String], default: [] })
  supportedModes!: PaymentModeCode[];

  // Encrypted (AES-256-GCM) via shared/utils/encryption.util.ts before save —
  // never stored or logged as plaintext. See PaymentAdminService.
  @Prop({ type: Object, default: {} })
  encryptedCredentials!: Record<string, string>;

  @Prop({ default: 0 })
  priority!: number;

  @Prop({ default: false })
  isTestMode!: boolean;
}

export const PaymentGatewayConfigSchema = SchemaFactory.createForClass(PaymentGatewayConfig);

// One document per gateway per deployment (single-tenant-per-VPS model —
// there is no tenantId here, unlike a shared-DB SaaS schema).
PaymentGatewayConfigSchema.index({ provider: 1 }, { unique: true });
