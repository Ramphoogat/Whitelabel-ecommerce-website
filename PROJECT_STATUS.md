# White-Label E-Commerce Platform — Project Status

> Last updated: 2026-07-22  
> Stack: NestJS (backend) · Next.js 16 App Router + TypeScript + Tailwind (frontend)  
> Arch: one codebase, isolated per-client deployment — all differences via ENV + `organization.settings` in MongoDB.

---

## Backend (NestJS + MongoDB + Redis)

### ✅ Done

#### Identity / Auth (Staff)
- `User` schema with argon2id password hashing
- `POST /auth/register` · `POST /auth/login` · `POST /auth/refresh`
- `POST /auth/logout` — revokes refresh token (and its rotation family)
- Refresh token rotation with reuse-detection (SHA-256 hash stored, replay revokes entire family)
- `JwtAuthGuard` + `RolesGuard` — role-based access for `owner / admin / staff`
- `JwtAdminGuard` (alias for staff-only routes)

#### Customer Module
- `Customer` schema (separate from staff `User`) with `lastLoginAt`, `loyaltyPoints`, `wishlist`, `compareList`
- `CustomerRefreshToken` schema — same rotation/reuse-detection pattern as staff
- `Address` schema (multiple addresses per customer, `isDefault` flag)
- `Review` schema (unique per customer × product, `status: pending | approved | rejected`)
- `POST /auth/customer/register` · `POST /auth/customer/login` · `POST /auth/customer/refresh`
- `GET/PATCH /customer/profile` · `POST /auth/customer/logout`
- `GET/POST/PATCH/DELETE /customer/addresses`
- `POST/DELETE /customer/wishlist/:productId`
- `POST/DELETE /customer/compare/:productId`
- `POST /customer/reviews` · `GET /customer/reviews` · `GET /customer/reviews/:id`
- `JwtCustomerGuard` — validates `role: 'customer'` claim so customer tokens can never pass staff routes
- `GET /admin/customers` — list all customers (staff-only)
- `PATCH /admin/customers/:id/status` — block/unblock customer account
- `PATCH /admin/customers/reviews/:id/moderate` — approve/reject reviews

#### Catalog
- `Product` schema: title, slug (auto-generated), brand, images[], attributes, status (`draft|active|archived`)
- `ProductVariant` schema: SKU, priceCents, comparePriceCents, options (color/size/etc.), stockQty, isActive
- `Category` schema: name, slug, parentId (nested categories), imageUrl, displayOrder
- `POST/PATCH/DELETE /admin/catalog/products` (staff-only)
- `GET /admin/catalog/products` — list all products with their variants
- `GET /admin/catalog/products/:id` — single product + variants
- `GET /storefront/products` — active products only (public) with `?search=` full-text, `?categoryId=`, pagination, sort
- `GET /storefront/products/:slug` — PDP data (public)
- Full category CRUD under `/admin/catalog/categories`

#### Order Module
- `Order` schema: orderNumber, items[], totalCents, status pipeline, discountCents, currency
- `CheckoutSession` schema: subtotalCents, discountCents, taxCents, totalCents, couponCode, status, expiresAt
- `GET /admin/orders` · `GET /admin/orders/:id` (staff-only)
- `PATCH /admin/orders/:id/status` — validated state-machine transitions
- `GET /admin/orders/:id/invoice` — print-ready HTML invoice (no external PDF lib)
- `POST /storefront/checkout/sessions` — begin checkout, reserves stock atomically (15-min TTL)
- `GET /storefront/checkout/sessions/:id` — poll session status
- `POST /storefront/checkout/sessions/:id/coupon` — apply coupon (before gateway selection)
- `DELETE /storefront/checkout/sessions/:id/coupon` — remove coupon
- `POST /storefront/checkout/sessions/:id/contact` — set order confirmation email/phone
- `POST /storefront/checkout/sessions/:id/cancel` — cancel + release stock

#### Cart Module
- `Cart` schema: lines[], guestToken (for anonymous carts), expiresAt
- `GET/POST/PATCH/DELETE /cart` endpoints

