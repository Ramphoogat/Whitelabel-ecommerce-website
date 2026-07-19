import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, HydratedDocument, Types } from 'mongoose';

export type CheckoutSessionStatus = 'open' | 'awaiting_payment' | 'completed' | 'expired';

@Schema({ _id: false })
export class CheckoutLineItem {
  @Prop({ required: true, type: Types.ObjectId, ref: 'ProductVariant' })
  variantId!: Types.ObjectId;

  @Prop({ required: true })
  sku!: string;

  @Prop({ required: true, min: 1 })
  quantity!: number;

  @Prop({ required: true })
  unitPriceCents!: number;
}

export const CheckoutLineItemSchema = SchemaFactory.createForClass(CheckoutLineItem);

export type CheckoutSessionDocument = HydratedDocument<CheckoutSession>;

@Schema({ timestamps: true, collection: 'checkout_sessions' })
export class CheckoutSession extends Document {
  @Prop({ required: true, type: Types.ObjectId, ref: 'Cart' })
  cartId!: Types.ObjectId;

  @Prop({ type: [CheckoutLineItemSchema], default: [] })
  items!: CheckoutLineItem[];

  @Prop({ required: true })
  subtotalCents!: number;

  @Prop({ required: true })
  totalCents!: number;

  @Prop({ type: String, default: null })
  couponCode!: string | null;

  @Prop({ default: 0 })
  discountCents!: number;

  @Prop({ required: true, default: 'INR' })
  currency!: string;

  // Captured at checkout so a confirmation notification has somewhere to
  // go. Optional -- neither is required to complete a guest checkout.
  @Prop({ type: String, default: null })
  contactEmail!: string | null;

  @Prop({ type: String, default: null })
  contactPhone!: string | null;

  @Prop({ required: true, enum: ['open', 'awaiting_payment', 'completed', 'expired'], default: 'open' })
  status!: CheckoutSessionStatus;

  // Set once the customer picks a mode/gateway on the checkout page (Phase 5).
  @Prop({ type: String, default: null })
  paymentMode!: string | null;

  @Prop({ type: String, default: null })
  paymentGateway!: string | null;

  @Prop({ type: String, default: null })
  gatewayOrderId!: string | null;

  @Prop({ required: true })
  expiresAt!: Date;

  @Prop({ type: Types.ObjectId, ref: 'Order', default: null })
  orderId!: Types.ObjectId | null;
}

export const CheckoutSessionSchema = SchemaFactory.createForClass(CheckoutSession);
CheckoutSessionSchema.index({ expiresAt: 1 });
