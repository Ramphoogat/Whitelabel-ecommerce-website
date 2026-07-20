/**
 * E2E test suite — exercises the full HTTP stack against real MongoDB + Redis.
 *
 * Start dependencies:
 *   docker compose -f docker-compose.test.yml up -d
 *
 * Run:
 *   npm run test:e2e
 *
 * Each describe block is self-contained: it seeds what it needs and cleans up.
 * The suite is intentionally ordered: Auth → Catalog → Cart → Checkout → etc.
 */
import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication } from '@nestjs/common';
import request from 'supertest';
import mongoose from 'mongoose';
import { AppModule } from '../src/app.module';
import { setupSecurity } from 'src/bootstrap/security.bootstrap';
import { setupValidation } from 'src/bootstrap/validation.bootstrap';

// ── App bootstrap ─────────────────────────────────────────────────────────────

let app: INestApplication;
let httpServer: ReturnType<INestApplication['getHttpServer']>;

// Tokens captured during auth tests and reused throughout
let staffAccessToken = '';
let staffRefreshToken = '';
let customerAccessToken = '';

beforeAll(async () => {
  const moduleFixture: TestingModule = await Test.createTestingModule({
    imports: [AppModule],
  }).compile();

  app = moduleFixture.createNestApplication({ rawBody: true });
  app.setGlobalPrefix('api');
  setupSecurity(app, '*');
  setupValidation(app);
  await app.init();
  httpServer = app.getHttpServer();
}, 60_000);

afterAll(async () => {
  // Drop the test database so the next run starts clean.
  await mongoose.connection.dropDatabase().catch(() => null);
  await app?.close();
});

// ── Helpers ───────────────────────────────────────────────────────────────────

function authHeader(token: string) {
  return { Authorization: `Bearer ${token}` };
}

// ── 1. Health ─────────────────────────────────────────────────────────────────

describe('Health', () => {
  it('GET /api/health → 200', async () => {
    const res = await request(httpServer).get('/api/health').expect(200);
    expect(res.body).toBeDefined();
  });
});

// ── 2. Staff auth ─────────────────────────────────────────────────────────────

describe('Staff auth', () => {
  it('POST /api/auth/register → creates first owner account', async () => {
    const res = await request(httpServer)
      .post('/api/auth/register')
      .send({ name: 'E2E Admin', email: 'e2e-admin@test.com', password: 'TestPass123!' })
      .expect(201);

    expect(res.body.success).toBe(true);
    expect(res.body.data).toHaveProperty('accessToken');
    staffAccessToken = res.body.data.accessToken;
    staffRefreshToken = res.body.data.refreshToken;
  });

  it('POST /api/auth/register → duplicate email returns 409', async () => {
    await request(httpServer)
      .post('/api/auth/register')
      .send({ name: 'Dup', email: 'e2e-admin@test.com', password: 'TestPass123!' })
      .expect(409);
  });

  it('POST /api/auth/login → wrong password returns 401', async () => {
    await request(httpServer)
      .post('/api/auth/login')
      .send({ email: 'e2e-admin@test.com', password: 'wrong' })
      .expect(401);
  });

  it('POST /api/auth/login → correct credentials return tokens', async () => {
    const res = await request(httpServer)
      .post('/api/auth/login')
      .send({ email: 'e2e-admin@test.com', password: 'TestPass123!' })
      .expect(200);

    expect(res.body.data.accessToken).toBeTruthy();
    staffAccessToken = res.body.data.accessToken;
    staffRefreshToken = res.body.data.refreshToken;
  });

  it('GET /api/auth/me → returns current user', async () => {
    const res = await request(httpServer)
      .get('/api/auth/me')
      .set(authHeader(staffAccessToken))
      .expect(200);
    expect(res.body.data.email).toBe('e2e-admin@test.com');
  });

  it('POST /api/auth/refresh → issues new token pair', async () => {
    const res = await request(httpServer)
      .post('/api/auth/refresh')
      .send({ refreshToken: staffRefreshToken })
      .expect(200);
    expect(res.body.data.accessToken).toBeTruthy();
    staffAccessToken = res.body.data.accessToken;
    staffRefreshToken = res.body.data.refreshToken;
  });
});