#### Marketing Module
- `Coupon` schema: code, type (percentage/flat), value, usageLimit, usageCount, expiresAt, isActive
- `Banner` schema: title, placement, imageUrl, isActive, scheduledAt, expiresAt
- `GET/POST/PATCH/DELETE /admin/marketing/coupons`
- `GET/POST/PATCH/DELETE /admin/marketing/banners`
- `POST /storefront/coupons/validate` (validate coupon)
- Coupon wired into checkout: `applyCoupon` / `removeCoupon` on checkout sessions

#### CMS Module
- `BlogPost` schema: title, slug, content (rich), status, publishedAt, tags[], author
- `CmsPage` schema: title, slug, content, status, seoTitle, seoDescription
- `FAQ` schema
- Full CRUD for all three under `/admin/cms/*`
- Public storefront read routes: `GET /storefront/pages/:slug` · `GET /storefront/blog-posts`

#### Analytics Module
- `GET /admin/analytics/dashboard` — revenue, order count, AOV, low-stock SKUs aggregations

#### Payment Module
- `PaymentGateway` schema: provider, mode (UPI/Card/COD/Netbanking), credentials (encrypted), isActive
- `WebhookEvent` schema: provider, eventType, payload, processedAt, processingError
- `GET/POST/PATCH /admin/payments/gateways`
- `POST /webhooks/:provider` (inbound webhook handler)
- Stripe + Razorpay gateway providers

#### Shipping Module
- `ShippingZone` schema: name, countries[], rates[]
- `ShippingMethod` schema: carrier, estimatedDays, priceCents
- Full CRUD under `/admin/shipping/*`

#### Inventory Module
- `InventoryItem` schema: variantId, sku, quantityOnHand, quantityReserved, lowStockThreshold
- `StockMovement` schema: reason, delta, reference
- `GET /admin/inventory/variant/:variantId` — current stock
- `POST /admin/inventory/adjust` — manual restock/correction
- `GET /admin/inventory/low-stock` — variants at or below threshold
- Atomic stock reservation + fulfillment wired into checkout and order flows

#### Tax Module *(new)*
- `TaxRate` schema: name, type (percentage/fixed), rate, countryCode, stateCode, categorySlug, priority, isActive
- `GET/POST/PATCH/DELETE /admin/tax/rates`
- `POST /admin/tax/calculate` — preview tax for a given subtotal + country/state/category context
- `TaxService.calculateTax()` — exported for checkout integration; matches by country → state → category with priority ordering
- `taxCents` field added to `CheckoutSession` schema

#### Currency Module *(new)*
- `ExchangeRate` schema: baseCurrency, targetCurrency, rate, isActive (unique index on base+target pair)
- `GET/POST/DELETE /admin/currency/rates` — upsert by currency pair
- `GET /storefront/currency/rates` — active rates for storefront price converter
- `GET /storefront/currency/convert?amount=&from=&to=` — amount conversion endpoint
- Supports direct lookup + inverse rate triangulation

#### Notification Module
- `NotificationTemplate` schema: key, channel (email/sms), subjectTemplate, bodyTemplate (Handlebars)
- `NotificationChannelConfig` schema: credentials (AES-256 encrypted), provider, isActive
- `NotificationLog` schema: status (sent/failed), providerMessageId, error
- Handlebars template rendering
- BullMQ queue with 3-attempt exponential back-off retry
- SendGrid + SMTP mail providers; Twilio + MSG91 SMS providers
- Admin endpoints: channel config, template CRUD, send-test, log listing

#### Storefront / Organization
- `OrganizationSettings` singleton schema: storeName, businessType, currency, language, `theme`, `adminTheme`, `originAddress`
- `ThemeSettings` sub-schema *(theme studio)* — full token set per surface: 10 palette colours (accent/secondary + washes/ink, background, surface, ink, inkSoft, line), `fontDisplay/fontBody/fontMono`, `typeScale`, `headingScale`, `cornerStyle`, storefront structure (`headerStyle`, `heroVariant`, `gridDensity`, `cardStyle`, `sectionSpacing`), admin structure (`sidebarStyle`, `density`, `panelStyle`), `logoUrl`, `darkModeDefault` — all enum/hex-validated in `UpdateThemeDto`
- `GET /storefront/store-config` — public brand config (storefront `theme` only, never `adminTheme` or origin address) consumed by ThemeProvider
- `GET/PATCH /admin/organization/settings` · `PATCH /admin/organization/theme` · `PATCH /admin/organization/admin-theme` — storefront and dashboard themes saved independently; changes take effect without redeploy

