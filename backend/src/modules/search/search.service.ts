import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { Product, ProductDocument } from '../catalog/schemas/product.schema';
import { Category, CategoryDocument } from '../catalog/schemas/category.schema';
import { BlogPost, BlogPostDocument } from '../cms/schemas/blog-post.schema';
import { Page, PageDocument } from '../cms/schemas/page.schema';

export interface SearchResultItem {
  type: 'product' | 'category' | 'blog_post' | 'page';
  id: string;
  title: string;
  slug: string;
  excerpt?: string;
  imageUrl?: string;
  score?: number;
}

export interface SearchResponse {
  query: string;
  total: number;
  results: SearchResultItem[];
  facets: {
    types: { type: string; count: number }[];
  };
}

@Injectable()
export class SearchService {
  constructor(
    @InjectModel(Product.name) private readonly productModel: Model<ProductDocument>,
    @InjectModel(Category.name) private readonly categoryModel: Model<CategoryDocument>,
    @InjectModel(BlogPost.name) private readonly blogModel: Model<BlogPostDocument>,
    @InjectModel(Page.name) private readonly pageModel: Model<PageDocument>,
  ) {}

  async search(
    query: string,
    types: string[] = ['product', 'category', 'blog_post', 'page'],
    limit = 20,
  ): Promise<SearchResponse> {
    if (!query.trim()) {
      return { query, total: 0, results: [], facets: { types: [] } };
    }

    const results: SearchResultItem[] = [];
    const q = query.trim();
    const regex = new RegExp(q.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'), 'i');

    // Products — use text index when available, fall back to regex
    if (types.includes('product')) {
      let productDocs: ProductDocument[];
      try {
        productDocs = await this.productModel
          .find({ $text: { $search: q }, status: 'active' }, { score: { $meta: 'textScore' } })
          .sort({ score: { $meta: 'textScore' } })
          .limit(limit)
          .lean() as unknown as ProductDocument[];
      } catch {
        productDocs = await this.productModel
          .find({ status: 'active', $or: [{ title: regex }, { description: regex }, { brand: regex }] })
          .limit(limit)
          .lean() as unknown as ProductDocument[];
      }

      for (const p of productDocs) {
        results.push({
          type: 'product',
          id: (p._id as any).toString(),
          title: p.title,
          slug: p.slug,
          excerpt: p.description?.slice(0, 120),
          imageUrl: (p.images as string[])?.[0],
        });
      }
    }

    // Categories
    if (types.includes('category')) {
      const cats = await this.categoryModel
        .find({ isActive: true, $or: [{ name: regex }, { description: regex }] })
        .limit(10)
        .lean();
      for (const c of cats) {
        results.push({
          type: 'category',
          id: (c._id as any).toString(),
          title: c.name,
          slug: c.slug,
          imageUrl: c.imageUrl ?? undefined,
        });
      }
    }

    // Blog posts
    if (types.includes('blog_post')) {
      const posts = await this.blogModel
        .find({ status: 'published', $or: [{ title: regex }, { content: regex }] })
        .limit(10)
        .lean();
      for (const b of posts) {
        results.push({
          type: 'blog_post',
          id: (b._id as any).toString(),
          title: b.title,
          slug: b.slug,
          excerpt: ((b as any).contentHtml as string)?.replace(/<[^>]+>/g, '').slice(0, 120),
        });
      }
    }

    // CMS pages
    if (types.includes('page')) {
      const pages = await this.pageModel
        .find({ status: 'published', $or: [{ title: regex }, { content: regex }] })
        .limit(5)
        .lean();
      for (const p of pages) {
        results.push({
          type: 'page',
          id: (p._id as any).toString(),
          title: p.title,
          slug: p.slug,
        });
      }
    }

    // Build type facets
    const typeCounts = new Map<string, number>();
    for (const r of results) typeCounts.set(r.type, (typeCounts.get(r.type) ?? 0) + 1);
    const facetTypes = [...typeCounts.entries()].map(([type, count]) => ({ type, count }));

    const sliced = results.slice(0, limit);
    return {
      query,
      total: results.length,
      results: sliced,
      facets: { types: facetTypes },
    };
  }

  async autocomplete(query: string, limit = 8): Promise<string[]> {
    if (!query.trim() || query.length < 2) return [];
    const regex = new RegExp('^' + query.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'), 'i');

    const products = await this.productModel
      .find({ status: 'active', title: regex })
      .select('title')
      .limit(limit)
      .lean();

    return [...new Set(products.map((p) => p.title))].slice(0, limit);
  }
}
