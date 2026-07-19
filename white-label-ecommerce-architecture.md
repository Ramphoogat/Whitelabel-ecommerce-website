# White-Label E-Commerce Platform — Architecture Specification

**Stack:** Next.js (App Router + TS + Tailwind + React Query + Zustand + RHF + Zod) · NestJS (TS) · MongoDB · Redis (Standalone/Sentinel via ENV) · BullMQ · S3/Contabo/Zata (via ENV) · Nginx + PM2

This supersedes the earlier Postgres/shared-multi-tenant draft. The model here is **one core codebase, one deployment per client** — not a shared SaaS database. This document reflects that correctly.

---

## 1. The Real Tenancy Model: Isolated Deployments, Not Shared Rows

This is the most important correction from the earlier draft: this is **not** Amazon/Flipkart-style multi-vendor-on-one-site, and it is **not** shared-database multi-tenancy either. Each client (clothing brand, grocery store, sweet shop, etc.) gets:

- Their **own VPS**
- Their **own MongoDB database**
- Their **own Redis instance**
- Their **own domain**
- Their **own user base** (no cross-client users)

What's shared is the **codebase** — every client runs the exact same NestJS + Next.js application, and every difference between a Saree Shop and an Electronics Store is expressed entirely through `.env` configuration + the theme engine + feature flags. There is no `tenant_id` column anywhere and no cross-client query ever happens, because there is no shared data store to query across. This drastically simplifies the security model (no RLS, no cross-tenant leak surface) at the cost of per-client infra overhead — which is the correct trade-off here since the business goal is "launch a new independent store in hours," not "run thousands of tenants on shared compute."

### 1.1 What "launching a new client" actually means operationally