#### Infrastructure
- `AppModule` with MongoDB + Redis (`ioredis`) + JWT + config validation
- BullMQ queue provider; `checkout-expiry` queue (releases reservations after 15-min TTL)
- S3-compatible storage provider (factory: s3 / contabo / minio / r2)
- Audit log: every staff status change recorded via `AuditService`
- All schemas fixed for Mongoose compatibility; backend builds clean

#### Seed Scripts *(new)*
- `npm run seed` — inserts demo org, staff owner account, 8 products (40+ variants), 5 categories, 3 coupons, 2 banners, 2 tax rates
- Idempotent: safe to run multiple times; skips existing records
- `npm run seed:payment-modes` — seeds Stripe/Razorpay payment mode config

#### PDF / Invoice *(new)*
- `PdfService.generateInvoiceHtml()` — pure-JS print-ready HTML invoice (no binary deps)
- `GET /admin/orders/:id/invoice` — returns styled HTML invoice with `Content-Disposition: inline`

---

### ✅ Also Done (this session)

#### Media / Uploads *(new)*
- `MediaService` — validates MIME type (jpeg/png/webp/gif/svg/pdf) and size (≤10 MB) before delegating to the existing S3-compatible `StorageProvider`
- `POST /admin/media/upload` — multipart/form-data upload; returns `{ key, url, originalName, mimeType, sizeBytes }`
- `POST /admin/media/signed-url` — returns a presigned PUT URL so clients can upload directly to storage (5-min TTL)
- `DELETE /admin/media/:key(*)` — delete a stored file by key (owner/admin only)

#### Search *(new)*
- `SearchService` — cross-collection full-text search across products, categories, blog posts, and CMS pages
- `GET /storefront/search?q=&types=&limit=` — returns ranked results with type facet counts; uses MongoDB `$text` index on products, regex fallback otherwise
- `GET /storefront/search/autocomplete?q=` — product title prefix suggestions for search-as-you-type

#### Job Queue Workers *(new)*
- **Coupon expiry worker** (`CouponExpiryProcessor`) — BullMQ processor on `coupon-expiry` queue; deactivates all coupons whose `expiresAt < now()`; registered as repeatable job (every 1 hour) on app startup
- **Stock reconciliation worker** (`StockReconcileProcessor`) — BullMQ processor on `stock-reconcile` queue; resets any negative `reservedQuantity` or `availableQuantity` values to 0 (defensive guard against race-condition drift); registered as repeatable job (every 6 hours) on app startup
- `POST /admin/scheduler/coupon-expiry` — manually trigger a coupon sweep
- `POST /admin/scheduler/stock-reconcile` — manually trigger a stock reconcile

#### Admin Customer Detail *(new)*
- `GET /admin/customers/:id` — returns customer document (password hash excluded) with embedded `addresses[]` and last 20 `reviews[]`

#### Tax → Checkout Wiring *(new)*
- `CheckoutService.createSession()` now calls `TaxService.calculateTax({ subtotalCents })` and stores the result in `session.taxCents`; `totalCents` = `subtotalCents + taxCents` (discount applied separately via `applyCoupon`)
- `TaxModule` imported into `OrderModule` to satisfy DI

#### Image Resize Pipeline *(new)*
- `sharp` installed as production dependency (`@types/sharp` as devDep)
- `MediaService.upload()` rewired: raster images (JPEG/PNG/WebP/GIF) are processed through a 3-preset pipeline before storage — `full` (2048×2048 WebP @85), `md` (800×800 WebP @82), `thumb` (400×400 WebP @78)
- EXIF auto-rotation applied to every preset; `withoutEnlargement: true` ensures small images are never upscaled
- Original file stored alongside variants under `{folder}/{uid}/original.{ext}`
- SVG and PDF bypass sharp entirely (stored as-is, `variants: []`)
- `UploadedMediaDto` extended with `variants: ImageVariant[]`

