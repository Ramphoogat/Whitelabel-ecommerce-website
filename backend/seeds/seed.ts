/**
 * Demo data seeder — run with:
 *   npm run seed
 *
 * Idempotent: checks for existing data before inserting, so it's safe to run
 * multiple times.  Clears only the seeded collections (org, categories,
 * products, variants, inventory, orders) — never touches staff/customer accounts.
 */
import 'reflect-metadata';
import mongoose from 'mongoose';
import * as argon2 from 'argon2';

const MONGO_URI = process.env.MONGO_URI || 'mongodb://localhost:27017/store_dev';

// ── Minimal inline schemas (no NestJS DI — just raw Mongoose) ────────────────

const CategorySchema = new mongoose.Schema(
  {
    name: String,
    slug: String,
    description: String,
    parentId: { type: mongoose.Schema.Types.ObjectId, default: null },
    imageUrl: String,
    isActive: { type: Boolean, default: true },
    displayOrder: { type: Number, default: 0 },
  },
  { collection: 'categories', timestamps: true },
);

const ProductSchema = new mongoose.Schema(
  {
    title: String,
    slug: String,
    description: String,
    categoryIds: [mongoose.Schema.Types.ObjectId],
    brand: String,
    images: [String],
    status: { type: String, default: 'active' },
    attributes: mongoose.Schema.Types.Mixed,
  },
  { collection: 'products', timestamps: true },
);

const VariantSchema = new mongoose.Schema(
  {
    productId: mongoose.Schema.Types.ObjectId,
    sku: String,
    priceCents: Number,
    compareAtPriceCents: { type: Number, default: null },
    options: mongoose.Schema.Types.Mixed,
    imageUrl: { type: String, default: null },
    isActive: { type: Boolean, default: true },
    weightGrams: { type: Number, default: null },
  },
  { collection: 'product_variants', timestamps: true },
);

const InventoryItemSchema = new mongoose.Schema(
  {
    variantId: mongoose.Schema.Types.ObjectId,
    sku: String,
    quantityOnHand: { type: Number, default: 0 },
    quantityReserved: { type: Number, default: 0 },
    lowStockThreshold: { type: Number, default: 5 },
  },
  { collection: 'inventory_items', timestamps: true },
);

const OrgSchema = new mongoose.Schema(
  {
    name: String,
    domain: String,
    businessType: String,
    settings: mongoose.Schema.Types.Mixed,
  },
  { collection: 'organizations', timestamps: true },
);

const UserSchema = new mongoose.Schema(
  {
    email: String,
    passwordHash: String,
    name: String,
    role: String,
    isActive: { type: Boolean, default: true },
  },
  { collection: 'users', timestamps: true },
);

const CouponSchema = new mongoose.Schema(
  {
    code: String,
    type: String,
    value: Number,
    usageLimit: Number,
    usageCount: { type: Number, default: 0 },
    expiresAt: Date,
    isActive: { type: Boolean, default: true },
    description: String,
  },
  { collection: 'coupons', timestamps: true },
);

const BannerSchema = new mongoose.Schema(
  {
    title: String,
    placement: String,
    imageUrl: String,
    linkUrl: { type: String, default: null },
    isActive: { type: Boolean, default: true },
    scheduledAt: { type: Date, default: null },
    expiresAt: { type: Date, default: null },
  },
  { collection: 'banners', timestamps: true },
);

const TaxRateSchema = new mongoose.Schema(
  {
    name: String,
    type: String,
    rate: Number,
    countryCode: { type: String, default: null },
    stateCode: { type: String, default: null },
    categorySlug: { type: String, default: null },
    priority: { type: Number, default: 0 },
    isActive: { type: Boolean, default: true },
    description: { type: String, default: null },
  },
  { collection: 'tax_rates', timestamps: true },
);

// ── Seed data ─────────────────────────────────────────────────────────────────

