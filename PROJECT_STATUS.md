# Shoplux — Project Status

> Last updated: 2026-07-24
> Stack: NestJS · Next.js 15 App Router · TypeScript · Tailwind CSS · MongoDB · Redis
> Arch: single monorepo, white-label multi-tenant — all per-client differences via ENV + `organization.settings` in MongoDB.

---

## Backend (NestJS + MongoDB + Redis)

### ✅ Complete

#### Identity / Auth (Staff)
- `User` schema with argon2id password hashing, `isActive`, `lastLoginAt`, `allowedSections: string[] | null`
- `POST /auth/register` · `POST /auth/login` · `POST /auth/refresh` · `POST /auth/logout`
- Refresh token rotation with reuse-detection (SHA-256 hash, replay revokes entire family)
- `JwtStaffGuard` + `RolesGuard` — role-based access for `owner / admin / staff`
- `allowedSections` baked into JWT payload and login response for sidebar enforcement

#### Staff Administration
- `GET /admin/staff` — list all staff (passwords excluded)
- `POST /admin/staff` — create staff/admin account
- `PATCH /admin/staff/:id` — change role, active status, or `allowedSections`
- `DELETE /admin/staff/:id` — permanently remove a staff member (owner is immutable)
- All endpoints guarded by `JwtStaffGuard` + `RolesGuard('owner', 'admin')`

#### Customer Module
- `Customer` schema (separate from staff `User`) with `provider` field for social sign-in source
- `CustomerRefreshToken` schema — same rotation/reuse-detection pattern as staff
- `Address` schema (multiple per customer, `isDefault` flag)
- `Review` schema (unique per customer × product, `status: pending | approved | rejected`)
- `POST /auth/customer/register` · `POST /auth/customer/login` · `POST /auth/customer/refresh` · `POST /auth/customer/logout`
- `POST /auth/customer/social` — find-or-create by provider + email; records provider field
- `GET/PATCH /customer/profile` · `GET/POST/PATCH/DELETE /customer/addresses`
- `POST/DELETE /customer/wishlist/:productId` · `POST/DELETE /customer/compare/:productId`
- `POST/GET /customer/reviews`
- `JwtCustomerGuard` — validates `role: 'customer'` so customer tokens never pass staff routes
- `GET /admin/customers` — list all customers (social provider shown)
- `PATCH /admin/customers/:id/status` — block/unblock
- `PATCH /admin/customers/reviews/:id/moderate` — approve/reject reviews
- `GET /admin/customers/:id` — full detail with addresses and last 20 reviews

#### Catalog
- `Product` schema: title, slug, brand, images[], attributes, status (`draft|active|archived`)
- `ProductVariant` schema: SKU, priceCents, comparePriceCents, options, stockQty, isActive
- `Category` schema: name, slug, parentId (nested), imageUrl, displayOrder
- Full CRUD under `/admin/catalog/products` and `/admin/catalog/categories`
- `GET /storefront/products` — public listing with `?search=`, `?categoryId=`, pagination, sort
- `GET /storefront/products/:slug` — public PDP data

#### Order Module
- `Order` schema: orderNumber, items[], totalCents, status pipeline, discountCents, currency
- `CheckoutSession` schema: subtotalCents, discountCents, taxCents, totalCents, couponCode, status, expiresAt
- `GET/PATCH /admin/orders` — list, filter, update status (validated state-machine)
- `GET /admin/orders/:id/invoice` — print-ready HTML invoice
- Full checkout session flow: create, poll, apply/remove coupon, set contact, cancel

#### Cart Module
- `Cart` schema: lines[], guestToken (anonymous carts), expiresAt
- Full `GET/POST/PATCH/DELETE /cart` endpoints

#### Marketing Module
- `Coupon` schema: code, type, value, usageLimit, expiresAt, isActive
- `Banner` schema: title, placement, imageUrl, isActive, scheduledAt, expiresAt
- Full CRUD under `/admin/marketing/coupons` and `/admin/marketing/banners`
- `POST /storefront/coupons/validate` · coupon wired into checkout sessions

#### CMS Module
- `BlogPost`, `CmsPage`, `FAQ` schemas with full CRUD under `/admin/cms/*`
- Public routes: `GET /storefront/pages/:slug` · `GET /storefront/blog-posts`

#### Analytics
- `GET /admin/analytics/dashboard` — revenue, order count, AOV, low-stock aggregations

#### Payment Module
- `PaymentGateway` schema with AES-256 encrypted credentials; Stripe + Razorpay adapters
- `WebhookEvent` schema; `POST /webhooks/:provider` inbound handler
- `GET/POST/PATCH /admin/payments/gateways`

#### Shipping, Tax, Currency
- `ShippingZone` + `ShippingMethod` — full CRUD, `/admin/shipping/*`
- `TaxRate` schema — CRUD + `POST /admin/tax/calculate`; wired into checkout `taxCents`
- `ExchangeRate` schema — upsert by currency pair; inverse triangulation; public convert endpoint

#### Notification Module
- Email (SendGrid + SMTP) and SMS (Twilio + MSG91) via BullMQ queues
- Handlebars templates; 3-attempt exponential back-off retry; notification logs