#### Unit Tests *(40 tests, 7 suites, 0 failures)*
- `tax.service.spec.ts` — 6 tests: wildcard rates, category-specific rates, fixed state rates, country mismatch, inactive rate exclusion, zero-rate case
- `currency.service.spec.ts` — 5 tests: same-currency passthrough, direct rate lookup, inverse-rate triangulation, missing rate error, same-currency upsert error
- `media.service.spec.ts` — 12 tests: raster JPEG → 4 storage.upload calls + 3 WebP variants, SVG/PDF pass-through, MIME rejection, size rejection, signed URL, delete
- `inventory.service.spec.ts` — 3 tests: successful reservation, insufficient stock failure, low-stock listing
- `coupon.service.spec.ts` — 8 tests: percentage/fixed discount, cap at subtotal, unknown code, inactive, expired, usage limit, minimum order
- `pdf.service.spec.ts` — 6 tests: valid HTML output, order number, SKUs, discount row, no discount row, billing email, store name
- `jest.config.ts` added; `npm run test`, `npm run test:cov`, `npm run test:e2e` scripts added

#### E2E Tests Against Real DB *(new)*
- `docker-compose.test.yml` — ephemeral MongoDB (port 27018, tmpfs) + Redis (port 6380, no persistence) for CI
- `jest.e2e.config.ts` — separate Jest config with 30 s timeout, `globalSetup` + `globalTeardown`
- `test/global-setup.ts` — injects all required env vars before app boot (Mongo URI, Redis port, JWT secrets, storage config)
- `test/app.e2e-spec.ts` — 40+ test cases across 15 describe blocks:
  - Staff + customer auth (register, login, refresh, logout, reuse-detection)
  - 401 guard coverage on all admin routes without token
  - Catalog CRUD (category → product → variant → storefront listing → PDP → search)
  - Inventory (stock read, adjust, low-stock list)
  - Tax CRUD + preview calculate
  - Currency CRUD + public convert endpoint
  - Coupon CRUD
  - Cart (guest token, add item, update quantity)
  - Checkout session creation with tax applied
  - Admin customer list + detail (password hash absent)
  - CMS pages (create + public slug read)
  - Scheduler manual triggers (coupon-expiry, stock-reconcile)

Run with:
```bash
docker compose -f docker-compose.test.yml up -d
npm run test:e2e
docker compose -f docker-compose.test.yml down -v
```

---

## Frontend (Next.js 16 + TypeScript + Tailwind)

### ✅ Done

#### Design System
- **Creamy-icy token system** — CSS custom properties at `:root` (cream `#f6f3ec` base, glacier blue `#4b9ec4` accent, cool charcoal ink). All glows, glass borders, and focus rings derived from the live accent via `color-mix()` so runtime retints propagate everywhere.
- **Arctic night dark variant** — `[data-theme="dark"]` block (deep navy `#10151a`, brighter glacier `#6fb7d9`). Deliberate design variant, not an inversion.
- **Admin-scoped dark mode** — `AdminThemeScope` wrapper stamps `data-theme` only on the admin layout, so a merchant's dark preference never bleeds onto the customer storefront.
- **Persisted light/dark toggle** — Zustand `ui-store` (localStorage), toggled from Settings → Theme → Appearance.
- **Fonts** — Space Grotesk (display), Inter (body), IBM Plex Mono (prices/SKUs/labels). Loaded via `next/font/google`.
- **Glass, glow, rise primitives** — `.glass`, `.hover-glow`, `.glow-accent`, `.animate-rise` used across all surfaces.
- **5-swatch live retint** — header RETINT strip proves the white-label engine; clicking a swatch re-injects the accent token and the 3D hero material recolors live.

#### Storefront
- **Homepage** — split hero: editorial headline left, live 3D ice shard right; editorial image band; product grids.
- **3D hero** (`react-three-fiber`) — faceted icosahedron with `meshPhysicalMaterial` (transmission/IOR for frosted-ice look), floating + slowly rotating. Reads the live accent from `ThemeProvider` context so retints recolor the 3D material instantly. Falls back to a static gradient under `prefers-reduced-motion`. SSR-safe via `dynamic()`.
- **Product listing** (`/products`) — client component using `useProducts()` with filter param support.
- **PDP** (`/products/[slug]`) — `useProduct(slug)` hook, color swatch picker, size selector, add-to-cart.
- **3D tilt cards** — pointer-tracked perspective tilt + icy glow ring on product cards (mouse-only, motion-safe).
- **Real-data-or-mock switchover** — `useProducts()` / `useProduct()` try the real API (retry: 0); if successful and returns data, uses real; otherwise falls back to demo catalog. "Demo catalog" badge shown in the UI.
- **Cart drawer** — line items, quantity controls, subtotal, persistent via Zustand.
- **Cart page** (`/cart`) — full cart view + order summary.
- **Checkout flow** (`/checkout`) — multi-step: address → payment method → confirm.
- **Auth pages** — `/login`, `/register`, `/account` wired to real `POST /auth/customer/*` API. Graceful error message on backend unreachable. `/account` shows real profile + addresses.
- **Staff login** (`/staff-login`) — glacier-blue glacier-accented form + "Explore in demo mode" bypass for development.

