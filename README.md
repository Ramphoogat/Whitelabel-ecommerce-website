# White-Label E-Commerce Platform

## Tech Stack

### Backend
- **Runtime:** Node.js
- **Framework:** NestJS (TypeScript)
- **Database:** MongoDB (via Mongoose)
- **Cache / Queue Broker:** Redis + BullMQ
- **Auth:** JWT (access + refresh tokens), Argon2 password hashing
- **API Docs:** Swagger / OpenAPI
- **Storage:** S3-compatible (AWS S3, Cloudflare R2, MinIO, Contabo, Zata)
- **Email:** Nodemailer / Handlebars templates
- **Security:** Helmet, CORS, Throttler (rate-limiting), AES-256-GCM credential encryption

### Frontend
- **Framework:** Next.js 15 (App Router, TypeScript)
- **Styling:** Tailwind CSS
- **State Management:** Zustand
- **Data Fetching:** TanStack React Query
- **3D / Animations:** Three.js, @react-three/fiber, @react-three/drei
- **Theme System:** CSS custom properties + live Theme Studio

---

## What Is This?

A **white-label, multi-tenant e-commerce platform** that can be deployed as any type of online store (fashion, electronics, furniture, etc.) by changing a single environment variable. It ships with a full customer-facing storefront, a complete admin dashboard, and a headless REST API — all in one monorepo.

## What It Can Do

### Storefront (Customer-Facing)
- Browse a product catalogue with search, filtering, and pagination
- View detailed product pages with image galleries
- Add items to a persistent cart (guest + authenticated)
- Full checkout flow with address, shipping method, coupon, and payment selection
- Order confirmation and account order history
- Customer registration, login, and profile management
- Real-time promotional banners and CMS-driven content pages

### Admin Dashboard
- **Dashboard** — revenue charts, stat tiles, and key business metrics
- **Products** — create, edit, and delete products with variants, images, and SEO fields
- **Orders** — view, filter, and manage orders; update order status; click any row to expand inline customer address + visual order progress tracker
- **Inventory** — stock levels, low-stock alerts, and adjustments
- **Customers** — list, search, and inspect customer records
- **Marketing** — coupon codes (percentage / fixed / free-shipping), promotional banners
- **CMS** — manage content pages (About, FAQs, etc.)
- **Payments** — enable/disable payment gateways per-org; view transaction history
- **Shipping** — configure shipping zones and rates
- **Tax** — define tax rules by region
- **Currency** — multi-currency support with exchange rates
- **Analytics** — sales, revenue, and traffic reports
- **Settings** — store identity, branding (General); Organization (business type, legal name, GST/Tax ID, address, regional settings, social links); Notifications; Theme
- **Theme Studio** — live preview dual-surface (store + admin) theme customizer with color presets; sidebar auto-compacts when Theme tab is open

### Platform / API
- **Multi-tenancy** — each organisation gets isolated data via org-scoped queries
- **Background jobs** — checkout expiry, coupon expiry, stock reconciliation, notification delivery
- **Notifications** — email and SMS delivery via BullMQ queues
- **Media management** — upload images to any S3-compatible provider
- **Health checks** — `/health` endpoint covering DB, Redis, and storage
- **Audit log** — admin action trail
- **Scheduled tasks** — cron-based maintenance jobs
- **Swagger UI** — full interactive API documentation at `/api/docs`

---

## Folder Structure

