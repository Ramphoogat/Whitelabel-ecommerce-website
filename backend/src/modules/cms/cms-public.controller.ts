import { Controller, Get, Param } from '@nestjs/common';
import { ApiTags } from '@nestjs/swagger';
import { CmsService } from './cms.service';
import { Public } from '../../shared/decorators/public.decorator';

@ApiTags('storefront-cms')
@Public()
@Controller('storefront/cms')
export class CmsPublicController {
  constructor(private readonly cmsService: CmsService) {}

  @Get('pages/:slug')
  getPage(@Param('slug') slug: string) {
    return this.cmsService.getPublishedPageBySlug(slug);
  }

  @Get('blog-posts')
  listBlogPosts() {
    return this.cmsService.listPublishedBlogPosts();
  }

  @Get('blog-posts/:slug')
  getBlogPost(@Param('slug') slug: string) {
    return this.cmsService.getPublishedBlogPostBySlug(slug);
  }

  @Get('faqs')
  listFaqs() {
    return this.cmsService.listActiveFaqs();
  }
}
