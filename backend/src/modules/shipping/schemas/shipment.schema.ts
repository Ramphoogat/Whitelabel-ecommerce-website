import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, HydratedDocument, Types } from 'mongoose';
import { ShipmentTrackingStatus } from '../../../providers/shipping/shipping.interface';

export type ShipmentDocument = HydratedDocument<Shipment>;

@Schema({ timestamps: true, collection: 'shipments' })
export class Shipment extends Document {
  @Prop({ required: true, type: Types.ObjectId, ref: 'Order' })
  orderId!: Types.ObjectId;

  @Prop({ required: true })
  carrier!: string;

  @Prop({ required: true })
  carrierShipmentId!: string;

  @Prop({ default: '' })
  trackingNumber!: string;

  @Prop({ default: '' })
  trackingUrl!: string;

  @Prop({
    required: true,
    enum: ['label_created', 'picked_up', 'in_transit', 'out_for_delivery', 'delivered', 'failed', 'rto'],
    default: 'label_created',
  })
  status!: ShipmentTrackingStatus;

  @Prop({ type: [Object], default: [] })
  checkpoints!: { status: string; location: string; timestamp: string }[];
}

export const ShipmentSchema = SchemaFactory.createForClass(Shipment);
ShipmentSchema.index({ orderId: 1 }, { unique: true });
