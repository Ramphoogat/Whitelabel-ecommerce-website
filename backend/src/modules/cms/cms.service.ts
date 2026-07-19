import { ConflictException, Injectable, NotFoundException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { Page, PageDocument } from './schemas/page.schema';
import { BlogPost, BlogPostDocument } from './schemas/blog-post.schema';
import { Faq, FaqDocument } from './schemas/faq.schema';
import { CreatePageDto } from './dto/create-page.dto';
import { UpdatePageDto } from './dto/update-page.dto';
import { CreateBlogPostDto } from './dto/create-blog-post.dto';
import { UpdateBlogPostDto } from './dto/update-blog-post.dto';
import { CreateFaqDto } from './dto/create-faq.dto';
import { UpdateFaqDto } from './dto/update-faq.dto';
import { slugify } from '../../shared/utils/pagination.util';

@Injectable()
export class CmsService {
  constructor(
    @InjectModel(Page.name) private readonly pageModel: Model<PageDocument>,
    @InjectModel(BlogPost.name) private readonly blogPostModel: Model<BlogPostDocument>,
    @InjectModel(Faq.name) private readonly faqModel: Model<FaqDocument>,
  ) {}

  async createPage(dto: CreatePageDto) {
    const slug = dto.slug ? slugify(dto.slug) : slugify(dto.title);
    const existing = await this.pageModel.findOne({ slug });
    if (existing) throw new ConflictException(`Page slug "${slug}" already exists`);
    return this.pageModel.create({ ...dto, slug });
  }

  async listPagesForAdmin() {
    return this.pageModel.find().sort({ title: 1 }).lean();
  }

  async updatePage(id: string, dto: UpdatePageDto) {
    const update: Record<string, unknown> = { ...dto };
    if (dto.slug) update.slug = slugify(dto.slug);
    const page = await this.pageModel.findByIdAndUpdate(id, update, { new: true });
    if (!page) throw new NotFoundException('Page not found');
    return page;
  }

  async deletePage(id: string) {
    const page = await this.pageModel.findByIdAndDelete(id);
    if (!page) throw new NotFoundException('Page not found');
    return { success: true };
  }

  async getPublishedPageBySlug(slug: string) {
    const page = await this.pageModel.findOne({ slug, isPublished: true }).lean();
    if (!page) throw new NotFoundException('Page not found');
    return page;
  }

  async createBlogPost(dto: CreateBlogPostDto) {
    const slug = dto.slug ? slugify(dto.slug) : slugify(dto.title);
    const existing = await this.blogPostModel.findOne({ slug });
    if (existing) throw new ConflictException(`Blog post slug "${slug}" already exists`);
    return this.blogPostModel.create({
      ...dto,
      slug,
      publishedAt: dto.isPublished ? new Date() : null,
    });
  }

  async listBlogPostsForAdmin() {
    return this.blogPostModel.find().sort({ createdAt: -1 }).lean();
  }

  async updateBlogPost(id: string, dto: UpdateBlogPostDto) {
    const update: Record<string, unknown> = { ...dto };
    if (dto.slug) update.slug = slugify(dto.slug);

    const existing = await this.blogPostModel.findById(id);
    if (!existing) throw new NotFoundException('Blog post not found');

    if (dto.isPublished && !existing.isPublished) {
      update.publishedAt = new Date();
    }

    return this.blogPostModel.findByIdAndUpdate(id, update, { new: true });
  }

  async deleteBlogPost(id: string) {
    const post = await this.blogPostModel.findByIdAndDelete(id);
    if (!post) throw new NotFoundException('Blog post not found');
    return { success: true };
  }

  async listPublishedBlogPosts() {
    return this.blogPostModel
      .find({ isPublished: true })
      .sort({ publishedAt: -1 })
      .select('-contentHtml')
      .lean();
  }

  async getPublishedBlogPostBySlug(slug: string) {
    const post = await this.blogPostModel.findOne({ slug, isPublished: true }).lean();
    if (!post) throw new NotFoundException('Blog post not found');
    return post;
  }

  async createFaq(dto: CreateFaqDto) {
    return this.faqModel.create(dto);
  }

  async listFaqsForAdmin() {
    return this.faqModel.find().sort({ category: 1, displayOrder: 1 }).lean();
  }

  async updateFaq(id: string, dto: UpdateFaqDto) {
    const faq = await this.faqModel.findByIdAndUpdate(id, dto, { new: true });
    if (!faq) throw new NotFoundException('FAQ not found');
    return faq;
  }

  async deleteFaq(id: string) {
    const faq = await this.faqModel.findByIdAndDelete(id);
    if (!faq) throw new NotFoundException('FAQ not found');
    return { success: true };
  }

  async listActiveFaqs() {
    return this.faqModel.find({ isActive: true }).sort({ category: 1, displayOrder: 1 }).lean();
  }
}
