import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, HydratedDocument } from 'mongoose';

export type TaxRateDocument = HydratedDocument<TaxRate>;

@Schema({ timestamps: true, collection: 'tax_rates' })
export class TaxRate extends Document {
  @Prop({ required: true })
  name!: string;

  /** 'percentage' applies rate as % of subtotal; 'fixed' is a flat cent amount */
  @Prop({ required: true, enum: ['percentage', 'fixed'], default: 'percentage' })
  type!: 'percentage' | 'fixed';

  /** For percentage: 0–100. For fixed: amount in minor currency units. */
  @Prop({ required: true, min: 0 })
  rate!: number;

  /** ISO 3166-1 alpha-2. Null means applies to all countries. */
  @Prop({ type: String, default: null })
  countryCode!: string | null;

  /** State/province code. Null means applies to all states in the country. */
  @Prop({ type: String, default: null })
  stateCode!: string | null;

  /** Category slug this rate applies to. Null means applies to all products. */
  @Prop({ type: String, default: null })
  categorySlug!: string | null;

  /** Higher priority rules are evaluated first and can short-circuit. */
  @Prop({ default: 0 })
  priority!: number;

  @Prop({ default: true })
  isActive!: boolean;

  @Prop({ type: String, default: null })
  description!: string | null;
}

export const TaxRateSchema = SchemaFactory.createForClass(TaxRate);
TaxRateSchema.index({ countryCode: 1, stateCode: 1, isActive: 1 });
TaxRateSchema.index({ priority: -1 });
