import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, HydratedDocument, Types } from 'mongoose';

export type ReviewStatus = 'pending' | 'approved' | 'rejected';

export type ReviewDocument = HydratedDocument<Review>;

@Schema({ timestamps: true, collection: 'reviews' })
export class Review extends Document {
  @Prop({ required: true, type: Types.ObjectId, ref: 'Customer', index: true })
  customerId!: Types.ObjectId;

  @Prop({ required: true, type: Types.ObjectId, ref: 'Product', index: true })
  productId!: Types.ObjectId;

  @Prop({ required: true, min: 1, max: 5 })
  rating!: number;

  @Prop({ default: '' })
  title!: string;

  @Prop({ required: true })
  body!: string;

  // New reviews start pending so admin can moderate before they appear on the PDP.
  @Prop({ required: true, enum: ['pending', 'approved', 'rejected'], default: 'pending' })
  status!: ReviewStatus;
}

export const ReviewSchema = SchemaFactory.createForClass(Review);
ReviewSchema.index({ productId: 1, status: 1 });
ReviewSchema.index({ customerId: 1, productId: 1 }, { unique: true });
