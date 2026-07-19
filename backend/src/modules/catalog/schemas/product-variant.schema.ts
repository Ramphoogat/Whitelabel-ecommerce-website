import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, HydratedDocument, Types } from 'mongoose';

export type ProductVariantDocument = HydratedDocument<ProductVariant>;

@Schema({ timestamps: true, collection: 'product_variants' })
export class ProductVariant extends Document {
  @Prop({ required: true, type: Types.ObjectId, ref: 'Product', index: true })
  productId!: Types.ObjectId;

  @Prop({ required: true, unique: true, uppercase: true, trim: true })
  sku!: string;

  // Always integer minor units (paise/cents) — never a float rupee/dollar value.
  @Prop({ required: true })
  priceCents!: number;

  @Prop({ type: Number, default: null })
  compareAtPriceCents!: number | null;

  // e.g. { size: "M", color: "Red" } — drives the variant picker UI
  @Prop({ type: Object, default: {} })
  options!: Record<string, string>;

  @Prop({ default: '' })
  imageUrl!: string;

  @Prop({ default: true })
  isActive!: boolean;

  // Weight in grams, for shipping calculations later
  @Prop({ default: 0 })
  weightGrams!: number;
}

export const ProductVariantSchema = SchemaFactory.createForClass(ProductVariant);
ProductVariantSchema.index({ sku: 1 }, { unique: true });
ProductVariantSchema.index({ productId: 1 });
