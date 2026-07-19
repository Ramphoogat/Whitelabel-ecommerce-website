import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, HydratedDocument, Types } from 'mongoose';

export type AuthProvider = 'email' | 'otp' | 'google' | 'apple' | 'facebook';

export type CustomerDocument = HydratedDocument<Customer>;

@Schema({ timestamps: true, collection: 'customers' })
export class Customer extends Document {
  @Prop({ required: true, unique: true, lowercase: true, trim: true })
  email!: string;

  // Null when the customer has only ever authenticated via OTP.
  @Prop({ type: String, default: null })
  passwordHash!: string | null;

  @Prop({ type: String, default: null, index: true })
  phone!: string | null;

  @Prop({ required: true })
  name!: string;

  @Prop({ required: true, enum: ['email', 'otp', 'google', 'apple', 'facebook'], default: 'email' })
  authProvider!: AuthProvider;

  @Prop({ default: true })
  isActive!: boolean;

  @Prop({ type: Date, default: null })
  lastLoginAt!: Date | null;

  // Kept as simple ObjectId arrays on the customer document rather than
  // separate collections — wishlist/compare have no fields of their own
  // (no notes, no timestamps-per-item), so a dedicated schema would just be
  // indirection. Reviews DO need their own collection (moderation status,
  // rating, body) so those live in review.schema.ts.
  @Prop({ type: [Types.ObjectId], ref: 'Product', default: [] })
  wishlist!: Types.ObjectId[];

  @Prop({ type: [Types.ObjectId], ref: 'Product', default: [] })
  compareList!: Types.ObjectId[];
}

export const CustomerSchema = SchemaFactory.createForClass(Customer);
CustomerSchema.index({ email: 1 }, { unique: true });
