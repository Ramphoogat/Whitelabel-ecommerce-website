import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, HydratedDocument } from 'mongoose';

export type BlogPostDocument = HydratedDocument<BlogPost>;

@Schema({ timestamps: true, collection: 'blog_posts' })
export class BlogPost extends Document {
  @Prop({ required: true })
  title!: string;

  @Prop({ required: true, unique: true, lowercase: true, trim: true })
  slug!: string;

  @Prop({ default: '' })
  excerpt!: string;

  @Prop({ required: true })
  contentHtml!: string;

  @Prop({ default: '' })
  coverImageUrl!: string;

  @Prop({ default: false })
  isPublished!: boolean;

  @Prop({ type: Date, default: null })
  publishedAt!: Date | null;
}

export const BlogPostSchema = SchemaFactory.createForClass(BlogPost);
BlogPostSchema.index({ slug: 1 }, { unique: true });
BlogPostSchema.index({ isPublished: 1, publishedAt: -1 });