```
e-commerce/
├── README.md                          ← you are here
├── backend/                           ← NestJS API
│   ├── src/
│   │   ├── main.ts                    ← entry point
│   │   ├── app.module.ts              ← root module
│   │   ├── bootstrap/                 ← app setup (DB, security, Swagger, validation)
│   │   │   ├── database.bootstrap.ts
│   │   │   ├── security.bootstrap.ts
│   │   │   ├── swagger.bootstrap.ts
│   │   │   └── validation.bootstrap.ts
│   │   ├── config/                    ← typed config factories
│   │   │   ├── app.config.ts
│   │   │   ├── database.config.ts
│   │   │   ├── env.validation.ts
│   │   │   ├── queue.config.ts
│   │   │   ├── redis.config.ts
│   │   │   ├── security.config.ts
│   │   │   ├── shipping-origin.config.ts
│   │   │   └── storage.config.ts
│   │   ├── modules/
│   │   │   ├── analytics/             ← sales & traffic reports
│   │   │   ├── audit/                 ← admin action audit log
│   │   │   ├── cart/                  ← guest & authenticated cart
│   │   │   ├── catalog/               ← products, categories, variants
│   │   │   ├── cms/                   ← content pages & blocks
│   │   │   ├── currency/              ← multi-currency & exchange rates
│   │   │   ├── customer/              ← customer accounts & auth
│   │   │   ├── health/                ← health-check endpoint
│   │   │   ├── identity/              ← staff/admin identity & JWT
│   │   │   ├── inventory/             ← stock levels & adjustments
│   │   │   ├── marketing/             ← coupons & banners
│   │   │   ├── media/                 ← file upload to S3-compatible storage
│   │   │   ├── notification/          ← email & SMS via BullMQ
│   │   │   ├── order/                 ← checkout flow & order management
│   │   │   ├── organization/          ← multi-tenant org config & theme
│   │   │   ├── payment/               ← gateway config, webhooks, transactions
│   │   │   ├── scheduler/             ← cron jobs (coupon expiry, stock sync)
│   │   │   ├── search/                ← full-text product search
│   │   │   ├── shipping/              ← zones, rates, carrier integration
│   │   │   └── tax/                   ← tax rules by region
│   │   ├── providers/                 ← pluggable external integrations
│   │   │   ├── cache/                 ← Redis cache provider
│   │   │   ├── mail/                  ← email provider
│   │   │   ├── payment/               ← payment gateway adapters
│   │   │   ├── pdf/                   ← PDF generation
│   │   │   ├── queue/                 ← BullMQ queue provider
│   │   │   ├── shipping/              ← carrier rate provider
│   │   │   ├── sms/                   ← SMS provider
│   │   │   └── storage/               ← S3-compatible storage provider
│   │   └── shared/
│   │       ├── decorators/            ← custom param & role decorators
│   │       ├── filters/               ← global exception filters
│   │       ├── guards/                ← JWT & role guards
│   │       ├── interceptors/          ← logging & transform interceptors
│   │       ├── interfaces/            ← shared TypeScript interfaces
│   │       └── utils/                 ← helper functions
│   ├── seeds/                         ← database seed scripts
│   ├── test/                          ← e2e test setup
│   ├── .env.example                   ← environment variable template
│   ├── nest-cli.json
│   ├── package.json
│   └── tsconfig.json
│
└── frontend/                          ← Next.js storefront + admin
    ├── src/
    │   ├── app/
    │   │   ├── layout.tsx             ← root layout
    │   │   ├── globals.css            ← global styles & CSS custom properties
    │   │   ├── (store)/               ← customer storefront routes
    │   │   │   ├── page.tsx           ← homepage
    │   │   │   ├── products/
    │   │   │   │   ├── page.tsx       ← product listing
    │   │   │   │   └── [slug]/page.tsx← product detail
    │   │   │   ├── cart/page.tsx
    │   │   │   ├── checkout/
    │   │   │   │   ├── page.tsx
    │   │   │   │   └── confirmation/page.tsx
    │   │   │   └── account/page.tsx
    │   │   ├── (admin)/               ← admin dashboard routes
    │   │   │   └── admin/
    │   │   │       ├── page.tsx       ← dashboard
    │   │   │       ├── products/
    │   │   │       ├── orders/
    │   │   │       ├── inventory/
    │   │   │       ├── customers/
    │   │   │       ├── marketing/
    │   │   │       ├── cms/
    │   │   │       ├── payments/
    │   │   │       ├── shipping/
    │   │   │       ├── tax/
    │   │   │       ├── currency/
    │   │   │       ├── analytics/
    │   │   │       └── settings/
    │   │   └── (auth)/                ← auth routes
    │   │       ├── login/page.tsx
    │   │       ├── register/page.tsx
    │   │       └── staff-login/page.tsx
    │   ├── components/
    │   │   ├── admin/                 ← admin UI components
    │   │   │   ├── sidebar.tsx
    │   │   │   ├── topbar.tsx
    │   │   │   ├── stat-tile.tsx
    │   │   │   ├── revenue-chart.tsx
    │   │   │   ├── products-table.tsx
    │   │   │   ├── orders-table.tsx
    │   │   │   ├── product-form.tsx
    │   │   │   ├── theme-customizer.tsx
    │   │   │   ├── cms-manager.tsx
    │   │   │   └── marketing-manager.tsx
    │   │   ├── store/                 ← storefront components
    │   │   │   ├── header.tsx
    │   │   │   ├── footer.tsx
    │   │   │   ├── hero.tsx
    │   │   │   ├── product-card.tsx
    │   │   │   ├── product-grids.tsx
    │   │   │   ├── product-detail.tsx
    │   │   │   ├── cart-drawer.tsx
    │   │   │   └── checkout-form.tsx
    │   │   ├── theme/                 ← theme provider & scoping
    │   │   │   ├── theme-provider.tsx
    │   │   │   └── store-theme-scope.tsx
    │   │   ├── providers/
    │   │   │   └── query-provider.tsx ← TanStack Query setup
    │   │   └── ui/                    ← shared primitives (skeleton, toaster, pagination)
    │   ├── stores/                    ← Zustand state stores
    │   │   ├── auth-store.ts          ← customer auth state
    │   │   ├── staff-store.ts         ← admin staff auth state
    │   │   ├── cart-store.ts          ← cart state
    │   │   ├── toast-store.ts         ← notification toasts
    │   │   └── ui-store.ts            ← UI state (drawers, modals)
    │   ├── hooks/
    │   │   ├── use-catalog.ts         ← product & category data hooks
    │   │   └── use-admin-data.ts      ← admin dashboard data hooks
    │   └── lib/
    │       ├── api/                   ← API client functions
    │       │   ├── client.ts          ← base fetch client
    │       │   ├── auth.api.ts
    │       │   ├── catalog.api.ts
    │       │   ├── admin.api.ts
    │       │   └── organization.api.ts
    │       ├── data/                  ← data-mapping & static data helpers
    │       └── theme/                 ← theme types, presets & contrast utils
    ├── public/                        ← static assets
    ├── next.config.ts
    ├── package.json
    └── tsconfig.json
```

