import { ConflictException, Injectable, NotFoundException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { FilterQuery, Model, Types } from 'mongoose';
import { Category, CategoryDocument } from './schemas/category.schema';
import { Product, ProductDocument } from './schemas/product.schema';
import { ProductVariant, ProductVariantDocument } from './schemas/product-variant.schema';
import { CreateCategoryDto } from './dto/create-category.dto';
import { UpdateCategoryDto } from './dto/update-category.dto';
import { CreateProductDto } from './dto/create-product.dto';
import { UpdateProductDto } from './dto/update-product.dto';
import { CreateVariantDto } from './dto/create-variant.dto';
import { UpdateVariantDto } from './dto/update-variant.dto';
import { ProductQueryDto } from './dto/product-query.dto';
import { slugify, buildPaginatedResponse } from '../../shared/utils/pagination.util';
import { InventoryService } from '../inventory/inventory.service';

@Injectable()
export class CatalogService {
  constructor(
    @InjectModel(Category.name) private readonly categoryModel: Model<CategoryDocument>,
    @InjectModel(Product.name) private readonly productModel: Model<ProductDocument>,
    @InjectModel(ProductVariant.name)
    private readonly variantModel: Model<ProductVariantDocument>,
    private readonly inventoryService: InventoryService,
  ) {}

  // ---------- Categories ----------

  async createCategory(dto: CreateCategoryDto) {
    const slug = dto.slug ? slugify(dto.slug) : slugify(dto.name);
    const existing = await this.categoryModel.findOne({ slug });
    if (existing) throw new ConflictException(`Category slug "${slug}" already exists`);

    return this.categoryModel.create({ ...dto, slug });
  }

  async listCategories() {
    return this.categoryModel.find().sort({ displayOrder: 1, name: 1 }).lean();
  }

  async updateCategory(id: string, dto: UpdateCategoryDto) {
    const update: Record<string, unknown> = { ...dto };
    if (dto.slug) update.slug = slugify(dto.slug);

    const category = await this.categoryModel.findByIdAndUpdate(id, update, { new: true });
    if (!category) throw new NotFoundException('Category not found');
    return category;
  }

  async deleteCategory(id: string) {
    const category = await this.categoryModel.findByIdAndDelete(id);
    if (!category) throw new NotFoundException('Category not found');
    return { success: true };
  }

  // ---------- Products ----------

  async createProduct(dto: CreateProductDto) {
    const slug = dto.slug ? slugify(dto.slug) : slugify(dto.title);
    const existing = await this.productModel.findOne({ slug });
    if (existing) throw new ConflictException(`Product slug "${slug}" already exists`);

    return this.productModel.create({ ...dto, slug, status: dto.status || 'draft' });
  }

  async listProductsForAdmin(): Promise<Record<string, unknown>[]> {
    const products = await this.productModel.find().sort({ createdAt: -1 }).lean();
    const variants = await this.variantModel
      .find({ productId: { $in: products.map((p) => p._id) } })
      .lean();

    const variantsByProduct = new Map<string, typeof variants>();
    for (const variant of variants) {
      const key = variant.productId.toString();
      const list = variantsByProduct.get(key) ?? [];
      list.push(variant);
      variantsByProduct.set(key, list);
    }

    return products.map((product) => ({
      ...product,
      variants: variantsByProduct.get(product._id.toString()) ?? [],
    }));
  }

  async getProductForAdmin(id: string): Promise<Record<string, unknown>> {
    const product = await this.productModel.findById(id).lean();
    if (!product) throw new NotFoundException('Product not found');
    const variants = await this.variantModel.find({ productId: id }).lean();
    return { ...product, variants };
  }

  async updateProduct(id: string, dto: UpdateProductDto) {
    const update: Record<string, unknown> = { ...dto };
    if (dto.slug) update.slug = slugify(dto.slug);

    const product = await this.productModel.findByIdAndUpdate(id, update, { new: true });
    if (!product) throw new NotFoundException('Product not found');
    return product;
  }

  async deleteProduct(id: string) {
    const product = await this.productModel.findByIdAndDelete(id);
    if (!product) throw new NotFoundException('Product not found');
    await this.variantModel.deleteMany({ productId: id });
    return { success: true };
  }

  // ---------- Variants ----------

  async createVariant(dto: CreateVariantDto) {
    const product = await this.productModel.findById(dto.productId);
    if (!product) throw new NotFoundException('Product not found');

    const existingSku = await this.variantModel.findOne({ sku: dto.sku.toUpperCase() });
    if (existingSku) throw new ConflictException(`SKU "${dto.sku}" already exists`);

    const variant = await this.variantModel.create({
      productId: new Types.ObjectId(dto.productId),
      sku: dto.sku,
      priceCents: dto.priceCents,
      compareAtPriceCents: dto.compareAtPriceCents ?? null,
      options: dto.options ?? {},
      imageUrl: dto.imageUrl ?? '',
      isActive: dto.isActive ?? true,
      weightGrams: dto.weightGrams ?? 0,
    });

    // Every variant needs a matching InventoryItem before it's sellable —
    // create it now with the requested starting stock (defaults to 0).
    await this.inventoryService.createInventoryItem(
      (variant._id as Types.ObjectId).toString(),
      dto.initialQuantity ?? 0,
    );

    return variant;
  }

  async updateVariant(id: string, dto: UpdateVariantDto) {
    const variant = await this.variantModel.findByIdAndUpdate(id, dto, { new: true });
    if (!variant) throw new NotFoundException('Variant not found');
    return variant;
  }

  async deleteVariant(id: string) {
    const variant = await this.variantModel.findByIdAndDelete(id);
    if (!variant) throw new NotFoundException('Variant not found');
    await this.inventoryService.deleteInventoryItemForVariant(id);
    return { success: true };
  }

  // ---------- Storefront reads ----------

  async listPublicProducts(query: ProductQueryDto): Promise<
    ReturnType<typeof buildPaginatedResponse<Record<string, unknown>>>
  > {
    const filter: FilterQuery<ProductDocument> = { status: 'active' };
    if (query.categoryId) filter.categoryIds = new Types.ObjectId(query.categoryId);
    if (query.search) filter.$text = { $search: query.search };

    const sortMap: Record<string, Record<string, 1 | -1>> = {
      newest: { createdAt: -1 },
      price_asc: { createdAt: -1 }, // price sort needs the variant join below
      price_desc: { createdAt: -1 },
    };

    const skip = (query.page - 1) * query.limit;
    const [products, total] = await Promise.all([
      this.productModel
        .find(filter)
        .sort(sortMap[query.sort])
        .skip(skip)
        .limit(query.limit)
        .lean(),
      this.productModel.countDocuments(filter),
    ]);

    // Attach the cheapest active variant as the "from" price shown on listing cards.
    const productIds = products.map((p) => p._id);
    const variants = await this.variantModel
      .find({ productId: { $in: productIds }, isActive: true })
      .sort({ priceCents: 1 })
      .lean();

    const cheapestPriceByProduct = new Map<string, number>();
    for (const variant of variants) {
      const key = variant.productId.toString();
      if (!cheapestPriceByProduct.has(key)) cheapestPriceByProduct.set(key, variant.priceCents);
    }

    let items: Record<string, unknown>[] = products.map((product) => ({
      ...product,
      fromPriceCents: cheapestPriceByProduct.get((product._id as Types.ObjectId).toString()) ?? null,
    }));

    if (query.sort === 'price_asc') {
      items = items.sort(
        (a, b) => ((a.fromPriceCents as number) ?? 0) - ((b.fromPriceCents as number) ?? 0),
      );
    } else if (query.sort === 'price_desc') {
      items = items.sort(
        (a, b) => ((b.fromPriceCents as number) ?? 0) - ((a.fromPriceCents as number) ?? 0),
      );
    }

    return buildPaginatedResponse(items, total, query.page, query.limit);
  }

  async getPublicProductBySlug(slug: string): Promise<Record<string, unknown>> {
    const product = await this.productModel.findOne({ slug, status: 'active' }).lean();
    if (!product) throw new NotFoundException('Product not found');

    const variants = await this.variantModel
      .find({ productId: product._id, isActive: true })
      .lean();

    return { ...product, variants };
  }
}