#### Admin Panel
- **Admin guard** — `AdminGuard` waits for Zustand hydration before redirecting (prevents flash-to-login on navigation).
- **Layout** — sidebar with glow-highlighted active item, user name/role display, sign-out button. Sidebar now includes Tax and Currency links.
- **Dashboard** — 4 stat tiles (glass, staggered rise-in), recent orders table with real API fallback + "Demo data" badge.
- **Products table** — real API via `useAdminProducts()` hook with mock fallback, loading skeleton, "Demo data" label.
- **Orders table** — real API via `useAdminOrders()` hook with mock fallback, loading skeleton, clickable rows navigate to order detail.
- **Order detail page** (`/admin/orders/[id]`) — line items, shipping address, order summary (subtotal/tax/discount/total), customer info, status-machine transition buttons, invoice download link.
- **Product create/edit form** — wired to real `POST /admin/catalog/products` + `POST /admin/catalog/variants` via `useMutation`; toast on success/error; loading state on submit button.
- **Inventory page** — real API via `useAdminInventory()` (backed by new `GET /admin/inventory` aggregation endpoint); loading skeleton; mock fallback when backend is offline.
- **Customers page** — real API via `useAdminCustomers()` hook; loading skeleton; mock fallback when backend is offline.
- **Marketing page** — Coupon table + Banner cards; **New Coupon modal** and **New Banner modal** both working (fire-and-forget API call + immediate local append). Verified in browser.
- **CMS page** — Pages table + Blog table; **New Page modal** and **New Post modal** working with live slug preview. Verified in browser.
- **Shipping settings** — zone/rate configuration form.
- **Payments settings** — gateway toggle list wired to real `PATCH /admin/payment-gateways/:id`; falls back to local-only mock when API is offline.
- **Tax admin page** (`/admin/tax`) — full CRUD table: create / edit / delete tax rates; inline edit panel with name, type, rate, country code, priority fields; toast feedback.
- **Currency admin page** (`/admin/currency`) — upsert exchange rates (base→target + rate); delete rates; table with active status badge; toast feedback.
- **Analytics page** — stat tiles + **Revenue chart** with Daily/Weekly/Monthly/Yearly range switcher. Verified in browser.
- **Settings page** — General (store name/domain), Organization, Notifications.

#### Marketing Landing Page — full build *(new)*
- **Shoplux landing page** (`/`) — completely separate from the merchant storefront; lives in `(landingpage)` route group
- **Hero** — animated word-by-word headline (GSAP), dual-column layout with Three.js canvas, floating store-stats card overlay
- **Logo bar** — infinite marquee of brand names
- **How It Works** — 3-step card grid with GSAP ScrollTrigger fade-in
- **Features** — 6-cell grid (Theme Studio, Commerce Stack, Analytics, Marketing Suite, Payments, Infrastructure)
- **Storefront preview carousel** — auto-horizontal-scroll (RAF-driven, 6 cards doubled for seamless loop, pauses on hover, fade edges)
- **Testimonial** — auto-cycling quote rotator with dot navigation
- **Pricing** — 2-tier cards (Starter free / Growth $49) with CTA links
- **Final CTA** — GSAP scale-in headline
- **Footer** — brand link, doc/terms links, copyright

#### Marketing Sub-pages *(new)*
- **`/platform`** — 6 pillar cards (Commerce Engine, Theme Studio, Marketing Suite, Analytics, Payments, Infrastructure), full feature lists per pillar, bottom CTA strip linking to `/pricing`
- **`/pricing`** — 3-tier plan grid (Starter / Growth / Enterprise), monthly/annual billing toggle (saves 20%), accordion FAQ (5 questions), badge on featured plan
- **`/themes`** — 6 theme preview cards (Dusk, Ivory, Indigo, Sage, Ember, Slate), each renders a live browser-chrome mockup in that theme's actual colours (nav, hero, product row), colour swatch dots, category badge; Theme Studio callout section at bottom
- **`/docs`** — 6 documentation sections (Getting Started, Theme Studio, Products & Catalog, Payments & Orders, Marketing, Analytics), live search filter across all article titles, read-time estimates per article

