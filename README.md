# Biashara Hub

> **Production-grade headless e-commerce for the Kenyan market.**  
> Built on Medusa.js v2 + Next.js App Router in a pnpm monorepo.

Biashara Hub eliminates high SaaS platform fees and vendor lock-in by giving you full ownership of your transactional data, customer profiles, and source code — with native support for the payment rails Kenyan shoppers actually use.

## Live Deployment
- **Storefront**: [https://biashara-hub-storefront.onrender.com](https://biashara-hub-storefront.onrender.com)
- **Backend API**: [https://biashara-hub-backend.onrender.com](https://biashara-hub-backend.onrender.com)
- **Admin Dashboard**: [https://biashara-hub-backend.onrender.com/app](https://biashara-hub-backend.onrender.com/app)

---

## Table of Contents

- [Features](#features)
- [Architecture & Tech Stack](#architecture--tech-stack)
- [Repository Structure](#repository-structure)
- [Quick Start (Local Development)](#quick-start-local-development)
- [Environment Variables](#environment-variables)
- [Payment Integrations](#payment-integrations)
- [Notifications](#notifications)
- [Analytics & Dashboards](#analytics--dashboards)
- [Design System](#design-system)

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
- Cloudflare R2 media storage scaffolded (egress-free)
- Stock badge on product cards driven live from `inventory_quantity`

### 📣 Notifications
- **SMS** via Africa's Talking — order confirmation + shipping updates
- **Email** via Resend — welcome emails, order invoices, shipping receipts with styled HTML templates

---

## Architecture & Tech Stack

This project is deployed using a modern, scalable headless architecture.

| Layer | Technology | Infrastructure |
|-------|-----------|---------|
| Commerce Engine | [Medusa.js](https://medusajs.com) (v2.15) | Render Web Service (Node.js) |
| Storefront | [Next.js](https://nextjs.org) (App Router, v15) | Render Web Service (Node.js) |
| Database | PostgreSQL (v15) | Supabase (Managed Postgres) |
| Cache & Sessions | Redis (v7) | Render / Managed Redis |
| Search | MeiliSearch (Optional) | Render (Self-hosted) |
| Analytics | PostHog & Metabase | Cloud / Local BI |

---

## Repository Structure

```text
biashara-hub/
├── package.json                  # Monorepo root scripts
├── pnpm-workspace.yaml           # Workspace definitions
├── docker-compose.yml            # Local DB & Redis for dev
│
├── backend/                      # Medusa.js v2 commerce engine
│   ├── medusa-config.ts          # Module registrations, CORS, plugins
│   └── src/
│       ├── api/store/mpesa/      # M-Pesa STK + C2B custom API routes
│       ├── subscribers/          # order-placed, order-shipped event handlers
│       ├── lib/                  # SMS, Email, and Redis utilities
│       └── migration-scripts/    # Kenyan store seed data
│
├── storefront/                   # Next.js App Router customer storefront
│   └── src/
│       ├── app/                  # Routes: shop, cart, checkout, account, orders
│       ├── components/           # Layout, product cards, cart drawer
│       ├── context/CartContext   # Server-synced cart state
│       └── lib/                  # medusa.ts, formatters, analytics, metadata
│
└── docs/
    └── design.md                 # Typography & colour guidelines
```

---

## Quick Start (Local Development)

### Prerequisites
- **Node.js** ≥ 20 LTS
- **pnpm** ≥ 9 &nbsp;(`npm install -g pnpm`)
- **Docker Desktop** (Postgres, Redis)

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
*Starts PostgreSQL on 5432 and Redis on 6379.*

### 3 — Configure environment variables
Copy `.env.example` to `.env` in both `backend` and `storefront` folders and fill in your keys.

### 4 — Seed the database
```bash
cd backend
pnpm medusa db:migrate
pnpm medusa exec src/migration-scripts/initial-data-seed.ts
pnpm medusa user -e admin@example.com -p yourSecurePassword
```

### 5 — Start development servers
```bash
# Terminal 1
pnpm dev:backend      # → http://localhost:9000

# Terminal 2
pnpm dev:storefront   # → http://localhost:3000
```

---

## Environment Variables

### Backend (`backend/.env.production`)
Must be kept absolutely secret (do not commit to Git).
```ini
DATABASE_URL=postgresql://user:pass@supabase-host.com:5432/postgres
REDIS_URL=redis://redis-host:6379
JWT_SECRET=super_secret_key
COOKIE_SECRET=super_secret_cookie
STORE_CORS=https://biashara-hub-storefront.onrender.com
MPESA_CONSUMER_KEY=...
MPESA_CONSUMER_SECRET=...
MPESA_PASSKEY=...
MPESA_SHORTCODE=...
MPESA_CALLBACK_URL=https://biashara-hub-backend.onrender.com/store/mpesa/webhook
PAYSTACK_SECRET_KEY=sk_live_...
AT_API_KEY=...
AT_USERNAME=...
RESEND_API_KEY=...
```

### Storefront (`storefront/.env.production`)
Safe to be read by the frontend application.
```ini
NEXT_PUBLIC_MEDUSA_BACKEND_URL=https://biashara-hub-backend.onrender.com
NEXT_PUBLIC_MEDUSA_PUBLISHABLE_KEY=pk_...
NEXT_PUBLIC_MPESA_TILL_NUMBER=...
NEXT_PUBLIC_POSTHOG_KEY=phc_...
NEXT_PUBLIC_POSTHOG_HOST=https://us.i.posthog.com
```

---

## Payment Integrations

### Lipa Na M-Pesa STK Push
1. Customer enters their phone number at checkout.
2. Storefront calls `POST /store/mpesa/initiate` → backend triggers Safaricom Daraja STK Push API.
3. Safaricom sends a PIN prompt to the customer's phone.
4. Backend polls `GET /store/mpesa/status/:checkoutRequestId` every 3 s (up to 120 s timeout).
5. On Safaricom webhook confirmation, order is completed automatically.

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
- `order.placed`: Order confirmation with total and reference ID
- `order.shipment_created`: Dispatch notification with tracking info

Kenyan phone numbers are normalised automatically (`07...` → `+25407...`).

### Email (Resend)
- Welcome email (`customer.created`)
- Order invoice (`order.placed`)
- Shipping receipt (`order.shipment_created`)

---

## Analytics & Dashboards

- **PostHog**: Tracks storefront conversion funnels (`checkout_started`, `add_to_cart`, `order_completed`). Set `NEXT_PUBLIC_POSTHOG_KEY` to enable.
- **Metabase**: Connects to the Supabase database for BI dashboards (Revenue, Best Sellers, Inventory Alerts, Payment Split).

---

## Design System

**Palette (70 / 20 / 10 rule)**
- Background: `#FFFFFF` / `#F8FAFC` (70% — surfaces, cards)
- Primary: `#0A2D6B` / `#0F3D91` Navy (20% — headings, CTAs)
- Accent: `#D4A017` / `#F4D57E` Gold (10% — highlights, badges)

**Typography** — [Inter](https://fonts.google.com/specimen/Inter) loaded via `next/font`

---

## License

MIT © Biashara Hub Contributors
