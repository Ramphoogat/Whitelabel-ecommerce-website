import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, HydratedDocument, Types } from 'mongoose';

export type OrderStatus = 'pending' | 'paid' | 'fulfilled' | 'cancelled' | 'refunded';

// Valid forward transitions — enforced in OrderService.transitionStatus().
export const ORDER_STATUS_TRANSITIONS: Record<OrderStatus, OrderStatus[]> = {
  pending: ['paid', 'cancelled'],
  paid: ['fulfilled', 'refunded', 'cancelled'],
  fulfilled: ['refunded'],
  cancelled: [],
  refunded: [],
};

@Schema({ _id: false })
export class OrderLineItem {
  @Prop({ required: true, type: Types.ObjectId, ref: 'ProductVariant' })
  variantId!: Types.ObjectId;

  @Prop({ required: true })
  sku!: string;

  @Prop({ required: true })
  quantity!: number;

  // Price at purchase time — never re-read from the live variant after this.
  @Prop({ required: true })
  unitPriceCents!: number;
}

export const OrderLineItemSchema = SchemaFactory.createForClass(OrderLineItem);

export type OrderDocument = HydratedDocument<Order>;

@Schema({ timestamps: true, collection: 'orders' })
export class Order extends Document {
  @Prop({ type: Types.ObjectId, ref: 'Customer', default: null })
  customerId!: Types.ObjectId | null; // null = guest order

  @Prop({ required: true })
  orderNumber!: string;

  @Prop({ type: [OrderLineItemSchema], default: [] })
  items!: OrderLineItem[];

  @Prop({ required: true, enum: ['pending', 'paid', 'fulfilled', 'cancelled', 'refunded'], default: 'pending' })
  status!: OrderStatus;

  @Prop({ required: true })
  totalCents!: number;

  @Prop({ type: String, default: null })
  couponCode!: string | null;

  @Prop({ default: 0 })
  discountCents!: number;

  @Prop({ required: true, default: 'INR' })
  currency!: string;

  @Prop({ type: Types.ObjectId, ref: 'CheckoutSession', required: true })
  checkoutSessionId!: Types.ObjectId;

  @Prop({ type: String, default: null })
  paymentGateway!: string | null;

  @Prop({ type: String, default: null })
  gatewayPaymentId!: string | null;

  @Prop({ type: String, default: null })
  contactEmail!: string | null;

  @Prop({ type: String, default: null })
  contactPhone!: string | null;
}

export const OrderSchema = SchemaFactory.createForClass(Order);
OrderSchema.index({ orderNumber: 1 }, { unique: true });
OrderSchema.index({ status: 1 });
OrderSchema.index({ customerId: 1 });
