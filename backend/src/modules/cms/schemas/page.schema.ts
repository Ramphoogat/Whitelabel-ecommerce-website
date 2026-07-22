import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, HydratedDocument } from 'mongoose';

export type PageDocument = HydratedDocument<Page>;

@Schema({ timestamps: true, collection: 'pages' })
export class Page extends Document {
  @Prop({ required: true })
  title!: string;

  @Prop({ required: true, lowercase: true, trim: true })
  slug!: string;

  @Prop({ required: true })
  contentHtml!: string;

  @Prop({ default: '' })
  metaDescription!: string;

  @Prop({ default: false })
  isPublished!: boolean;
}

export const PageSchema = SchemaFactory.createForClass(Page);
PageSchema.index({ slug: 1 }, { unique: true });
