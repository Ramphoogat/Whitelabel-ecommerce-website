import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, HydratedDocument } from 'mongoose';

export type PaymentModeDocument = HydratedDocument<PaymentMode>;

@Schema({ timestamps: true, collection: 'payment_modes' })
export class PaymentMode extends Document {
  @Prop({ required: true, unique: true })
  code!: string; // 'upi' | 'card' | 'netbanking' | 'wallet' | 'cod'

  @Prop({ required: true })
  label!: string;

  @Prop({ default: '' })
  icon!: string;

  @Prop({ default: true })
  enabledByDefault!: boolean;

  // COD has no gateway behind it — it's a fulfillment method, not a processor.
  @Prop({ default: false })
  requiresGateway!: boolean;

  @Prop({ default: 0 })
  displayOrder!: number;
}

export const PaymentModeSchema = SchemaFactory.createForClass(PaymentMode);