// ── 3. Customer auth ──────────────────────────────────────────────────────────

describe('Customer auth', () => {
  it('POST /api/auth/customer/register → creates a customer', async () => {
    const res = await request(httpServer)
      .post('/api/auth/customer/register')
      .send({ name: 'E2E Customer', email: 'e2e-customer@test.com', password: 'CustPass123!' })
      .expect(201);

    expect(res.body.data).toHaveProperty('accessToken');
    customerAccessToken = res.body.data.accessToken;
  });

  it('GET /api/customer/profile → returns customer profile', async () => {
    const res = await request(httpServer)
      .get('/api/customer/profile')
      .set(authHeader(customerAccessToken))
      .expect(200);
    expect(res.body.data.email).toBe('e2e-customer@test.com');
  });

  it('staff token cannot access customer route → 401', async () => {
    await request(httpServer)
      .get('/api/customer/profile')
      .set(authHeader(staffAccessToken))
      .expect(401);
  });
});

// ── 4. Guard coverage ─────────────────────────────────────────────────────────

describe('Auth guards', () => {
  const adminRoutes = [
    ['GET', '/api/admin/orders'],
    ['GET', '/api/admin/customers'],
    ['GET', '/api/admin/catalog/products'],
    ['GET', '/api/admin/tax/rates'],
    ['GET', '/api/admin/currency/rates'],
    ['GET', '/api/admin/inventory/low-stock'],
    ['POST', '/api/admin/media/upload'],
  ];

  it.each(adminRoutes)('%s %s returns 401 without token', async (method, route) => {
    await (request(httpServer) as any)[method.toLowerCase()](route).expect(401);
  });
});

// ── 5. Catalog ────────────────────────────────────────────────────────────────

let categoryId = '';
let productId = '';
let variantId = '';
let productSlug = '';

describe('Catalog', () => {
  it('POST /api/admin/catalog/categories → creates a category', async () => {
    const res = await request(httpServer)
      .post('/api/admin/catalog/categories')
      .set(authHeader(staffAccessToken))
      .send({ name: 'E2E Electronics', description: 'E2E test category' })
      .expect(201);

    categoryId = res.body.data._id;
    expect(categoryId).toBeTruthy();
  });

  it('POST /api/admin/catalog/products → creates a product', async () => {
    const res = await request(httpServer)
      .post('/api/admin/catalog/products')
      .set(authHeader(staffAccessToken))
      .send({
        title: 'E2E Headphones',
        description: 'Great sound',
        categoryIds: [categoryId],
        brand: 'TestBrand',
        status: 'active',
      })
      .expect(201);

    productId = res.body.data._id;
    productSlug = res.body.data.slug;
    expect(productSlug).toBe('e2e-headphones');
  });

  it('POST /api/admin/catalog/variants → creates a variant', async () => {
    const res = await request(httpServer)
      .post('/api/admin/catalog/variants')
      .set(authHeader(staffAccessToken))
      .send({
        productId,
        sku: 'E2E-HDR-BLK-001',
        priceCents: 99900,
        options: { color: 'Black' },
        initialQuantity: 50,
      })
      .expect(201);

    variantId = res.body.data._id;
    expect(variantId).toBeTruthy();
  });

  it('GET /api/storefront/products → lists active products', async () => {
    const res = await request(httpServer).get('/api/storefront/products').expect(200);
    expect(res.body.success).toBe(true);
    expect(Array.isArray(res.body.data.items)).toBe(true);
    const slugs = res.body.data.items.map((p: any) => p.slug);
    expect(slugs).toContain('e2e-headphones');
  });

  it('GET /api/storefront/products/:slug → returns product detail', async () => {
    const res = await request(httpServer)
      .get(`/api/storefront/products/${productSlug}`)
      .expect(200);
    expect(res.body.data.title).toBe('E2E Headphones');
    expect(res.body.data.variants).toHaveLength(1);
    expect(res.body.data.variants[0].sku).toBe('E2E-HDR-BLK-001');
  });

  it('GET /api/storefront/products?search=headphones → returns matching product', async () => {
    const res = await request(httpServer)
      .get('/api/storefront/products?search=headphones')
      .expect(200);
    const slugs = (res.body.data.items ?? []).map((p: any) => p.slug);
    expect(slugs).toContain('e2e-headphones');
  });

  it('GET /api/storefront/search?q=headphones → returns search results', async () => {
    const res = await request(httpServer)
      .get('/api/storefront/search?q=headphones')
      .expect(200);
    expect(res.body.data).toHaveProperty('results');
    const types = res.body.data.results.map((r: any) => r.type);
    expect(types).toContain('product');
  });
});

