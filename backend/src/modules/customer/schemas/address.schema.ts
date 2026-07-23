import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, HydratedDocument, Types } from 'mongoose';

export type AddressDocument = HydratedDocument<Address>;

@Schema({ timestamps: true, collection: 'addresses' })
export class Address extends Document {
  @Prop({ required: true, type: Types.ObjectId, ref: 'Customer' })
  customerId!: Types.ObjectId;

  @Prop({ required: true })
  fullName!: string;

  @Prop({ required: true })
  phone!: string;

  @Prop({ required: true })
  line1!: string;

  @Prop({ default: '' })
  line2!: string;

  @Prop({ required: true })
  city!: string;

  @Prop({ required: true })
  state!: string;

  @Prop({ required: true })
  postalCode!: string;

  @Prop({ required: true, default: 'IN' })
  country!: string;

  @Prop({ default: false })
  isDefault!: boolean;
}

export const AddressSchema = SchemaFactory.createForClass(Address);
AddressSchema.index({ customerId: 1 });
