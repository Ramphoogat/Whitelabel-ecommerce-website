import { Body, Controller, Delete, Get, Param, Patch, Post, UseGuards } from '@nestjs/common';
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';
import { CmsService } from './cms.service';
import { CreatePageDto } from './dto/create-page.dto';
import { UpdatePageDto } from './dto/update-page.dto';
import { CreateBlogPostDto } from './dto/create-blog-post.dto';
import { UpdateBlogPostDto } from './dto/update-blog-post.dto';
import { CreateFaqDto } from './dto/create-faq.dto';
import { UpdateFaqDto } from './dto/update-faq.dto';
import { JwtStaffGuard } from '../../shared/guards/jwt-staff.guard';
import { RolesGuard } from '../../shared/guards/roles.guard';
import { Roles } from '../../shared/decorators/roles.decorator';

@ApiTags('admin-cms')
@ApiBearerAuth()
@UseGuards(JwtStaffGuard, RolesGuard)
@Roles('owner', 'admin', 'staff')
@Controller('admin/cms')
export class CmsAdminController {
  constructor(private readonly cmsService: CmsService) {}

  @Post('pages')
  createPage(@Body() dto: CreatePageDto) {
    return this.cmsService.createPage(dto);
  }

  @Get('pages')
  listPages() {
    return this.cmsService.listPagesForAdmin();
  }

  @Patch('pages/:id')
  updatePage(@Param('id') id: string, @Body() dto: UpdatePageDto) {
    return this.cmsService.updatePage(id, dto);
  }

  @Delete('pages/:id')
  deletePage(@Param('id') id: string) {
    return this.cmsService.deletePage(id);
  }

  @Post('blog-posts')
  createBlogPost(@Body() dto: CreateBlogPostDto) {
    return this.cmsService.createBlogPost(dto);
  }

  @Get('blog-posts')
  listBlogPosts() {
    return this.cmsService.listBlogPostsForAdmin();
  }

  @Patch('blog-posts/:id')
  updateBlogPost(@Param('id') id: string, @Body() dto: UpdateBlogPostDto) {
    return this.cmsService.updateBlogPost(id, dto);
  }

  @Delete('blog-posts/:id')
  deleteBlogPost(@Param('id') id: string) {
    return this.cmsService.deleteBlogPost(id);
  }

  @Post('faqs')
  createFaq(@Body() dto: CreateFaqDto) {
    return this.cmsService.createFaq(dto);
  }

  @Get('faqs')
  listFaqs() {
    return this.cmsService.listFaqsForAdmin();
  }

  @Patch('faqs/:id')
  updateFaq(@Param('id') id: string, @Body() dto: UpdateFaqDto) {
    return this.cmsService.updateFaq(id, dto);
  }

  @Delete('faqs/:id')
  deleteFaq(@Param('id') id: string) {
    return this.cmsService.deleteFaq(id);
  }
}
