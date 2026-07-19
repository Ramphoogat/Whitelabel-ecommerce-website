import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, HydratedDocument } from 'mongoose';

export type BannerPosition = 'homepage_hero' | 'homepage_secondary' | 'category_top';

export type BannerDocument = HydratedDocument<Banner>;

@Schema({ timestamps: true, collection: 'banners' })
export class Banner extends Document {
  @Prop({ required: true })
  title!: string;

  @Prop({ required: true })
  imageUrl!: string;

  @Prop({ default: '' })
  linkUrl!: string;

  @Prop({ required: true, enum: ['homepage_hero', 'homepage_secondary', 'category_top'] })
  position!: BannerPosition;

  @Prop({ default: true })
  isActive!: boolean;

  @Prop({ default: 0 })
  displayOrder!: number;

  @Prop({ type: Date, default: null })
  startsAt!: Date | null;

  @Prop({ type: Date, default: null })
  endsAt!: Date | null;
}

export const BannerSchema = SchemaFactory.createForClass(Banner);
BannerSchema.index({ position: 1, displayOrder: 1 });