#### Organization / Theme
- `OrganizationSettings` singleton: full theme token set for both storefront and admin surfaces
- Extended theme schema: `navStyle`, `cardLayout`, `footerStyle`, `homeSections[]`, `productSlider`, `backToTop`, `smoothScroll`
- Font keys include: `cormorant`, `playfair`, `fraunces`, `dm-sans`, `space-mono`
- `GET /storefront/store-config` — public brand config (storefront theme only)
- `GET/PATCH /admin/organization/settings` · `PATCH /admin/organization/theme` · `PATCH /admin/organization/admin-theme`

#### Infrastructure
- BullMQ: `checkout-expiry`, `coupon-expiry`, `stock-reconcile` queues with repeatable jobs
- S3-compatible storage; image resize pipeline (full / md / thumb WebP via sharp)
- Full-text search + autocomplete across products, CMS, blog
- Audit log for all staff actions
- `npm run seed` — idempotent demo data (org, owner, 8 products, 5 categories, coupons, banners, tax rates)
- `npm run seed:payment-modes` — Stripe/Razorpay config seed
- `AuthResponseDto` extended with `allowedSections` field

#### Tests
- **40 unit tests, 7 suites, 0 failures** (tax, currency, media, inventory, coupon, pdf, search)
- **40+ E2E tests** against real MongoDB + Redis via Docker (`docker-compose.test.yml`)

---

## Frontend (Next.js 15 + TypeScript + Tailwind)

### ✅ Complete

#### Design System
- CSS custom property token system: 10 named palette tokens, 3 font stacks, 3 radius tokens, section spacing token
- Light + dark variants; admin-scoped dark mode via `AdminThemeScope`
- Premium fonts: Cormorant Garamond, Playfair Display, Fraunces, DM Sans, Space Mono (via next/font/google)
- Glass, glow, rise animation primitives

#### Storefront
- Homepage with section builder: hero, new arrivals (grid or scroll-snap slider), featured categories, blog, back-to-top
- Product listing with search, filters, pagination
- PDP with variant picker, image gallery, add-to-cart
- Cart drawer (Zustand) + full cart page
- Multi-step checkout
- Customer login / register / account pages
- Social sign-in (Google, Apple, Facebook) — records provider in admin Customers table
- CMS page route (`/pages/[slug]`) — reads published CMS pages
- Three footer variants: columns (auto-generates Pages section from CMS), centered, minimal
- Sidebar nav drawer with hamburger toggle; closes on Escape / route change
- Back button on all auth pages (→ landing page)

#### Admin Dashboard
- **Staff page** `/admin/staff` — stats row, full table with role/status/last-sign-in, add/disable/re-enable/remove; per-member access modal
- **Access modal** — "Full access" toggle + grouped section checkboxes (Overview / Operations / Content / Finance & Data / Admin); All / None shortcuts; accent highlight on selected
- **Sidebar access enforcement** — staff-role users see restricted sections as dimmed, non-clickable `<span>` elements; owner/admin always see everything
- **Wallet page** `/admin/wallet` — balance stats, filtered transaction ledger, live exchange rate ticker (left-to-right auto-scroll, pauses on hover), payout accounts, withdrawal modal, withdrawal history
- **Exchange rate ticker** — merges live configured rates with market fallback pairs; duplicated ribbon for seamless infinite scroll
- **Pagination** — `usePagination<T>` hook + `<Pagination>` component; 10 rows/page; auto-hides when not needed; applied to every admin table
- **Orders** — inline expand row: customer card (name, email, phone, address) + visual step-tracker (Placed → Awaiting Payment → Processing → Shipped → Delivered)
- **Theme Studio** — dual-surface live preview, sticky 460px right rail (bottom-sheet on narrow viewports), device toggle (desktop 1280 / mobile 390)
- **Presets** — all presets in branded card format (mini storefront preview); 8 premium presets + standard presets; quick-accent row removed
- **Storefront layout section** — 2-column grid: nav style, card layout, footer style, product slider, back-to-top, smooth scroll + full-width home section builder and motion toggle
- **Home section builder** — reorder with ▲/▼, hide, restore hidden sections
- **Premium presets**: Noir Atelier, Ivory & Gold, Emerald Estate, Sapphire Maison, Bordeaux, Onyx Rosé, Café Crème, Terra Atelier
- All other admin pages (products, orders, inventory, customers, marketing, CMS, shipping, payments, tax, currency, analytics, settings) — complete with real API + mock fallback, loading skeletons, toast feedback

#### Marketing Landing
- `/` — animated hero, logo bar, how-it-works, features, storefront carousel, testimonials, pricing, footer
- `/platform`, `/pricing`, `/themes`, `/docs` — fully built sub-pages

---

## Deferred / Future

| Area | Notes |
|---|---|
| Checkout → real backend wiring | Cart lines need `variantId`; requires cart model refactor |
| Real OAuth for social sign-in | Currently a manual email+name form; real provider SDKs (Google OAuth popup, Apple Sign In) are a future integration |
| CMS pages from backend API | Storefront `/pages/[slug]` reads mock data; needs `GET /storefront/pages` endpoint |
| Mobile responsive audit | Basic responsive grid in place; real-device testing needed |
| Accessibility audit | Key ARIA labels added; full focus-trap modals deferred |
| Dark-mode storefront toggle | Per-user toggle deferred; `darkModeDefault` merchant setting exists |
