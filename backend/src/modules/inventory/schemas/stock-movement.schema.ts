import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, HydratedDocument, Types } from 'mongoose';

export type StockMovementType =
  | 'restock'
  | 'reserve'
  | 'release'
  | 'fulfill'
  | 'manual_adjustment';

export type StockMovementDocument = HydratedDocument<StockMovement>;

@Schema({ timestamps: true, collection: 'stock_movements' })
export class StockMovement extends Document {
  @Prop({ required: true, type: Types.ObjectId, ref: 'ProductVariant', index: true })
  variantId!: Types.ObjectId;

  @Prop({ required: true, enum: ['restock', 'reserve', 'release', 'fulfill', 'manual_adjustment'] })
  type!: StockMovementType;

  // Positive = stock added back to available, negative = stock removed
  @Prop({ required: true })
  quantityDelta!: number;

  @Prop({ default: '' })
  reference!: string; // e.g. order id or checkout session id

  @Prop({ default: '' })
  note!: string;
}

export const StockMovementSchema = SchemaFactory.createForClass(StockMovement);