#### Shared Marketing Components *(new)*
- **`MarketingNav`** (`components/marketing/marketing-nav.tsx`) — shared nav used by all marketing pages; "Shoplux" brand is a `<Link href="/">` (not a plain span); nav links point to `/platform`, `/pricing`, `/themes`, `/docs`; `solid` prop for sub-pages (no scroll trigger needed); scroll-triggered blur/border effect on homepage
- **`tokens.ts`** (`components/marketing/tokens.ts`) — shared colour constants (`GOLD`, `GOLD_SOFT`, `GOLD_BORDER`, `BG`, `SURFACE`, `SURFACE2`, `LINE`, `INK`, `INK2`, `INK3`) used across all marketing pages and components

#### Separation of landing page vs storefront *(fixed)*
- Marketing `(marketing)` route group and merchant `(store)` route group are now fully isolated — no links cross between them
- Storefront header logo (`Wordmark`) links to `/products` (storefront), not `/`
- Storefront error page "Go home" links to `/products`
- Theme Studio live preview iframe points to `/products` (storefront), not `/` (landing page)

#### Bug fixes *(this session)*
- **Stat tile border in light mode** — `var(--line-soft)` (near-black, never overridden in `AdminThemeScope`) replaced with `var(--line)` which is correctly overridden to `#e4e0d4` in light mode
- **Admin modal dark background in light mode** — `.glass` (unlayered CSS, higher cascade priority) was overriding `bg-surface` (Tailwind `@layer utilities`); fixed by removing the `glass` class from the modal card
- **Three.js `bufferAttribute` error** — `array/count/itemSize` props deprecated in R3F; replaced with `args={[positions, 3]}` constructor-args pattern
- **React list key warning in OrdersTable** — Fragment wrapping `<tr>` + expanded panel lacked a key; replaced `<>` with `<Fragment key={o._id}>` so the key lives at the correct level
- **Category filter buttons on store page** — `/products?category=X` URL param was never read; added `initialCategory` from `useSearchParams()` and wired it into demo + real-data filtering and page title

#### Theme Studio *(new — full session)*
- **Independent dual-surface themes** — storefront and admin panel each have their own saved theme (`organization.settings.theme` / `organization.settings.adminTheme`). Saved separately, applied separately; switching scope in the studio never touches the other draft.
- **Full palette control** — 10 named colour tokens (accent, accentInk, accentSoft, secondary, secondarySoft, background, surface, ink, inkSoft, line) each with a native colour-picker + hex input; changes propagate live via CSS custom properties.
- **Typography knobs** — Display font (Space Grotesk / Inter / IBM Plex Mono / System Sans / Editorial Serif), Body font (same options), Mono font (IBM Plex Mono / System Mono), Type Scale (Compact 0.92× / Regular / Large 1.09×), Heading Scale (Subtle 0.86× / Classic / Dramatic 1.16×), Corner Style (Sharp / Soft / Round → three radius tokens).
- **Storefront layout knobs** — Header Style (Split / Centered / Minimal), Hero Variant (Editorial / Immersive / Minimal), Grid Density (2 / 3 / 4 columns), Card Style (Glass / Flat / Outlined), Section Spacing (Dense / Regular / Airy → `--section-y`).
- **Admin layout knobs** — Sidebar Style (Expanded 224px / Compact 176px / Rail 64px monogram icons), Density (Comfortable / Compact → tighter table rows), Panel Style (Card glass / Flat).
- **11 one-click style presets** — Glacier (house look), Cyberpunk (neon violet/cyan/magenta dark), Neo-Brutalist (raw paper + mono headings), Monochrome (B&W), Midnight (near-black canvas), Ember (bold orange/white/black), Botanical (garden greens + serif), Lilac Pop (playful violet/pink), plus three brand-colour-only business-vertical palettes (Fashion & Apparel, Grocery & Food, General Store). Each preset chip shows a 3-dot palette preview.
- **WCAG contrast guardrails** — `lib/theme/contrast.ts` checks 5 colour pairs using WCAG 2.x relative luminance. Failures surface as inline warnings (ratio shown, minimum quoted) — advisory only, merchant retains final control.
- **Draft / saved separation** — studio holds an independent in-memory draft per scope; clicking Save POSTs to the backend. The live storefront never sees a draft.
- **iframe live preview** — a 1280×900 iframe loads the real storefront (or admin panel) and receives the current draft via same-origin `postMessage({ type: "THEME_PREVIEW", surface, theme })`. Fully interactive: scroll, click, navigate — it's the real site with the draft applied.
- **Responsive preview column** — `ResizeObserver` applies `transform: scale()` so the 1280-wide frame fits without causing horizontal scroll. Iframe is `position: absolute` inside `overflow: hidden` so its width never propagates into the flex layout.
- **"Open in new window" popup** — `window.open()` + burst-post loop (400 ms interval, 15 s) catches the async React mount and pushes the draft immediately; subsequent changes flow continuously. Guards against embedded-browser environments where `window.open` returns the current window.
- **Save / Discard / Restore** — Save: PATCH to backend + clears dirty flag. Discard: resets to last saved. Restore defaults: reverts to `DEFAULT_STORE_THEME`.
- **Preset-safe layout knobs** — `applyPreset()` merges only palette/type/corner/surface fields, leaving header/hero/grid/sidebar choices untouched.