---

## Prerequisites

- Node.js 18+
- MongoDB (local or Atlas)
- Redis (local or managed)

---

## Environment Setup

Copy the backend example env file and fill in your values:

```bash
cp backend/.env.example backend/.env
```

Key variables to set:

| Variable | Description |
|---|---|
| `MONGO_URI` | MongoDB connection string |
| `REDIS_HOST` / `REDIS_PORT` | Redis connection |
| `JWT_ACCESS_SECRET` | Secret for signing access tokens |
| `JWT_REFRESH_SECRET` | Secret for signing refresh tokens |
| `CREDENTIALS_ENCRYPTION_KEY` | AES-256 key for encrypting payment credentials |
| `STORAGE_PROVIDER` | `s3`, `r2`, `minio`, `contabo`, or `zata` |
| `STORAGE_ACCESS_KEY` / `STORAGE_SECRET_KEY` | Storage credentials |
| `STORE_NAME` | Display name of the store |
| `BUSINESS_TYPE` | e.g. `fashion`, `electronics`, `furniture` |

For the frontend create `frontend/.env.local`:

```env
NEXT_PUBLIC_API_URL=http://localhost:4000/api
```

---

## Running the Backend

```bash
cd backend
npm install

# Development (watch mode)
npm run start:dev

# Production
npm run build
npm run start:prod
```

The API will be available at `http://localhost:4000/api`.  
Swagger docs are at `http://localhost:4000/api/docs`.

### Seed the database (optional)

```bash
npm run seed
```

---

## Running the Frontend

```bash
cd frontend
npm install

# Development
npm run dev

# Production
npm run build
npm run start
```

The storefront will be available at `http://localhost:3000`.  
The admin dashboard is at `http://localhost:3000/admin`.  
Staff login is at `http://localhost:3000/staff-login`.

---

## API Overview

All endpoints are prefixed with `/api` and documented in Swagger.

| Prefix | Description |
|---|---|
| `/api/auth` | Staff login, refresh token |
| `/api/customer/auth` | Customer register, login |
| `/api/catalog` | Products & categories (public) |
| `/api/search` | Full-text product search |
| `/api/cart` | Guest & authenticated cart |
| `/api/checkout` | Checkout session & order creation |
| `/api/orders` | Customer order history |
| `/api/payment/webhook` | Payment provider webhooks |
| `/api/admin/*` | All admin-only endpoints (require staff JWT) |
| `/api/health` | Health check |
