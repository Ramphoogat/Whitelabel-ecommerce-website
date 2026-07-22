import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, HydratedDocument, Types } from 'mongoose';

export type InventoryItemDocument = HydratedDocument<InventoryItem>;

@Schema({ timestamps: true, collection: 'inventory_items' })
export class InventoryItem extends Document {
  @Prop({ required: true, type: Types.ObjectId, ref: 'ProductVariant' })
  variantId!: Types.ObjectId;

  @Prop({ required: true, default: 0, min: 0 })
  availableQuantity!: number;

  // Held during active checkouts — see InventoryService.reserveStock (§5.1).
  @Prop({ required: true, default: 0, min: 0 })
  reservedQuantity!: number;

  @Prop({ required: true, default: 5 })
  lowStockThreshold!: number;

  // Incremented on every mutation; used for optimistic-lock style guards
  // even though the atomic $inc/find-filter approach below doesn't strictly
  // need it — kept for auditability and future multi-warehouse support.
  @Prop({ required: true, default: 0 })
  version!: number;
}

export const InventoryItemSchema = SchemaFactory.createForClass(InventoryItem);
InventoryItemSchema.index({ variantId: 1 }, { unique: true });
