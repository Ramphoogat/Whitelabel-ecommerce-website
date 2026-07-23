<div align="center">

# Shoplux

**A white-label, multi-tenant e-commerce platform built for rapid deployment and deep customization.**

![Next.js](https://img.shields.io/badge/Next.js_15-black?style=flat-square&logo=next.js)
![NestJS](https://img.shields.io/badge/NestJS-E0234E?style=flat-square&logo=nestjs&logoColor=white)
![MongoDB](https://img.shields.io/badge/MongoDB-47A248?style=flat-square&logo=mongodb&logoColor=white)
![TypeScript](https://img.shields.io/badge/TypeScript-3178C6?style=flat-square&logo=typescript&logoColor=white)
![Redis](https://img.shields.io/badge/Redis-DC382D?style=flat-square&logo=redis&logoColor=white)
![Tailwind CSS](https://img.shields.io/badge/Tailwind_CSS-06B6D4?style=flat-square&logo=tailwindcss&logoColor=white)

One codebase. Any store. Ship in minutes.

</div>

---

## What Is Shoplux?

Shoplux is a production-ready, white-label e-commerce platform. Deploy it as a fashion boutique, electronics store, grocery shop, or anything else — the entire look, feel, and branding changes via a single environment variable and the built-in Theme Studio, without touching code.

It ships with three surfaces in one monorepo:

| Surface | URL | Purpose |
|---|---|---|
| **Customer Storefront** | `/store` | Public shopping experience |
| **Admin Dashboard** | `/admin` | Full store management |
| **Staff Portal** | `/staff-login` | Role-gated team access |

---

## Tech Stack

### Backend
| Layer | Technology |
|---|---|
| Runtime | Node.js 18+ |
| Framework | NestJS (TypeScript) |
| Database | MongoDB via Mongoose |
| Cache & Queues | Redis + BullMQ |
| Auth | JWT (access + refresh rotation), Argon2id |
| Storage | S3-compatible (AWS S3, Cloudflare R2, MinIO, Contabo) |
| Email | Nodemailer + Handlebars templates |
| Security | Helmet, CORS, rate-limiting, AES-256-GCM credential encryption |
| API Docs | Swagger / OpenAPI at `/api/docs` |

### Frontend
| Layer | Technology |
|---|---|
| Framework | Next.js 15 App Router (TypeScript) |
| Styling | Tailwind CSS + CSS custom properties |
| State | Zustand (persisted) |
| Data Fetching | TanStack React Query |
| 3D | Three.js + @react-three/fiber |
| Fonts | Cormorant Garamond, Playfair Display, Fraunces, DM Sans, Space Mono via next/font |
| Theme | CSS variables + live Theme Studio with postMessage iframe preview |

---

## Feature Overview

### Storefront (Customer-Facing)
- Product catalogue with search, filters, and category browsing
- Product detail pages with image galleries and variant pickers
- Persistent cart (guest + authenticated) with drawer UI
- Full checkout flow — address, shipping, coupon, payment
- Order history and account management
- Separate customer login / register with social sign-in (Google, Apple, Facebook)
- CMS-driven content pages and blog
- Dynamically themed via live Theme Studio — no redeploy needed

### Admin Dashboard
- **Dashboard** — revenue charts, KPI stat tiles, recent orders
- **Products** — create, edit, archive products with variants, images, and SEO fields
- **Orders** — manage orders, update status, expand any row to see customer address + visual order progress tracker
- **Inventory** — stock levels, low-stock alerts, manual adjustments
- **Customers** — list, search, inspect customer records; view social sign-in provider
- **Staff** — add/remove team members, assign roles (owner / admin / staff), configure per-section sidebar access, disable accounts
- **Marketing** — coupon codes (%, fixed, free shipping) + promotional banners with image upload
- **CMS** — manage content pages and blog posts
- **Payments** — enable/disable payment gateways, view transaction history
- **Shipping** — zones and rates configuration
- **Tax** — tax rules by region with checkout integration
- **Currency** — multi-currency exchange rates
- **Analytics** — revenue, order, and traffic reports with date range switcher
- **Wallet** — collected funds ledger, payout accounts, withdrawal flow, live exchange rate ticker
- **Settings** — store identity, organization details, notifications, theme

### Theme Studio
- **Dual-surface themes** — storefront and admin panel themed independently
- **10 palette tokens** — live colour pickers with hex input; changes propagate instantly
- **Typography** — display/body/mono font pickers, type scale, heading scale, corner style
- **Storefront layout** — nav style (standard/sidebar drawer), card layout, footer variant, home section builder with drag-reorder, product slider, back-to-top, smooth scroll
- **8 premium presets** — Noir Atelier, Ivory & Gold, Emerald Estate, Sapphire Maison, Bordeaux, Onyx Rosé, Café Crème, Terra Atelier
- **Sticky preview rail** — live 1280px iframe (real site, real interactions) pinned alongside controls; mobile-friendly bottom-sheet fallback
- **WCAG contrast guardrails** — inline warnings with ratios when pairs fail AA

### Staff Access Control
- Admins pick which sidebar sections each staff member can open
- Restricted sections render as dimmed, non-clickable nav items
- Access config stored in the user document and baked into the JWT — no extra round-trips

### Platform / API
- Multi-tenancy — org-scoped data isolation
- Background jobs — checkout expiry, coupon expiry, stock reconciliation
- Email and SMS notifications via BullMQ
- S3-compatible media upload with image resize pipeline (full / md / thumb WebP variants)
- Full-text product search + autocomplete
- Health check endpoint covering DB, Redis, and storage
- Audit log for all admin actions
- Swagger UI — interactive API docs at `/api/docs`

---

## Project Structure

```
shoplux/
├── backend/                        NestJS API
│   └── src/
│       ├── bootstrap/              App setup (DB, security, Swagger, validation)
│       ├── config/                 Typed config factories
│       ├── modules/
│       │   ├── analytics/          Sales & traffic reports
│       │   ├── audit/              Admin action audit log
│       │   ├── cart/               Guest & authenticated cart
│       │   ├── catalog/            Products, categories, variants
│       │   ├── cms/                Content pages & blog posts
│       │   ├── currency/           Multi-currency & exchange rates
│       │   ├── customer/           Customer accounts, auth, social login
│       │   ├── health/             Health-check endpoint
│       │   ├── identity/           Staff accounts, JWT, roles, access control
│       │   ├── inventory/          Stock levels & adjustments
│       │   ├── marketing/          Coupons & banners
│       │   ├── media/              File upload to S3-compatible storage
│       │   ├── notification/       Email & SMS via BullMQ
│       │   ├── order/              Checkout flow & order management
│       │   ├── organization/       Multi-tenant config & theme
│       │   ├── payment/            Gateway config, webhooks, transactions
│       │   ├── scheduler/          Cron jobs (coupon expiry, stock sync)
│       │   ├── search/             Full-text product search
│       │   ├── shipping/           Zones, rates, carrier integration
│       │   └── tax/                Tax rules by region
│       ├── providers/              Pluggable external integrations
│       └── shared/                 Guards, decorators, filters, utils
│
└── frontend/                       Next.js 15 storefront + admin
    └── src/
        ├── app/
        │   ├── (store)/            Customer storefront routes
        │   ├── (admin)/admin/      Admin dashboard routes
        │   ├── (auth)/             Auth routes (login, register, staff-login)
        │   └── (landingpage)/      Shoplux marketing site
        ├── components/
        │   ├── admin/              Admin UI components
        │   ├── store/              Storefront components
        │   ├── marketing/          Landing page components
        │   └── ui/                 Shared primitives (skeleton, toaster, pagination)
        ├── stores/                 Zustand state stores
        ├── lib/
        │   ├── api/                API client functions
        │   ├── data/               Data helpers & mock data
        │   └── theme/              Theme types, presets & contrast utils
        └── hooks/                  Data-fetching hooks
```

---

## Quick Start

### Prerequisites
- Node.js 18+
- MongoDB (local or Atlas)
- Redis (local or managed)

### 1. Clone & install

```bash
git clone https://github.com/Ramphoogat/Whitelabel-ecommerce-website.git
cd Whitelabel-ecommerce-website
```

### 2. Configure the backend

```bash
cp backend/.env.example backend/.env
```

Key variables:

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

### 3. Configure the frontend

```bash
# frontend/.env.local
NEXT_PUBLIC_API_URL=http://localhost:4000/api
```

### 4. Run the backend

```bash
cd backend
npm install
npm run build
npm run start        # production
# or
npm run start:dev    # watch mode
```

Seed demo data (run once):

```bash
npm run seed
```

### 5. Run the frontend

```bash
cd frontend
npm install
npm run dev
```

| URL | Surface |
|---|---|
| `http://localhost:3000/store` | Customer storefront |
| `http://localhost:3000/admin` | Admin dashboard |
| `http://localhost:3000/staff-login` | Staff login |
| `http://localhost:4000/api/docs` | Swagger API docs |

> **Tip:** The frontend falls back to demo/mock data when the backend is unreachable. Click "Explore in demo mode" on the staff login page to browse the full admin panel without a running backend.

---

## API Reference

All endpoints are prefixed with `/api` and fully documented in Swagger at `/api/docs`.

| Prefix | Description |
|---|---|
| `/api/auth` | Staff login, refresh, logout |
| `/api/auth/customer` | Customer register, login, social login, refresh |
| `/api/catalog` | Products & categories (public) |
| `/api/search` | Full-text search + autocomplete |
| `/api/cart` | Guest & authenticated cart |
| `/api/storefront/checkout` | Checkout session flow |
| `/api/storefront/currency` | Exchange rates & conversion |
| `/api/payment/webhook` | Payment provider webhooks |
| `/api/admin/staff` | Staff management (owner/admin only) |
| `/api/admin/customers` | Customer management |
| `/api/admin/catalog` | Product & category management |
| `/api/admin/orders` | Order management |
| `/api/admin/inventory` | Stock management |
| `/api/admin/marketing` | Coupons & banners |
| `/api/admin/payments` | Payment gateway config |
| `/api/admin/shipping` | Shipping zones & rates |
| `/api/admin/tax` | Tax rate management |
| `/api/admin/currency` | Exchange rate management |
| `/api/admin/analytics` | Revenue & traffic reports |
| `/api/admin/organization` | Store config & theme |
| `/api/admin/media` | File upload & signed URLs |
| `/api/health` | Health check (DB, Redis, storage) |

---

## Running Tests

```bash
cd backend

# Unit tests (40 tests, 7 suites)
npm run test

# Coverage report
npm run test:cov

# E2E tests (requires Docker)
docker compose -f docker-compose.test.yml up -d
npm run test:e2e
docker compose -f docker-compose.test.yml down -v
```

---

<div align="center">

Built with care by Ram Phoogat

</div>
