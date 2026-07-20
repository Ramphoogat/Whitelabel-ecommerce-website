import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { Product, ProductSchema } from '../catalog/schemas/product.schema';
import { Category, CategorySchema } from '../catalog/schemas/category.schema';
import { BlogPost, BlogPostSchema } from '../cms/schemas/blog-post.schema';
import { Page, PageSchema } from '../cms/schemas/page.schema';
import { SearchService } from './search.service';
import { SearchPublicController } from './search-public.controller';

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: Product.name, schema: ProductSchema },
      { name: Category.name, schema: CategorySchema },
      { name: BlogPost.name, schema: BlogPostSchema },
      { name: Page.name, schema: PageSchema },
    ]),
  ],
  controllers: [SearchPublicController],
  providers: [SearchService],
  exports: [SearchService],
})
export class SearchModule {}