#### Admin UX improvements *(new — this session)*
- **Sidebar brand name locked** — sidebar header always shows "Shoplux" (hardcoded brand, not the user-editable store name)
- **Sidebar auto-compact on Theme settings** — when `sidebarStyle` is "expanded" and the user navigates to `/admin/settings`, the sidebar automatically downgrades to "compact" so the theme customizer has more horizontal room
- **Viewport-locked admin layout** — layout is now `h-screen overflow-hidden`; only the right content column scrolls (`overflow-y-auto`); sidebar never scrolls
- **Sticky topbar** — `AdminTopbar` header is `sticky top-0 z-10` so it pins inside the scrolling column — sidebar and topbar both stay fixed while page content scrolls underneath
- **Go to Store button** — sidebar bottom shows "↗ Go to Store" (expanded/compact) or "↗" with tooltip (rail); opens `/store` in a new tab
- **Orders table inline expansion** — clicking any order row expands an inline panel showing: customer card (name, email, phone, delivery address) + a visual step-by-step order progress tracker (Order Placed → Awaiting Payment → Processing → Shipped → Delivered); cancelled orders show a red badge; chevron rotates to indicate open/closed; `RECENT_ORDERS` demo data extended with `email`, `phone`, and `address` fields; `AdminApiOrder` type extended with `contactPhone` and full `shippingAddress` fields; `mapOrder()` maps all new fields
- **Organization settings expanded** — Settings → Organization now covers: Business identity (type, legal name, GST/Tax ID, tagline), Contact (email, phone, website), Business address (street, city, state, ZIP, country), Regional (currency, language, timezone), Social links (Instagram, Twitter/X, Facebook, TikTok); all fields persisted to `useStoreSettings` Zustand store (localStorage); `store-settings-store.ts` extended with `legalName`, `taxId`, `website`, `socialTiktok`; `AdminOrganizationSettings` API type and `updateOrganizationSettings()` function added for future backend wiring
- **Marketing sub-pages image upload** — New Banner modal now has drag-and-drop image upload zone + file picker + local `data:` preview + URL fallback input

#### Admin sidebar variants *(new)*
- Three layouts driven by `sidebarStyle` token: **Expanded** (full labels + icon), **Compact** (tighter), **Rail** (icon-only, 2-letter monogram + hover tooltip).

#### Storefront structure knobs *(new)*
- **Three header layouts** (`header.tsx`) — Split (wordmark left, nav+cart right), Centered (stacked wordmark + nav), Minimal (wordmark + cart only).
- **Three hero variants** (`hero.tsx`) — Editorial (headline block + image band), Immersive (full-bleed image + overlay copy), Minimal (pure typography).
- **Grid density** (`product-grids.tsx`) — 2 / 3 / 4 desktop columns via `GRID_DENSITY_CLASSES`; mobile always 2-up.
- **Card styles** (`product-card.tsx`) — Glass (hover-glow + translucent border + shadow), Flat (no decoration), Outlined (1.5px ink border).
- **Section spacing** — `--section-y` CSS var drives `paddingBlock` on every storefront section.

