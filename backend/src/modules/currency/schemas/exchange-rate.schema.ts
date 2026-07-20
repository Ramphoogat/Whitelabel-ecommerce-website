import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, HydratedDocument } from 'mongoose';

export type ExchangeRateDocument = HydratedDocument<ExchangeRate>;

@Schema({ timestamps: true, collection: 'exchange_rates' })
export class ExchangeRate extends Document {
  /** ISO 4217 base currency code (e.g. "USD") */
  @Prop({ required: true, uppercase: true, trim: true })
  baseCurrency!: string;

  /** ISO 4217 target currency code (e.g. "INR") */
  @Prop({ required: true, uppercase: true, trim: true })
  targetCurrency!: string;

  /** How many units of targetCurrency equal 1 unit of baseCurrency */
  @Prop({ required: true, min: 0 })
  rate!: number;

  @Prop({ default: true })
  isActive!: boolean;

  /** Timestamp of the last rate update (from external source if synced) */
  @Prop({ default: () => new Date() })
  rateUpdatedAt!: Date;
}

export const ExchangeRateSchema = SchemaFactory.createForClass(ExchangeRate);
ExchangeRateSchema.index({ baseCurrency: 1, targetCurrency: 1 }, { unique: true });
