import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, HydratedDocument } from 'mongoose';

export type FaqDocument = HydratedDocument<Faq>;

@Schema({ timestamps: true, collection: 'faqs' })
export class Faq extends Document {
  @Prop({ required: true })
  question!: string;

  @Prop({ required: true })
  answer!: string;

  @Prop({ default: 'general' })
  category!: string;

  @Prop({ default: 0 })
  displayOrder!: number;

  @Prop({ default: true })
  isActive!: boolean;
}

export const FaqSchema = SchemaFactory.createForClass(Faq);
FaqSchema.index({ category: 1, displayOrder: 1 });
