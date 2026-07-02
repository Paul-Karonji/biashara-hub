# Biashara Hub

> **Production-grade headless e-commerce for the Kenyan market.**  
> Built on Medusa.js v2 + Next.js App Router in a pnpm monorepo.

Biashara Hub eliminates high SaaS platform fees and vendor lock-in by giving you full ownership of your transactional data, customer profiles, and source code — with native support for the payment rails Kenyan shoppers actually use.

---

## Table of Contents

- [Features](#features)
- [Tech Stack](#tech-stack)
- [Repository Structure](#repository-structure)
- [Quick Start](#quick-start)
- [Environment Variables](#environment-variables)
- [Running the Stack](#running-the-stack)
- [Payment Integrations](#payment-integrations)
- [Notifications](#notifications)
- [Analytics & Dashboards](#analytics--dashboards)
- [Design System](#design-system)
- [Code Quality](#code-quality)
- [Deployment](#deployment)
- [Metabase SQL Reference](#metabase-sql-reference)
- [Contributing](#contributing)
- [License](#license)

---

## Features

### 🇰🇪 Kenyan-First Commerce
- **KES currency** as default (USD fallback available)
- **16% VAT** applied automatically via Medusa tax regions
- **47 Kenyan counties** pre-loaded in the checkout address form
- Phone number normalisation (`07…` / `01…` → international `+254…`)

### 💳 Payment Channels
| Method | Flow | Status |
|--------|------|--------|
| **Lipa Na M-Pesa STK Push** | Real-time prompt to customer's phone, polling for authorization | ✅ Production |
| **M-Pesa C2B Manual Till** | Customer pays to till number, enters 10-char code for server-side verification | ✅ Production |
| **Paystack (Visa/MC/AMEX)** | Hosted card checkout with redirect and webhook confirmation | ✅ Production |

### 📦 Catalogue & Inventory
- Full product/variant/inventory management via Medusa Admin (`/app`)
- MeiliSearch typo-tolerant storefront search (optional, env-gated)
- Cloudflare R2 media storage scaffolded (egress-free)
- Stock badge on product cards driven live from `inventory_quantity`

### 📣 Notifications
- **SMS** via Africa's Talking — order confirmation + shipping updates
- **Email** via Resend — welcome emails, order invoices, shipping receipts with styled HTML templates

### 📊 Analytics
- **PostHog** conversion funnel tracking (`checkout_started`, `add_to_cart`, `order_completed`, …)
- **Metabase** BI dashboards — revenue, best sellers, inventory alerts, payment split

### 🔐 Security (hardened in latest audit)
- Safaricom IP allowlist middleware on M-Pesa webhook routes
- Redis-backed token cache with sliding-window rate limiting on STK initiation
- Metabase connects via a dedicated read-only Postgres user (`metabase_ro`)
- No secrets in source — all keys via environment variables

---

## Tech Stack

| Layer | Technology | Version |
|-------|-----------|---------|
| Commerce engine | [Medusa.js](https://medusajs.com) | 2.15.5 |
| Storefront | [Next.js](https://nextjs.org) App Router | 15.x |
| Language | TypeScript | 5.6 |
| Package manager | pnpm (workspaces) | 11.7 |
| Database | PostgreSQL | 15 |
| Cache / sessions | Redis | 7 |
| Search | MeiliSearch | 1.x (optional) |
| Analytics | PostHog, Metabase | — |
| SMS | Africa's Talking | — |
| Email | Resend | — |
| Storage | Cloudflare R2 (S3-compatible) | — |
| Payments | M-Pesa Daraja, Paystack | — |
| Containers | Docker Compose | — |

---

## Repository Structure

```
biashara-hub/
├── package.json                  # Monorepo root scripts
├── pnpm-workspace.yaml           # Workspace definitions
├── docker-compose.yml            # Postgres, Redis, MeiliSearch, Metabase
│
├── backend/                      # Medusa.js v2 commerce engine
│   ├── medusa-config.ts          # Module registrations, CORS, plugins
│   ├── .env.example              # All required backend env vars documented
│   └── src/
│       ├── api/store/mpesa/      # M-Pesa STK + C2B custom API routes
│       ├── subscribers/          # order-placed, order-shipped event handlers
│       ├── lib/
│       │   ├── sms.ts            # Africa's Talking SMS + phone normaliser
│       │   ├── email.ts          # Resend email templates
│       │   └── redis.ts          # Shared Redis client
│       ├── types/                # africastalking.d.ts and other ambient types
│       └── migration-scripts/    # Kenyan store seed data
│
├── storefront/                   # Next.js App Router customer storefront
│   ├── .env.example              # All required storefront env vars documented
│   └── src/
│       ├── app/                  # Routes: shop, cart, checkout, account, orders
│       │   └── checkout/
│       │       └── components/   # CheckoutStepIndicator, CheckoutSummary, MpesaOverlay
│       ├── components/           # Layout, product cards, cart drawer
│       ├── context/CartContext   # Server-synced cart state
│       ├── hooks/useWishlist.ts  # Shared localStorage wishlist hook
│       └── lib/                  # medusa.ts, formatters, analytics, metadata
│
├── docker/
│   └── postgres-init/
│       └── 01-metabase-readonly.sh  # Creates metabase_ro DB user on first run
│
└── docs/
    └── design.md                     # Typography & colour guidelines
```

---

## Quick Start

### Prerequisites

- **Node.js** ≥ 20 LTS
- **pnpm** ≥ 9 &nbsp;(`npm install -g pnpm`)
- **Docker Desktop** (Postgres, Redis, MeiliSearch, Metabase)

### 1 — Clone & install

```bash
git clone https://github.com/Paul-Karonji/biashara-hub.git
cd biashara-hub
pnpm install
```

### 2 — Start backing services

```bash
docker compose up -d
```

This starts:

| Service | Port | Notes |
|---------|------|-------|
| PostgreSQL | 5432 | Primary DB; `metabase_ro` read-only user created automatically |
| Redis | 6379 | Token cache + rate limiting |
| MeiliSearch | 7700 | Storefront search (optional) |
| Metabase | 3001 | BI dashboards |

### 3 — Configure environment variables

```bash
# Backend
cp backend/.env.example backend/.env

# Storefront
cp storefront/.env.example storefront/.env.local
```

See [Environment Variables](#environment-variables) for all required keys.

### 4 — Seed the database

```bash
# Run Medusa migrations
cd backend
pnpm medusa db:migrate

# Seed Kenyan store data (KES, 16% VAT, categories, products, shipping)
pnpm medusa exec src/migration-scripts/initial-data-seed.ts

# Create your first admin account
pnpm medusa user -e admin@example.com -p yourSecurePassword
```

### 5 — Start development servers

```bash
# From the root — run both concurrently
pnpm dev:backend      # → http://localhost:9000
pnpm dev:storefront   # → http://localhost:3000
```

| URL | Description |
|-----|-------------|
| http://localhost:3000 | Customer storefront |
| http://localhost:9000 | Medusa API |
| http://localhost:9000/app | Medusa Admin dashboard |
| http://localhost:3001 | Metabase BI |

---

## Environment Variables

### Backend (`backend/.env`)

| Variable | Required | Description |
|----------|----------|-------------|
| `DATABASE_URL` | ✅ | `postgresql://user:pass@localhost:5432/biashara` |
| `REDIS_URL` | ✅ | `redis://localhost:6379` |
| `JWT_SECRET` | ✅ | Random 64-char string |
| `COOKIE_SECRET` | ✅ | Random 64-char string |
| `STORE_CORS` | ✅ | e.g. `http://localhost:3000` |
| `MPESA_CONSUMER_KEY` | ✅ | Safaricom Daraja app consumer key |
| `MPESA_CONSUMER_SECRET` | ✅ | Safaricom Daraja app consumer secret |
| `MPESA_PASSKEY` | ✅ | Lipa Na M-Pesa online passkey |
| `MPESA_SHORTCODE` | ✅ | STK Push business shortcode |
| `MPESA_CALLBACK_URL` | ✅ | Public HTTPS URL for Safaricom callbacks |
| `PAYSTACK_SECRET_KEY` | ✅ | `sk_live_…` or `sk_test_…` |
| `AT_API_KEY` | ✅ | Africa's Talking API key |
| `AT_USERNAME` | ✅ | Africa's Talking username (`sandbox` for dev) |
| `AT_SENDER_ID` | ⬜ | Custom SMS sender ID (optional) |
| `RESEND_API_KEY` | ✅ | Resend email API key |
| `S3_ACCESS_KEY_ID` | ⬜ | Cloudflare R2 / AWS S3 access key |
| `S3_SECRET_ACCESS_KEY` | ⬜ | Cloudflare R2 / AWS S3 secret key |
| `S3_BUCKET` | ⬜ | S3/R2 bucket name |
| `S3_ENDPOINT` | ⬜ | R2 endpoint URL (omit for AWS) |
| `MEILISEARCH_HOST` | ⬜ | e.g. `http://localhost:7700` (omits search if unset) |
| `MEILISEARCH_API_KEY` | ⬜ | MeiliSearch master key |
| `METABASE_RO_PASSWORD` | ✅ | Password for the `metabase_ro` Postgres user |

### Storefront (`storefront/.env.local`)

| Variable | Required | Description |
|----------|----------|-------------|
| `NEXT_PUBLIC_MEDUSA_BACKEND_URL` | ✅ | `http://localhost:9000` |
| `NEXT_PUBLIC_MEDUSA_PUBLISHABLE_KEY` | ✅ | Publishable API key from Medusa Admin |
| `NEXT_PUBLIC_MPESA_TILL_NUMBER` | ✅ | Business till number shown on checkout |
| `NEXT_PUBLIC_POSTHOG_KEY` | ⬜ | PostHog project API key |
| `NEXT_PUBLIC_POSTHOG_HOST` | ⬜ | `https://app.posthog.com` |

---

## Running the Stack

```bash
# Root convenience scripts (run from /biashara-hub)
pnpm dev:backend      # medusa develop
pnpm dev:storefront   # next dev

# Backend only
cd backend && pnpm dev

# Storefront only
cd storefront && pnpm dev

# Build for production
cd backend && pnpm build
cd storefront && pnpm build
```

---

## Payment Integrations

### Lipa Na M-Pesa STK Push

1. Customer enters their phone number at checkout.
2. Storefront calls `POST /store/mpesa/initiate` → backend triggers Safaricom Daraja STK Push API.
3. Safaricom sends a PIN prompt to the customer's phone.
4. Backend polls `GET /store/mpesa/status/:checkoutRequestId` every 3 s (up to 120 s timeout).
5. On Safaricom webhook confirmation, order is completed automatically.

Rate limiting: **3 requests / 5 min per phone**, **1 request / 30 s per cart**.

### M-Pesa C2B Manual Till

1. Customer pays to the business till number.
2. Customer enters the 10-character M-Pesa transaction code at checkout.
3. Storefront calls `POST /store/mpesa/c2b-verify` → backend matches the code against Safaricom C2B callback data stored in Redis.
4. On match, cart is completed.

### Paystack (Card)

1. Backend initialises a Paystack payment session and receives an `authorization_url`.
2. Customer is redirected to Paystack's hosted checkout page.
3. On payment, Paystack posts to the webhook endpoint; backend completes the cart.

---

## Notifications

### SMS (Africa's Talking)
Triggered by Medusa subscribers in `backend/src/subscribers/`:

| Event | Message |
|-------|---------|
| `order.placed` | Order confirmation with total and reference ID |
| `order.shipment_created` | Dispatch notification with tracking info |

Kenyan phone numbers are normalised automatically:
```
07XXXXXXXX  →  +25407XXXXXXXX
01XXXXXXXX  →  +25401XXXXXXXX
```

### Email (Resend)
| Template | Trigger |
|----------|---------|
| Welcome email | `customer.created` |
| Order invoice | `order.placed` |
| Shipping receipt | `order.shipment_created` |

---

## Analytics & Dashboards

### PostHog (Storefront)
Events tracked automatically:

```
product_viewed      add_to_cart         checkout_started
payment_selected    order_completed     search_performed
```

Set `NEXT_PUBLIC_POSTHOG_KEY` to enable. Events fire only in production builds.

### Metabase (BI Dashboards)

Metabase runs on [http://localhost:3001](http://localhost:3001) and connects via the read-only `metabase_ro` Postgres user (created automatically by the Docker init script).

See [Metabase SQL Reference](#metabase-sql-reference) below for pre-built dashboard queries.

---

## Design System

**Palette (70 / 20 / 10 rule)**

| Role | Colour | Usage |
|------|--------|-------|
| Background | `#FFFFFF` / `#F8FAFC` | 70% — surfaces, cards |
| Primary | `#0A2D6B` / `#0F3D91` Navy | 20% — headings, CTAs |
| Accent | `#D4A017` / `#F4D57E` Gold | 10% — highlights, badges |

**Typography** — [Inter](https://fonts.google.com/specimen/Inter) loaded via `next/font`

**Motion** — all hover/transition effects use `200ms ease`

**Layout** — max content width `1200px`, tested to `320px`

**Accessibility** — WCAG AA contrast (≥ 4.5:1), touch targets ≥ 44px, `prefers-reduced-motion` respected

---

## Code Quality

```bash
# From any workspace
pnpm lint          # ESLint (warns on `any` usage, errors in src/lib/ and src/hooks/)
pnpm type-check    # tsc --noEmit
```

The ESLint config (`storefront/eslint.config.mjs`) enforces:
- `@typescript-eslint/no-explicit-any: warn` project-wide
- `@typescript-eslint/no-explicit-any: error` in `src/lib/` and `src/hooks/` (shared code)

---

## Deployment

### Storefront → Vercel (recommended)
```bash
cd storefront
vercel deploy
```
Set all `NEXT_PUBLIC_*` env vars in the Vercel project dashboard.

### Backend → Railway / Render / VPS
```bash
cd backend
pnpm build
pnpm start     # medusa start
```

Ensure `DATABASE_URL`, `REDIS_URL`, and all payment keys are set in your hosting environment.

### Docker (production)
The `docker-compose.yml` is configured for local development. For production, use managed Postgres + Redis and remove the local service definitions. The Metabase service can be kept as-is and pointed at your managed DB.

> **First-run note:** The `docker/postgres-init/01-metabase-readonly.sh` script runs only once (on initial volume creation) to create the `metabase_ro` database user. On an existing DB, run the SQL in that file manually.

---

## Metabase SQL Reference

<details>
<summary><b>Expand dashboard queries</b></summary>

### Sales Overview

**Daily Revenue — Last 30 Days**
```sql
SELECT
  DATE(created_at)      AS order_date,
  SUM(total) / 100.0    AS revenue_kes,
  COUNT(id)             AS order_count
FROM "order"
WHERE created_at >= NOW() - INTERVAL '30 days'
  AND status != 'canceled'
GROUP BY DATE(created_at)
ORDER BY order_date DESC;
```

**Order Status Breakdown**
```sql
SELECT status, COUNT(id) AS order_count
FROM "order"
GROUP BY status;
```

**Average Order Value**
```sql
SELECT AVG(total) / 100.0 AS aov_kes
FROM "order"
WHERE status != 'canceled';
```

---

### Top Products

**Best Sellers by Quantity**
```sql
SELECT
  title,
  SUM(quantity)                         AS total_units_sold,
  SUM(unit_price * quantity) / 100.0    AS total_revenue_kes
FROM order_line_item
GROUP BY title
ORDER BY total_units_sold DESC
LIMIT 10;
```

**Best Sellers by Revenue**
```sql
SELECT
  title,
  SUM(unit_price * quantity) / 100.0    AS total_revenue_kes
FROM order_line_item
GROUP BY title
ORDER BY total_revenue_kes DESC
LIMIT 10;
```

---

### Customer Insights

**New vs Returning Customers**
```sql
WITH customer_orders AS (
  SELECT customer_id, COUNT(id) AS order_count
  FROM "order"
  WHERE customer_id IS NOT NULL
  GROUP BY customer_id
)
SELECT
  CASE WHEN order_count > 1 THEN 'Returning' ELSE 'First-time' END AS type,
  COUNT(customer_id) AS customer_count
FROM customer_orders
GROUP BY 1;
```

**Registration Trend**
```sql
SELECT DATE(created_at) AS date, COUNT(id) AS registrations
FROM customer
GROUP BY DATE(created_at)
ORDER BY date DESC;
```

---

### Inventory Alerts

**Low Stock (< 10 units)**
```sql
SELECT
  ii.sku,
  pv.title                                              AS variant,
  (il.stocked_quantity - il.reserved_quantity)          AS available
FROM inventory_item ii
JOIN inventory_level il ON ii.id = il.inventory_item_id
LEFT JOIN product_variant_inventory_item pvii ON ii.id = pvii.inventory_item_id
LEFT JOIN product_variant pv ON pvii.variant_id = pv.id
WHERE (il.stocked_quantity - il.reserved_quantity) < 10
ORDER BY available ASC;
```

**Out-of-Stock Count**
```sql
SELECT COUNT(*) AS out_of_stock
FROM inventory_item ii
JOIN inventory_level il ON ii.id = il.inventory_item_id
WHERE (il.stocked_quantity - il.reserved_quantity) <= 0;
```

---

### Payment Method Split

**M-Pesa vs Paystack vs Other**
```sql
SELECT
  CASE
    WHEN provider_id LIKE '%mpesa%'    THEN 'M-Pesa (STK / Till)'
    WHEN provider_id LIKE '%paystack%' THEN 'Paystack (Card)'
    ELSE 'Other'
  END                        AS payment_method,
  COUNT(*)                   AS transactions,
  SUM(amount) / 100.0        AS total_kes
FROM payment
GROUP BY 1
ORDER BY total_kes DESC;
```

</details>

---

## Contributing

1. Fork the repository and create a feature branch: `git checkout -b feat/my-feature`
2. Make changes, run `pnpm lint` and `pnpm type-check` before committing
3. Open a pull request with a clear description of the change and its motivation

---

## License

MIT © Biashara Hub Contributors
