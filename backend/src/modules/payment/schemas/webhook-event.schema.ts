import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, HydratedDocument } from 'mongoose';

export type WebhookEventDocument = HydratedDocument<WebhookEvent>;

@Schema({ timestamps: true, collection: 'webhook_events' })
export class WebhookEvent extends Document {
  @Prop({ required: true })
  provider!: string;

  @Prop({ required: true, unique: true })
  providerEventId!: string;

  @Prop({ type: Object, required: true })
  payload!: Record<string, unknown>;

  @Prop({ default: null })
  processedAt!: Date | null;

  @Prop({ default: null })
  processingError!: string | null;
}

export const WebhookEventSchema = SchemaFactory.createForClass(WebhookEvent);
WebhookEventSchema.index({ providerEventId: 1 }, { unique: true });