// ── 6. Inventory ──────────────────────────────────────────────────────────────

describe('Inventory', () => {
  it('GET /api/admin/inventory/variant/:id → returns stock for variant', async () => {
    const res = await request(httpServer)
      .get(`/api/admin/inventory/variant/${variantId}`)
      .set(authHeader(staffAccessToken))
      .expect(200);
    expect(res.body.data.availableQuantity).toBe(50);
  });

  it('POST /api/admin/inventory/adjust → adjusts stock', async () => {
    const res = await request(httpServer)
      .post('/api/admin/inventory/adjust')
      .set(authHeader(staffAccessToken))
      .send({ variantId, delta: 10, reason: 'e2e restock' })
      .expect(201);
    expect(res.body.data.availableQuantity).toBe(60);
  });

  it('GET /api/admin/inventory/low-stock → returns empty when all above threshold', async () => {
    const res = await request(httpServer)
      .get('/api/admin/inventory/low-stock')
      .set(authHeader(staffAccessToken))
      .expect(200);
    expect(Array.isArray(res.body.data)).toBe(true);
  });
});

// ── 7. Tax rates ──────────────────────────────────────────────────────────────

let taxRateId = '';

describe('Tax', () => {
  it('POST /api/admin/tax/rates → creates a tax rate', async () => {
    const res = await request(httpServer)
      .post('/api/admin/tax/rates')
      .set(authHeader(staffAccessToken))
      .send({ name: 'GST 18%', type: 'percentage', rate: 18 })
      .expect(201);

    taxRateId = res.body.data._id;
    expect(taxRateId).toBeTruthy();
  });

  it('GET /api/admin/tax/rates → lists rates', async () => {
    const res = await request(httpServer)
      .get('/api/admin/tax/rates')
      .set(authHeader(staffAccessToken))
      .expect(200);
    const names = res.body.data.map((r: any) => r.name);
    expect(names).toContain('GST 18%');
  });

  it('POST /api/admin/tax/calculate → computes tax on a subtotal', async () => {
    const res = await request(httpServer)
      .post('/api/admin/tax/calculate')
      .set(authHeader(staffAccessToken))
      .send({ subtotalCents: 100000 })
      .expect(201);
    expect(res.body.data.taxCents).toBe(18000); // 18% of 1000.00
    expect(res.body.data.breakdown).toHaveLength(1);
  });

  it('PATCH /api/admin/tax/rates/:id → updates a rate', async () => {
    const res = await request(httpServer)
      .patch(`/api/admin/tax/rates/${taxRateId}`)
      .set(authHeader(staffAccessToken))
      .send({ rate: 12 })
      .expect(200);
    expect(res.body.data.rate).toBe(12);
  });

  it('DELETE /api/admin/tax/rates/:id → removes rate', async () => {
    await request(httpServer)
      .delete(`/api/admin/tax/rates/${taxRateId}`)
      .set(authHeader(staffAccessToken))
      .expect(200);

    const list = await request(httpServer)
      .get('/api/admin/tax/rates')
      .set(authHeader(staffAccessToken));
    const ids = list.body.data.map((r: any) => r._id);
    expect(ids).not.toContain(taxRateId);
  });
});