const CATEGORIES = [
  { name: 'Electronics', slug: 'electronics', description: 'Gadgets, devices, and accessories', displayOrder: 1 },
  { name: 'Clothing', slug: 'clothing', description: 'Apparel for all occasions', displayOrder: 2 },
  { name: 'Home & Living', slug: 'home-living', description: 'Furniture, decor, and essentials', displayOrder: 3 },
  { name: 'Sports & Outdoors', slug: 'sports-outdoors', description: 'Equipment for active lifestyles', displayOrder: 4 },
  { name: 'Beauty & Personal Care', slug: 'beauty', description: 'Skincare, haircare, and wellness', displayOrder: 5 },
];

const PRODUCTS = [
  {
    title: 'Wireless Noise-Cancelling Headphones',
    slug: 'wireless-noise-cancelling-headphones',
    description:
      'Premium over-ear headphones with active noise cancellation, 30-hour battery life, and studio-quality audio reproduction.',
    brand: 'SoundCore',
    category: 'electronics',
    images: [
      'https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=800',
      'https://images.unsplash.com/photo-1484704849700-f032a568e944?w=800',
    ],
    attributes: { connectivity: 'Bluetooth 5.3', driver: '40mm', impedance: '32Ω' },
    variants: [
      { sku: 'HDPH-BLK-001', options: { color: 'Midnight Black' }, priceCents: 899900, compareAtPriceCents: 1199900, stock: 45 },
      { sku: 'HDPH-WHT-001', options: { color: 'Arctic White' }, priceCents: 899900, compareAtPriceCents: 1199900, stock: 32 },
      { sku: 'HDPH-BLU-001', options: { color: 'Ocean Blue' }, priceCents: 949900, compareAtPriceCents: 1199900, stock: 18 },
    ],
  },
  {
    title: 'Slim Fit Premium Oxford Shirt',
    slug: 'slim-fit-premium-oxford-shirt',
    description:
      'Classic Oxford weave shirt in a modern slim fit. 100% combed cotton, pre-washed for softness, non-iron finish.',
    brand: 'Forma',
    category: 'clothing',
    images: [
      'https://images.unsplash.com/photo-1607345366928-199ea26cfe3e?w=800',
      'https://images.unsplash.com/photo-1598033129183-c4f50c736f10?w=800',
    ],
    attributes: { material: '100% Cotton', fit: 'Slim', care: 'Machine wash cold' },
    variants: [
      { sku: 'SHRT-WHT-S', options: { color: 'White', size: 'S' }, priceCents: 249900, stock: 20 },
      { sku: 'SHRT-WHT-M', options: { color: 'White', size: 'M' }, priceCents: 249900, stock: 30 },
      { sku: 'SHRT-WHT-L', options: { color: 'White', size: 'L' }, priceCents: 249900, stock: 25 },
      { sku: 'SHRT-BLU-M', options: { color: 'Light Blue', size: 'M' }, priceCents: 249900, stock: 22 },
      { sku: 'SHRT-BLU-L', options: { color: 'Light Blue', size: 'L' }, priceCents: 249900, stock: 15 },
    ],
  },
  {
    title: 'Scandinavian Minimalist Desk Lamp',
    slug: 'scandinavian-minimalist-desk-lamp',
    description:
      'Clean-lined adjustable desk lamp with stepless brightness and color temperature control. USB-C charging port in the base.',
    brand: 'Luma',
    category: 'home-living',
    images: [
      'https://images.unsplash.com/photo-1507473885765-e6ed057f782c?w=800',
      'https://images.unsplash.com/photo-1543512214-318c7553f230?w=800',
    ],
    attributes: { power: '12W LED', colorTemp: '2700K–6500K', dimming: 'Touch stepless' },
    variants: [
      { sku: 'LAMP-WHT-001', options: { color: 'Matte White' }, priceCents: 349900, compareAtPriceCents: 449900, stock: 30 },
      { sku: 'LAMP-BLK-001', options: { color: 'Matte Black' }, priceCents: 349900, compareAtPriceCents: 449900, stock: 28 },
    ],
  },
  {
    title: 'Trail Running Shoes',
    slug: 'trail-running-shoes',
    description:
      'Lightweight trail shoes with Vibram® outsole, waterproof membrane, and responsive foam midsole for all-day comfort on technical terrain.',
    brand: 'Apex Trail',
    category: 'sports-outdoors',
    images: [
      'https://images.unsplash.com/photo-1542291026-7eec264c27ff?w=800',
      'https://images.unsplash.com/photo-1606107557195-0e29a4b5b4aa?w=800',
    ],
    attributes: { drop: '8mm', lug: '4mm', waterproof: 'Yes' },
    variants: [
      { sku: 'SHOE-GRN-7', options: { color: 'Forest Green', size: '7' }, priceCents: 799900, stock: 8 },
      { sku: 'SHOE-GRN-8', options: { color: 'Forest Green', size: '8' }, priceCents: 799900, stock: 12 },
      { sku: 'SHOE-GRN-9', options: { color: 'Forest Green', size: '9' }, priceCents: 799900, stock: 15 },
      { sku: 'SHOE-GRN-10', options: { color: 'Forest Green', size: '10' }, priceCents: 799900, stock: 10 },
      { sku: 'SHOE-ORG-8', options: { color: 'Burnt Orange', size: '8' }, priceCents: 799900, stock: 6 },
      { sku: 'SHOE-ORG-9', options: { color: 'Burnt Orange', size: '9' }, priceCents: 799900, stock: 4 },
    ],
  },
  {
    title: 'Vitamin C Brightening Serum',
    slug: 'vitamin-c-brightening-serum',
    description:
      '15% L-Ascorbic Acid serum with Vitamin E and Ferulic Acid. Reduces dark spots, firms skin, and protects against free radicals.',
    brand: 'Dermis Lab',
    category: 'beauty',
    images: [
      'https://images.unsplash.com/photo-1620916566398-39f1143ab7be?w=800',
      'https://images.unsplash.com/photo-1571875257727-256c39da42af?w=800',
    ],
    attributes: { concentration: '15% L-AA', size: '30ml', skinType: 'All skin types' },
    variants: [
      { sku: 'SERUM-30ML', options: { size: '30ml' }, priceCents: 299900, compareAtPriceCents: 399900, stock: 60 },
      { sku: 'SERUM-60ML', options: { size: '60ml' }, priceCents: 499900, compareAtPriceCents: 699900, stock: 40 },
    ],
  },
  {
    title: 'Mechanical Keyboard — Compact 75%',
    slug: 'mechanical-keyboard-compact-75',
    description:
      'Hot-swappable 75% layout mechanical keyboard with per-key RGB, gasket mount, and your choice of switch. Aluminium top case.',
    brand: 'KeyForge',
    category: 'electronics',
    images: [
      'https://images.unsplash.com/photo-1618384887929-16ec33fab9ef?w=800',
      'https://images.unsplash.com/photo-1541140532154-b024d705b90a?w=800',
    ],
    attributes: { layout: '75%', mount: 'Gasket', keycaps: 'PBT double-shot' },
    variants: [
      { sku: 'KB-BLK-LIN', options: { color: 'Black', switch: 'Linear' }, priceCents: 1499900, stock: 20 },
      { sku: 'KB-BLK-TAC', options: { color: 'Black', switch: 'Tactile' }, priceCents: 1499900, stock: 18 },
      { sku: 'KB-SLV-LIN', options: { color: 'Silver', switch: 'Linear' }, priceCents: 1599900, stock: 12 },
    ],
  },
  {
    title: 'Yoga Mat — 6mm Non-Slip',
    slug: 'yoga-mat-6mm-non-slip',
    description:
      'Eco-friendly TPE yoga mat, 6mm thick for joint cushioning. Dual-layer non-slip texture, alignment markings, and carry strap.',
    brand: 'ZenFlow',
    category: 'sports-outdoors',
    images: [
      'https://images.unsplash.com/photo-1544367567-0f2fcb009e0b?w=800',
      'https://images.unsplash.com/photo-1601925260368-ae2f83cf8b7f?w=800',
    ],
    attributes: { thickness: '6mm', material: 'TPE', dimensions: '183cm × 61cm' },
    variants: [
      { sku: 'YOGA-PRP', options: { color: 'Lavender' }, priceCents: 149900, stock: 50 },
      { sku: 'YOGA-GRN', options: { color: 'Sage Green' }, priceCents: 149900, stock: 45 },
      { sku: 'YOGA-BLK', options: { color: 'Charcoal' }, priceCents: 149900, stock: 40 },
    ],
  },
  {
    title: 'Ceramic Pour-Over Coffee Dripper',
    slug: 'ceramic-pour-over-coffee-dripper',
    description:
      'Hand-thrown ceramic V60-style dripper with heat-retention body, precise spiral ribs, and compatibility with standard #2 filters.',
    brand: 'Morning Ritual',
    category: 'home-living',
    images: [
      'https://images.unsplash.com/photo-1495474472287-4d71bcdd2085?w=800',
      'https://images.unsplash.com/photo-1509042239860-f550ce710b93?w=800',
    ],
    attributes: { capacity: '600ml', material: 'Stoneware ceramic', filter: 'Size #2' },
    variants: [
      { sku: 'DRIP-WHT', options: { color: 'Matte White' }, priceCents: 199900, stock: 35 },
      { sku: 'DRIP-TAN', options: { color: 'Warm Tan' }, priceCents: 199900, stock: 28 },
    ],
  },
];

