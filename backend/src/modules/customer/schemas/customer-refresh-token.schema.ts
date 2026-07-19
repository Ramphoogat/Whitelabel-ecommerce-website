import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, HydratedDocument, Types } from 'mongoose';

export type CustomerRefreshTokenDocument = HydratedDocument<CustomerRefreshToken>;

/** Same rotation-with-reuse-detection design as identity/schemas/refresh-token.schema.ts, scoped to Customer instead of staff User. */
@Schema({ timestamps: true, collection: 'customer_refresh_tokens' })
export class CustomerRefreshToken extends Document {
  @Prop({ required: true, type: Types.ObjectId, ref: 'Customer', index: true })
  customerId!: Types.ObjectId;

  @Prop({ required: true })
  tokenHash!: string;

  @Prop({ required: true, index: true })
  family!: string;

  @Prop({ default: false })
  revoked!: boolean;

  @Prop({ required: true })
  expiresAt!: Date;
}

export const CustomerRefreshTokenSchema = SchemaFactory.createForClass(CustomerRefreshToken);
CustomerRefreshTokenSchema.index({ expiresAt: 1 }, { expireAfterSeconds: 0 });