1. Provision a new VPS (or a new container/stack on shared infra if you later containerize).
2. Clone the same repo, set a client-specific `.env`.
3. Point a new/updated DNS record (client's own domain or subdomain) at that VPS.
4. Run seed script with the client's business type, theme, and initial admin user.
5. Store is live — no code touched.

### 1.2 Config-driven differences (all via ENV / DB-stored settings, zero code changes)

| Category | Mechanism |
|---|---|
| Business type (Fashion/Grocery/etc.) | `BUSINESS_TYPE` ENV → selects theme bundle + enabled feature defaults |
| Theme / colors / logo | Stored in `organization.settings` (Mongo doc) + `theme.config.ts`, read at runtime, no rebuild needed |
| Payment gateway(s) | `providers/payment/` factory — admin toggles which gateways are active per store (§6) |
| Delivery partner(s) | `providers/shipping/` factory — same toggle pattern |
| Storage provider | `STORAGE_PROVIDER=s3\|contabo\|zata\|minio\|r2` — factory picks implementation, app code never imports a vendor SDK directly |
| SMTP / SMS provider | `providers/mail/`, `providers/sms/` factories, same ENV-switch pattern |
| Tax rules, currency, language | Stored per-store in `modules/tax`, `modules/currency`, `modules/language` — DB-driven, not hardcoded |
| Cache mode | `REDIS_MODE=standalone\|sentinel` — `providers/cache/` picks the right client implementation |

**The one rule that makes this all work:** application code never talks to a vendor SDK directly. Every external dependency (payment, shipping, storage, mail, SMS, cache, search) sits behind an **interface**, resolved by a **factory** at request time, driven by ENV/DB config. This is Strategy + Factory pattern, applied consistently — see §6 for the concrete payment example, since that's the one you flagged as the next build step.

---

## 2. Backend Module Map (NestJS, MongoDB/Mongoose)

Domain modules are vertical slices — each owns its schemas, DTOs, service, repository, controller, and events. Cross-cutting concerns live in `shared/`; vendor integrations live in `providers/`.

```
src/
├── config/          # app/database/redis/storage/payment/mail/sms/queue/search/theme/security — all ENV-validated
├── bootstrap/        # swagger, validation, security, db bootstrap
├── shared/
│   ├── guards/       # auth, permissions, roles, throttle  (no tenant.guard — single-tenant-per-deploy)
│   ├── filters/       # all-exceptions, mongo-exceptions, validation-exceptions
│   ├── interceptors/  # response, logging, cache, timeout
│   ├── decorators/    # current-user, permissions, roles, public, api-version
│   └── utils/         # pagination, slugify, crypto, date
├── providers/         # THE abstraction layer — one folder per vendor category
│   ├── storage/       # storage.interface.ts + factory + s3/contabo/zata/minio/r2
│   ├── payment/       # payment.interface.ts + factory + razorpay/cashfree/phonepe/payu/stripe/ccavenue/paytm/authorize-net
│   ├── shipping/      # shiprocket/delhivery/bluedart/xpressbees/dtdc/india-post/custom
│   ├── mail/          # smtp/sendgrid/mailgun/ses
│   ├── sms/           # twilio/msg91/fast2sms/textlocal
│   ├── cache/         # redis.cache.ts / redis-sentinel.cache.ts (ENV-selected)
│   ├── search/        # mongo.search.ts now, elastic/opensearch later — same interface
│   └── queue/         # bullmq.queue.ts
└── modules/
    ├── identity/       # user, role, permission, session, invite — auth incl. OTP
    ├── organization/    # single-store settings: theme, domain, localization, tax-rule
    ├── catalog/         # category, brand, attribute, product, variant, collection
    ├── inventory/        # stock, warehouse, movement, reservation, low-stock alerts
    ├── cart/             # cart, cart-item, cart-rule, guest-cart merge on login
    ├── order/            # order, order-item, return-request, status machine
    ├── payment/           # transaction records, gateway-mode grouping (§6)
    ├── shipping/          # shipment, tracking
    ├── marketing/         # coupon, banner, gift-card, referral, loyalty-point
    ├── cms/               # page, blog, faq, menu
    ├── customer/          # wishlist, compare-list, review, address
    ├── media/             # media, gallery
    ├── tax/ currency/ language/   # store localization config
    ├── audit/             # audit-log, activity-log
    └── health/            # DB/Redis/Storage/Queue health checks
jobs/                  # BullMQ processors: email, sms, invoice, inventory-sync, notification, image-optimization, export
templates/             # Handlebars — emails, sms, invoices, push
seeds/ scripts/ test/
```

**Vendor/subscription/wholesale/affiliate modules** are scaffolded as future-ready but not wired into Phase 1–8 — build the folders/schemas now so the shape is right, but don't implement business logic until a client actually needs them (avoids over-engineering, per your own stated principle).

---

## 3. Frontend Structure (Next.js App Router)

```
frontend/
├── app/
│   ├── (auth)/            # login, register, otp-login, forgot/reset password
│   ├── (store)/           # public storefront: products, categories, cart, checkout,
│   │                        wishlist, compare, account, pages, blog, search, track-order
│   ├── (admin)/            # dashboard, products, inventory, orders, customers,
│   │                        marketing, cms, shipping, payments, analytics, settings
│   └── api/                # thin BFF: auth passthrough, payment webhooks proxy
├── components/
│   ├── ui/                 # shadcn/ui primitives
│   ├── theme/               # theme-provider, theme-switcher, color-tokens, theme-loader
│   ├── store/                # product-card, product-grid, cart-drawer, mini-cart
│   └── admin/                 # sidebar, stat-card, data-table, chart-wrapper
├── themes/                  # fashion/ grocery/ electronics/ restaurant/ ... — each with
│                              components/ + styles/ + config.ts
├── stores/                  # Zustand: auth, cart, theme, ui
├── hooks/                   # use-auth, use-cart, use-theme, use-api
├── lib/api/                  # typed client + per-resource API modules
└── middleware.ts
```

**Split of responsibility** (unchanged principle from before, just re-scoped to single-tenant):
- **React Query** → server-state mutations & reads that need cache invalidation (cart, checkout, admin CRUD)
- **Zustand** → pure client UI state (theme toggle, drawer open/closed, checkout step)
- **React Hook Form + Zod** → all forms, client + server-side validated with the same schema shape

Since there's no per-request tenant resolution anymore (one deploy = one store), `middleware.ts` is much lighter than in the shared-DB model — its job is now just auth-route protection and locale/theme cookie handling, not tenant lookup.

---

## 4. Theme Engine

- `organization.settings.theme` (Mongo doc) holds: business type, primary/secondary colors, logo URL, light/dark mode default.
- Each business type (`themes/fashion/`, `themes/grocery/`, ...) is a self-contained bundle: its own component overrides + Tailwind CSS variable set + `config.ts` describing layout choices (e.g., grocery needs a quantity stepper + unit selector on the product card; fashion needs a size/color swatch picker).
- `ThemeProvider` reads the active theme + color tokens at app boot and injects CSS custom properties, exactly as in the previous draft — color/logo changes are a settings update, never a redeploy.
- Enabling a *different* business-type theme (not just color/logo) is a bigger operational step (different component set), which is why `BUSINESS_TYPE` is an ENV set at provisioning time, not a runtime toggle — it selects which theme bundle the build includes.

---

## 5. Build Phases (as you specified — infra first, no frontend until auth exists)

| Phase | Weeks | Backend | Frontend | Deliverable |
|---|---|---|---|---|
| 1. Foundation | 1–2 | Bootstrap, config, Mongo, Redis, Swagger, global pipes/filters, storage/cache/queue abstractions | — | Swagger up, health checks green, file upload via API works |
| 2. Identity + Org | 3–4 | Auth (register/login/OTP/refresh/roles) | Login/register/OTP pages, dashboard shell | Can register, log in, see dashboard |
| 3. Catalog + Inventory | 5–6 | Categories, brands, attributes, products, variants, stock | Admin product CRUD, public listing + detail | Create product in admin, see it in store |
| 4. Cart + Order Core | 7–8 | Cart (guest+auth), checkout, order creation, status machine | Cart drawer, checkout steps, order confirmation | Add to cart → checkout → order created |
| 5. Payment + Shipping | 9–10 | Payment gateway factory, webhooks, shipping factory, tracking | Payment method selection, shipping options, tracking page | Full purchase flow, test-mode real money |
| 6. Marketing + CMS | 11–12 | Coupons, banners, pages, blogs | Admin coupon/banner manager, public pages/blog | Coupon applies at checkout, banners on homepage |
| 7. Notifications + Analytics | 13–14 | Email/SMS queues, templates, audit logs, dashboard APIs | Admin analytics, notification prefs | Order confirmation email sent, sales chart visible |
| 8. Themes + Polish | 15–16 | Theme config APIs | Theme engine, color tokens, per-industry themes | Switch theme via ENV, store looks different |

We are currently pre-Phase-1. Per your instruction, we go **one step at a time** — no code until you confirm which phase/file to start with.

---

## 6. Payment Gateway Architecture — Admin-Controlled, Mode-Grouped (your specific ask)

This is the mechanism for: *admin enables/disables any gateway individually, customer sees payment **modes** (UPI / Card / COD / Netbanking), and picking a mode reveals only the currently-active gateways that support it.*

### 6.1 Data model (Mongo)

**`payment_gateway_configs`** (one doc per gateway, per store)
```ts
{
  _id: ObjectId,
  provider: 'razorpay' | 'cashfree' | 'phonepe' | 'payu' | 'stripe' | 'ccavenue' | 'paytm' | 'authorize_net',
  isActive: boolean,                 // admin toggle
  supportedModes: ('upi'|'card'|'netbanking'|'wallet'|'cod')[],
  credentials: { /* encrypted at rest */ keyId, keySecret, ... },
  priority: number,                  // display order when multiple gateways support a mode
  createdAt, updatedAt
}
```

**`payment_modes`** (static-ish reference, seedable)
```ts
{ code: 'upi', label: 'UPI', icon: 'upi.svg', enabledByDefault: true }
{ code: 'card', label: 'Credit/Debit Card' }
{ code: 'cod', label: 'Cash on Delivery' }
{ code: 'netbanking', label: 'Net Banking' }
```

### 6.2 API surface (NestJS `modules/payment`)

- `GET /admin/payment-gateways` — list all configured gateways + active state (admin)
- `PATCH /admin/payment-gateways/:id` — toggle `isActive`, edit credentials/priority (admin)
- `GET /checkout/payment-options` — **customer-facing**: returns available modes, each with its list of currently-active gateways:

```json
{
  "modes": [
    { "code": "upi", "label": "UPI", "gateways": ["razorpay", "phonepe"] },
    { "code": "card", "label": "Card", "gateways": ["stripe", "razorpay"] },
    { "code": "cod", "label": "Cash on Delivery", "gateways": [] }
  ]
}
```

This endpoint queries `payment_gateway_configs` where `isActive: true`, groups by `supportedModes`, sorted by `priority`. COD has no gateway (it's a fulfillment method, not a payment processor), so it's flagged separately.

### 6.3 Factory + Strategy pattern (backend)

```
providers/payment/
  payment.interface.ts     # PaymentProvider: createOrder(), verifyPayment(), refund()
  payment.factory.ts       # resolves the right provider instance by name at call time
  razorpay.provider.ts
  stripe.provider.ts
  ... (one file per gateway, each implementing PaymentProvider)
```

The checkout service never imports a gateway SDK directly — it asks the factory for a provider by name (the one the customer selected, validated server-side against `isActive`), and the factory returns the matching implementation. Adding gateway #9 later means: add one provider file + register it in the factory map — zero changes to checkout/order logic.

### 6.4 Frontend flow

1. Checkout page calls `GET /checkout/payment-options` on load.
2. Customer picks a **mode** (tab/segmented control: UPI / Card / COD / Netbanking) — only modes with ≥1 active gateway (or COD, always shown if enabled) are rendered.
3. Selecting a mode reveals the gateway list for that mode (radio buttons, e.g. "Razorpay" / "PhonePe" under UPI) — if only one gateway supports that mode, auto-select it and skip the extra click.
4. On submit, the order is created server-side against the customer's selected `{mode, gateway}`, validated again server-side (never trust the client's claim that a gateway is active).

### 6.5 Why this is the right shape

- Admin control lives entirely in one collection (`payment_gateway_configs`) — toggling a gateway off immediately removes it from checkout, no deploy needed.
- Mode-grouping is a derived view, not stored state — so adding "supports UPI" to an existing gateway config is a one-field edit, not a schema migration.
- The Strategy/Factory pattern is exactly what your own architecture principles call for here (§ Architecture Principles in your spec) — this is the correct place to apply it, versus over-abstracting simpler modules like `cms` or `blog`.

---

## Next step

Per your instruction to move one step at a time with no assumptions: tell me which to start with and I'll produce the actual files + exact terminal commands (nothing summarized) —

1. **Phase 1 foundation** — `main.ts`, `app.module.ts`, Mongo/Redis/config bootstrap, health checks
2. **Payment module scaffold** — since you flagged it specifically — `payment.interface.ts`, `payment.factory.ts`, `payment_gateway_configs` schema, admin toggle endpoint, `GET /checkout/payment-options`
3. Something else you'd rather do first

Which one?