const COUPONS = [
  { code: 'WELCOME10', type: 'percentage', value: 10, usageLimit: 1000, description: 'First order 10% off' },
  { code: 'SAVE500', type: 'flat', value: 50000, usageLimit: 200, description: 'Flat ₹500 off orders above ₹2000' },
  { code: 'SUMMER25', type: 'percentage', value: 25, usageLimit: 500, description: 'Summer sale 25% off' },
];

const BANNERS = [
  {
    title: 'Summer Collection — Up to 40% Off',
    placement: 'homepage_hero',
    imageUrl: 'https://images.unsplash.com/photo-1483181957632-8bda974cbc91?w=1600',
    linkUrl: '/products',
  },
  {
    title: 'New Arrivals: Electronics',
    placement: 'homepage_secondary',
    imageUrl: 'https://images.unsplash.com/photo-1519389950473-47ba0277781c?w=1200',
    linkUrl: '/products?categoryId=electronics',
  },
];

// ── Main ──────────────────────────────────────────────────────────────────────

async function main() {
  console.log('🌱  Connecting to MongoDB…');
  await mongoose.connect(MONGO_URI);
  console.log('✅  Connected.\n');

  const Category = mongoose.model('Category', CategorySchema);
  const Product = mongoose.model('Product', ProductSchema);
  const Variant = mongoose.model('ProductVariant', VariantSchema);
  const InventoryItem = mongoose.model('InventoryItem', InventoryItemSchema);
  const Org = mongoose.model('Organization', OrgSchema);
  const User = mongoose.model('User', UserSchema);
  const Coupon = mongoose.model('Coupon', CouponSchema);
  const Banner = mongoose.model('Banner', BannerSchema);
  const TaxRate = mongoose.model('TaxRate', TaxRateSchema);

  // ── Organization ────────────────────────────────────────────────────────────
  const orgCount = await Org.countDocuments();
  if (orgCount === 0) {
    await Org.create({
      name: 'Demo Store',
      domain: 'localhost',
      businessType: 'retail',
      settings: {
        theme: { accentColor: '#4b9ec4', logoUrl: null },
        currency: 'INR',
        timezone: 'Asia/Kolkata',
        supportEmail: 'support@demostore.com',
      },
    });
    console.log('✅  Organization created.');
  } else {
    console.log('⏭️   Organization already exists — skipping.');
  }

  // ── Staff owner account ──────────────────────────────────────────────────────
  const userCount = await User.countDocuments();
  if (userCount === 0) {
    const passwordHash = await argon2.hash('Admin1234!', { type: argon2.argon2id });
    await User.create({
      email: 'admin@demostore.com',
      passwordHash,
      name: 'Demo Admin',
      role: 'owner',
    });
    console.log('✅  Staff owner created  →  admin@demostore.com / Admin1234!');
  } else {
    console.log('⏭️   Staff users already exist — skipping.');
  }

  // ── Categories ───────────────────────────────────────────────────────────────
  const existingCategories = await Category.find().lean();
  const categoryBySlug = new Map(existingCategories.map((c) => [c.slug, c._id]));

  for (const cat of CATEGORIES) {
    if (!categoryBySlug.has(cat.slug)) {
      const created = await Category.create(cat);
      categoryBySlug.set(cat.slug, created._id);
      console.log(`✅  Category: ${cat.name}`);
    } else {
      console.log(`⏭️   Category "${cat.name}" already exists — skipping.`);
    }
  }

  // ── Products + Variants + Inventory ─────────────────────────────────────────
  for (const p of PRODUCTS) {
    const existing = await Product.findOne({ slug: p.slug }).lean();
    if (existing) {
      console.log(`⏭️   Product "${p.title}" already exists — skipping.`);
      continue;
    }

    const catId = categoryBySlug.get(p.category);
    const product = await Product.create({
      title: p.title,
      slug: p.slug,
      description: p.description,
      brand: p.brand,
      categoryIds: catId ? [catId] : [],
      images: p.images,
      status: 'active',
      attributes: p.attributes,
    });

    for (const v of p.variants) {
      const variant = await Variant.create({
        productId: product._id,
        sku: v.sku,
        priceCents: v.priceCents,
        compareAtPriceCents: (v as any).compareAtPriceCents ?? null,
        options: v.options,
        isActive: true,
      });

      await InventoryItem.create({
        variantId: variant._id,
        sku: v.sku,
        quantityOnHand: v.stock,
        quantityReserved: 0,
        lowStockThreshold: 5,
      });
    }

    console.log(`✅  Product: ${p.title} (${p.variants.length} variants)`);
  }

  // ── Coupons ──────────────────────────────────────────────────────────────────
  for (const c of COUPONS) {
    const existing = await Coupon.findOne({ code: c.code });
    if (!existing) {
      await Coupon.create({
        ...c,
        expiresAt: new Date(Date.now() + 365 * 24 * 60 * 60 * 1000),
      });
      console.log(`✅  Coupon: ${c.code}`);
    } else {
      console.log(`⏭️   Coupon "${c.code}" already exists — skipping.`);
    }
  }

  // ── Banners ──────────────────────────────────────────────────────────────────
  for (const b of BANNERS) {
    const existing = await Banner.findOne({ title: b.title });
    if (!existing) {
      await Banner.create(b);
      console.log(`✅  Banner: ${b.title}`);
    } else {
      console.log(`⏭️   Banner "${b.title}" already exists — skipping.`);
    }
  }

  // ── Tax rates ────────────────────────────────────────────────────────────────
  const taxCount = await TaxRate.countDocuments();
  if (taxCount === 0) {
    await TaxRate.create([
      { name: 'GST Standard', type: 'percentage', rate: 18, priority: 10, description: 'Standard GST rate (India)' },
      { name: 'GST Electronics', type: 'percentage', rate: 12, categorySlug: 'electronics', priority: 20, description: 'Reduced GST for electronics' },
    ]);
    console.log('✅  Tax rates seeded.');
  } else {
    console.log('⏭️   Tax rates already exist — skipping.');
  }

  console.log('\n🎉  Seed complete!\n');
  await mongoose.disconnect();
}

main().catch((err) => {
  console.error('❌  Seed failed:', err);
  process.exit(1);
});
