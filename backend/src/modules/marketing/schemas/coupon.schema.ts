import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, HydratedDocument } from 'mongoose';

export type CouponType = 'percentage' | 'fixed';

export type CouponDocument = HydratedDocument<Coupon>;

@Schema({ timestamps: true, collection: 'coupons' })
export class Coupon extends Document {
  @Prop({ required: true, uppercase: true, trim: true })
  code!: string;

  @Prop({ required: true, enum: ['percentage', 'fixed'] })
  type!: CouponType;

  // percentage: 0-100 (whole number). fixed: minor units (paise/cents).
  @Prop({ required: true, min: 0 })
  value!: number;

  @Prop({ default: 0 })
  minOrderCents!: number;

  // Caps the discount for percentage coupons (e.g. "20% off, up to ₹500").
  // Ignored for fixed coupons.
  @Prop({ type: Number, default: null })
  maxDiscountCents!: number | null;

  @Prop({ type: Number, default: null })
  usageLimit!: number | null; // null = unlimited

  @Prop({ default: 0 })
  usedCount!: number;

  @Prop({ type: Date, default: null })
  expiresAt!: Date | null;

  @Prop({ default: true })
  isActive!: boolean;
}

export const CouponSchema = SchemaFactory.createForClass(Coupon);
CouponSchema.index({ code: 1 }, { unique: true });
