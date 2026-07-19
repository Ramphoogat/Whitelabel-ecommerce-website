import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, HydratedDocument, Types } from 'mongoose';

export type CartStatus = 'active' | 'converted' | 'abandoned';

@Schema({ _id: false })
export class CartItem {
  @Prop({ required: true, type: Types.ObjectId, ref: 'ProductVariant' })
  variantId!: Types.ObjectId;

  @Prop({ required: true, min: 1 })
  quantity!: number;

  // Snapshot of price at the moment it was added, shown in the cart UI —
  // the checkout step always re-reads the live price before creating an order.
  @Prop({ required: true })
  priceCentsSnapshot!: number;
}

export const CartItemSchema = SchemaFactory.createForClass(CartItem);

export type CartDocument = HydratedDocument<Cart>;

@Schema({ timestamps: true, collection: 'carts' })
export class Cart extends Document {
  // Present when the cart belongs to a logged-in customer.
  @Prop({ type: Types.ObjectId, ref: 'Customer', default: null, index: true })
  customerId!: Types.ObjectId | null;

  // Present for guest carts — a random opaque token kept in a cookie/header
  // on the storefront. Exactly one of customerId/guestToken is set.
  @Prop({ type: String, default: null, index: true })
  guestToken!: string | null;

  @Prop({ type: [CartItemSchema], default: [] })
  items!: CartItem[];

  @Prop({ required: true, enum: ['active', 'converted', 'abandoned'], default: 'active' })
  status!: CartStatus;
}

export const CartSchema = SchemaFactory.createForClass(Cart);
CartSchema.index({ guestToken: 1 });
CartSchema.index({ customerId: 1 });