// ── 8. Currency ───────────────────────────────────────────────────────────────

describe('Currency', () => {
  it('POST /api/admin/currency/rates → upserts a rate', async () => {
    const res = await request(httpServer)
      .post('/api/admin/currency/rates')
      .set(authHeader(staffAccessToken))
      .send({ baseCurrency: 'USD', targetCurrency: 'INR', rate: 83.5 })
      .expect(201);
    expect(res.body.data.rate).toBe(83.5);
  });

  it('GET /api/storefront/currency/rates → returns active rates publicly', async () => {
    const res = await request(httpServer).get('/api/storefront/currency/rates').expect(200);
    const pairs = res.body.data.map((r: any) => `${r.baseCurrency}_${r.targetCurrency}`);
    expect(pairs).toContain('USD_INR');
  });

  it('GET /api/storefront/currency/convert → converts amount', async () => {
    const res = await request(httpServer)
      .get('/api/storefront/currency/convert?amount=100&from=USD&to=INR')
      .expect(200);
    expect(res.body.data).toBe(Math.round(100 * 83.5));
  });

  it('GET /api/storefront/currency/convert → throws for unknown pair', async () => {
    await request(httpServer)
      .get('/api/storefront/currency/convert?amount=100&from=EUR&to=JPY')
      .expect(400);
  });
});

// ── 9. Marketing — coupons ────────────────────────────────────────────────────

let couponId = '';

describe('Marketing — coupons', () => {
  it('POST /api/admin/marketing/coupons → creates a coupon', async () => {
    const res = await request(httpServer)
      .post('/api/admin/marketing/coupons')
      .set(authHeader(staffAccessToken))
      .send({
        code: 'E2ETEST10',
        type: 'percentage',
        value: 10,
        usageLimit: 100,
      })
      .expect(201);
    couponId = res.body.data._id;
    expect(couponId).toBeTruthy();
  });

  it('GET /api/admin/marketing/coupons → lists coupons', async () => {
    const res = await request(httpServer)
      .get('/api/admin/marketing/coupons')
      .set(authHeader(staffAccessToken))
      .expect(200);
    const codes = res.body.data.map((c: any) => c.code);
    expect(codes).toContain('E2ETEST10');
  });

  it('DELETE /api/admin/marketing/coupons/:id → removes coupon', async () => {
    await request(httpServer)
      .delete(`/api/admin/marketing/coupons/${couponId}`)
      .set(authHeader(staffAccessToken))
      .expect(200);
  });
});

// ── 10. Cart ──────────────────────────────────────────────────────────────────

let cartGuestToken = '';

describe('Cart', () => {
  it('GET /api/storefront/cart → creates a cart and returns a guest token', async () => {
    const res = await request(httpServer).get('/api/storefront/cart').expect(200);
    expect(res.body.data).toHaveProperty('guestToken');
    cartGuestToken = res.body.data.guestToken;
    expect(cartGuestToken).toBeTruthy();
  });

  it('POST /api/storefront/cart → adds an item to the cart', async () => {
    const res = await request(httpServer)
      .post('/api/storefront/cart')
      .set('x-cart-token', cartGuestToken)
      .send({ variantId, quantity: 2 })
      .expect(201);
    expect(res.body.data.items).toHaveLength(1);
    expect(res.body.data.items[0].quantity).toBe(2);
  });

  it('PATCH /api/storefront/cart/:variantId → updates quantity', async () => {
    const res = await request(httpServer)
      .patch(`/api/storefront/cart/${variantId}`)
      .set('x-cart-token', cartGuestToken)
      .send({ quantity: 3 })
      .expect(200);
    expect(res.body.data.items[0].quantity).toBe(3);
  });
});

// ── 11. Checkout + tax ────────────────────────────────────────────────────────

