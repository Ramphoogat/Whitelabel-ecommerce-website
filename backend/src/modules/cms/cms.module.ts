import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { Page, PageSchema } from './schemas/page.schema';
import { BlogPost, BlogPostSchema } from './schemas/blog-post.schema';
import { Faq, FaqSchema } from './schemas/faq.schema';
import { CmsService } from './cms.service';
import { CmsAdminController } from './cms-admin.controller';
import { CmsPublicController } from './cms-public.controller';

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: Page.name, schema: PageSchema },
      { name: BlogPost.name, schema: BlogPostSchema },
      { name: Faq.name, schema: FaqSchema },
    ]),
  ],
  controllers: [CmsAdminController, CmsPublicController],
  providers: [CmsService],
  exports: [CmsService],
})
export class CmsModule {}
