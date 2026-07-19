import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, HydratedDocument, Types } from 'mongoose';

export type ProductStatus = 'draft' | 'active' | 'archived';
export type ProductDocument = HydratedDocument<Product>;

@Schema({ timestamps: true, collection: 'products' })
export class Product extends Document {
  @Prop({ required: true })
  title!: string;

  @Prop({ required: true, unique: true, lowercase: true, trim: true })
  slug!: string;

  @Prop({ default: '' })
  description!: string;

  @Prop({ type: [Types.ObjectId], ref: 'Category', default: [] })
  categoryIds!: Types.ObjectId[];

  @Prop({ default: '' })
  brand!: string;

  @Prop({ type: [String], default: [] })
  images!: string[];

  @Prop({ required: true, enum: ['draft', 'active', 'archived'], default: 'draft' })
  status!: ProductStatus;

  // Free-form attributes for theme-specific fields (e.g. fabric, material,
  // shelf life) so different business types don't need schema changes.
  @Prop({ type: Object, default: {} })
  attributes!: Record<string, unknown>;
}

export const ProductSchema = SchemaFactory.createForClass(Product);
ProductSchema.index({ slug: 1 }, { unique: true });
ProductSchema.index({ categoryIds: 1 });
ProductSchema.index({ status: 1 });
ProductSchema.index({ title: 'text', description: 'text' });