#### Storefront improvements *(new)*
- **Products listing** (`/products`) — search bar with 350 ms debounce + clear button; skeleton grid while loading; pagination component (prev/next + page numbers); empty state message; real-API with mock fallback.
- **Account page** — Order history section added (placeholder with clear call-to-action while customer orders API is not yet exposed).
- **Error boundaries** — `(admin)/error.tsx` and `(store)/error.tsx` both implemented; catch unhandled query errors, display message + "Try again" reset button.

#### Toast system *(new)*
- `toast-store.ts` — Zustand store (non-persisted); `toast.success()`, `toast.error()`, `toast.info()` helpers callable outside React.
- `Toaster` component — fixed bottom-right stack, auto-dismisses after 3.5 s, manual dismiss button, colour-coded by kind.
- Mounted in root layout — available everywhere in the app.

#### Shared UI components *(new)*
- `SkeletonRow`, `SkeletonTable`, `SkeletonCard`, `SkeletonGrid` — pulse-animated placeholder rows/cards for every table and product grid.
- `Pagination` — prev/next + up-to-7-page-number window with ellipsis; renders nothing when `totalPages ≤ 1`.

#### Infrastructure / Wiring
- `apiRequest()` — typed fetch wrapper (unwraps `{ success, data }` envelope, throws `ApiError`)
- `staffRequest()` — same but attaches staff Bearer token from `staff-store`
- `admin.api.ts` extended — `createProduct`, `updateProduct`, `deleteProduct`, `createVariant`, `getAdminOrder`, `updateOrderStatus`, `listAdminCustomers`, `getAdminCustomer`, `listAdminInventory`, `adjustInventory`, `listPaymentGateways`, `updatePaymentGateway`, `listTaxRates`, `createTaxRate`, `updateTaxRate`, `deleteTaxRate`, `listCurrencyRates`, `upsertCurrencyRate`, `deleteCurrencyRate`
- `catalog.api.ts` extended — `listStorefrontProducts` now accepts `page` + `limit` params
- `use-admin-data.ts` extended — `useAdminOrderDetail`, `useAdminCustomers`, `useAdminInventory`, `useAdminTaxRates`, `useAdminCurrencyRates`, `useAdminGateways`
- `auth-store`, `staff-store`, `ui-store`, `cart-store` — persisted Zustand stores
- `QueryProvider` + `@tanstack/react-query` — server state throughout
- `ThemeProvider` — injects preset tokens as inline CSS variables
- `next.config.ts` — Unsplash `remotePatterns`, image quality presets

---

### ⚠️ Remaining / Deferred (Frontend)

| Area | Notes |
|---|---|
| **Checkout → real backend** | Cart store tracks slug/color/size but not `variantId`; wiring `POST /storefront/checkout/sessions` requires adding `variantId` to every cart line and a cart-model refactor. |
| **Product photos** | Unsplash picks are editorial; re-sourcing brighter high-key shots is a content task. |
| **Dark-mode storefront** | Merchants can now set `darkModeDefault: true` in the theme studio to start the storefront in dark mode; the arctic-night CSS variant is in place. A full per-user toggle on the storefront is deferred. |
| **Mobile responsive audit** | Needs real-device testing; basic responsive grid is in place. |
| **Accessibility audit** | ARIA labels added on key interactive elements; full focus-trap modals + keyboard nav dropdowns are a future sprint. |

---

## To Run Locally

```bash
# Backend (needs MongoDB + Redis running)
cd backend
cp .env.example .env   # fill MONGO_URI, REDIS_URL, JWT_SECRET
npm install
npm run start:dev      # http://localhost:4000/api

# Seed demo data (run once after first start)
npm run seed

# Frontend
cd frontend
cp .env.example .env.local  # NEXT_PUBLIC_API_URL=http://localhost:4000/api
npm install
npm run dev            # http://localhost:3000
```

The frontend falls back to demo/mock data when the backend is unreachable, so the storefront and admin panel are fully explorable without a running backend — just click "Explore in demo mode" on the staff login page.