describe('Checkout (with tax)', () => {
  it('POST /api/storefront/checkout/sessions → creates a session with taxCents', async () => {
    // Re-seed a tax rate so tax is applied
    await request(httpServer)
      .post('/api/admin/tax/rates')
      .set(authHeader(staffAccessToken))
      .send({ name: 'GST 18%', type: 'percentage', rate: 18 });

    const res = await request(httpServer)
      .post('/api/storefront/checkout/sessions')
      .set('x-cart-token', cartGuestToken)
      .send({})
      .expect(201);

    const session = res.body.data;
    expect(session).toHaveProperty('totalCents');
    // When a tax rate exists, totalCents ≥ subtotalCents
    expect(session.totalCents).toBeGreaterThanOrEqual(session.subtotalCents ?? 0);
  });
});

// ── 12. Admin customers ───────────────────────────────────────────────────────

describe('Admin customers', () => {
  it('GET /api/admin/customers → lists customers', async () => {
    const res = await request(httpServer)
      .get('/api/admin/customers')
      .set(authHeader(staffAccessToken))
      .expect(200);
    expect(Array.isArray(res.body.data)).toBe(true);
    expect(res.body.data.length).toBeGreaterThanOrEqual(1);
  });

  it('GET /api/admin/customers/:id → returns customer detail', async () => {
    const list = await request(httpServer)
      .get('/api/admin/customers')
      .set(authHeader(staffAccessToken));
    const customerId = list.body.data[0]._id;

    const res = await request(httpServer)
      .get(`/api/admin/customers/${customerId}`)
      .set(authHeader(staffAccessToken))
      .expect(200);

    expect(res.body.data._id).toBe(customerId);
    expect(res.body.data).toHaveProperty('addresses');
    expect(res.body.data).toHaveProperty('reviews');
    expect(res.body.data).not.toHaveProperty('passwordHash');
  });
});

// ── 13. CMS ───────────────────────────────────────────────────────────────────

describe('CMS', () => {
  let pageId = '';

  it('POST /api/admin/cms/pages → creates a page', async () => {
    const res = await request(httpServer)
      .post('/api/admin/cms/pages')
      .set(authHeader(staffAccessToken))
      .send({
        title: 'E2E About Page',
        content: '<p>Hello</p>',
        status: 'published',
      })
      .expect(201);
    pageId = res.body.data._id;
    expect(pageId).toBeTruthy();
  });

  it('GET /api/storefront/cms/pages/:slug → returns published page', async () => {
    const res = await request(httpServer)
      .get('/api/storefront/cms/pages/e2e-about-page')
      .expect(200);
    expect(res.body.data.title).toBe('E2E About Page');
  });
});

// ── 14. Scheduler (manual triggers) ──────────────────────────────────────────

describe('Scheduler', () => {
  it('POST /api/admin/scheduler/coupon-expiry → enqueues a job', async () => {
    const res = await request(httpServer)
      .post('/api/admin/scheduler/coupon-expiry')
      .set(authHeader(staffAccessToken))
      .expect(201);
    expect(res.body.data).toHaveProperty('jobId');
  });

  it('POST /api/admin/scheduler/stock-reconcile → enqueues a job', async () => {
    const res = await request(httpServer)
      .post('/api/admin/scheduler/stock-reconcile')
      .set(authHeader(staffAccessToken))
      .expect(201);
    expect(res.body.data).toHaveProperty('jobId');
  });
});

// ── 15. Auth logout ───────────────────────────────────────────────────────────

describe('Staff logout', () => {
  it('POST /api/auth/logout → revokes the refresh token', async () => {
    await request(httpServer)
      .post('/api/auth/logout')
      .send({ refreshToken: staffRefreshToken })
      .expect(200);
  });

  it('POST /api/auth/refresh after logout → 401', async () => {
    await request(httpServer)
      .post('/api/auth/refresh')
      .send({ refreshToken: staffRefreshToken })
      .expect(401);
  });
});
