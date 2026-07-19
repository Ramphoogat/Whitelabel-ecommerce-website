import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, HydratedDocument } from 'mongoose';
import { SUPPORTED_CARRIERS } from '../../../providers/shipping/shipping.factory';

export type ShippingCarrierConfigDocument = HydratedDocument<ShippingCarrierConfig>;

@Schema({ timestamps: true, collection: 'shipping_carrier_configs' })
export class ShippingCarrierConfig extends Document {
  @Prop({ required: true, enum: SUPPORTED_CARRIERS, unique: true })
  carrier!: string;

  @Prop({ default: false })
  isActive!: boolean;

  // Encrypted (AES-256-GCM) via shared/utils/encryption.util.ts before save —
  // same pattern as payment_gateway_configs.
  @Prop({ type: Object, default: {} })
  encryptedCredentials!: Record<string, string>;

  @Prop({ default: 0 })
  priority!: number;
}

export const ShippingCarrierConfigSchema = SchemaFactory.createForClass(ShippingCarrierConfig);
ShippingCarrierConfigSchema.index({ carrier: 1 }, { unique: true });
