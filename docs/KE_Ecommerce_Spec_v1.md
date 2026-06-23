**Kenyan Ecommerce Platform** |  Project Specification v1.0 

## **Kenyan Ecommerce Platform** 

## Project Specification & Build Phases 

Medusa.js v2  •  Next.js 15  •  M-Pesa  •  Paystack 

|**Version**|1.0.0|
|---|---|
|**Date**|June 2026|
|**Market**|Kenya (KE)|
|**Status**|In Development|



Confidential  |  For Developer UsePage 

**Kenyan Ecommerce Platform** |  Project Specification v1.0 

## **1. Project Overview** 

A production-ready, open-source ecommerce platform tailored for the Kenyan market. Built on Medusa.js v2 (backend) and Next.js 15 (storefront), with native M-Pesa and Paystack payment integrations. The goal is a reusable template that can be deployed for multiple clients with minimal reconfiguration. 

## **Design Principle** 

No platform fees. No vendor lock-in. Clients own their data and code. Only recurring cost is hosting (~$20-50/month) and payment processing fees (M-Pesa: ~1%, Paystack: 1.5% + KES 30). 

## **1.1 Core Goals** 

- Zero platform/transaction fees beyond payment processor rates 

- Fully manageable by a non-technical client after handover 

- Reusable as a client template — rebrand, configure, deploy 

- Kenyan payment methods as first-class citizens (M-Pesa + Paystack) 

- Production-grade: secure, scalable, observable 

## **1.2 Tech Stack** 

|**Layer**|**Tool / Library**|**Notes**|
|---|---|---|
|**Commerce Engine**|**Medusa.js v2**|Open-source, API-first, modular — no<br>license fees|
|**Storefront**|**Next.js 15**|App Router, RSC, SSG/SSR — 40-60%<br>smaller JS bundles|
|**Database**|**PostgreSQL**|Primary data store via Medusa's built-in<br>ORM|
|**Cache / Queue**|**Redis (Upstash)**|Session cache, job queues, rate limiting|
|**Styling**|**TailwindCSS +**<br>**Shadcn/ui**|Utility-first CSS with accessible<br>components|
|**Search**|**MeiliSearch**|Self-hosted, fast, Medusa plugin available|
|**Media Storage**|**Cloudflare R2**|S3-compatible, cheap egress, global CDN|
|**Email**|**Resend**|Transactional email (orders, shipping,<br>auth)|
|**SMS**|**Africa's Talking**|Order SMS — Kenya-native, reliable|



Confidential  |  For Developer UsePage 

**Kenyan Ecommerce Platform** |  Project Specification v1.0 

|||delivery|
|---|---|---|
|**Analytics**|**PostHog + Metabase**|Storefront events + business DB<br>dashboards|
|**Payments (mobile)**|**M-Pesa Daraja API**|STK Push — custom Medusa provider|
|**Payments (card)**|**Paystack**|Cards + mobile money — community<br>plugin|
|**Frontend Hosting**|**Vercel**|Edge rendering, CI/CD from Git|
|**Backend Hosting**|**Railway**|Simple Medusa + PostgreSQL + Redis<br>deploy|
|**DNS / Proxy**|**Cloudflare**|SSL, DDoS protection, domain<br>management|



Confidential  |  For Developer UsePage 

**Kenyan Ecommerce Platform** |  Project Specification v1.0 

## **2. Build Phases** 

The project is split into 6 phases. Payment modules are intentionally last (Phase 6) after all commerce logic is stable and testable. 

|**Phase**|**Modules**|**Duration**|**Status**|
|---|---|---|---|
|**Phase 1**|Project Setup & Infrastructure|Week 1|**Upcoming**|
|**Phase 2**|Core Commerce Modules|Weeks 2–3|**Upcoming**|
|**Phase 3**|Storefront (Next.js)|Weeks 4–5|**Upcoming**|
|**Phase 4**|Admin, Analytics & Notifications|Week 6|**Upcoming**|
|**Phase 5**|Search, Media & Performance|Week 7|**Upcoming**|
|**Phase 6**|Payment Modules (M-Pesa +<br>Paystack)|Weeks 8–9|**Last**|



Confidential  |  For Developer UsePage 

**Kenyan Ecommerce Platform** |  Project Specification v1.0 

## **Phase 1 — Project Setup & Infrastructure** 

## **Goal** 

Establish the monorepo, configure all environments (local, staging, production), and wire up CI/CD before writing any feature code. 

## **1.1 Monorepo Structure** 

Use a single Git repository with the following top-level folders: 

|**Folder**|**Purpose**|
|---|---|
|**`/backend`**|Medusa.js v2 server — all commerce logic, APIs, custom<br>modules|
|**`/storefront`**|Next.js 15 app — customer-facing UI, pages, components|
|**`/backend/src/`**<br>**`modules/mpesa`**|Custom M-Pesa payment provider (Phase 6)|
|**`/backend/src/`**<br>**`modules/paystack`**|Paystack payment provider (Phase 6)|
|**`/backend/src/`**<br>**`modules/shipping`**|Custom shipping logic and courier integrations|
|**`/infra`**|Docker Compose, Nginx config, environment templates|
|**`/docs`**|API docs, ADRs, onboarding guide for client handover|



## **1.2 Package Manager — pnpm** 

This project uses pnpm instead of npm. pnpm is faster, uses less disk space, and has first-class monorepo support via workspaces. Almost every command is identical to npm — the main difference is pnpm add instead of npm install, and pnpm dlx instead of npx. 

## **First Time Setup** 

If you have never used pnpm before, install it once globally: npm install -g pnpm   then verify with: pnpm --version 

## **pnpm vs npm — Quick Reference** 

Confidential  |  For Developer UsePage 

**Kenyan Ecommerce Platform** |  Project Specification v1.0 

|**Action**|**npm (old)**|**pnpm (use this)**|
|---|---|---|
|Install all packages|`npm install`|**`pnpm install`**|
|Add a package|`npm install express`|**`pnpm add express`**|
|Add a dev package|`npm install -D`<br>`typescript`|**`pnpm add -D typescript`**|
|Remove a package|`npm uninstall express`|**`pnpm remove express`**|
|Run a script|`npm run dev`|**`pnpm dev`**|
|Run a one-off binary|`npx prisma migrate`|**`pnpm dlx prisma migrate`**|
|Run in one workspace|`(not built-in)`|**`pnpm --filter backend`**<br>**`dev`**|
|Add to one workspace|`(not built-in)`|**`pnpm --filter`**<br>**`storefront add axios`**|



## **Workspace Config — pnpm-workspace.yaml** 

Create this file at the root of the repo. It tells pnpm which folders are workspaces. Create it once, never touch it again. 

```
# pnpm-workspace.yaml
packages:
  - 'backend'
  - 'storefront'
```

## **Common Workspace Commands** 

|**Command**|**What it does**|
|---|---|
|**`pnpm install`**|Install packages for all workspaces at once|
|**`pnpm --filter backend dev`**|Run Medusa backend dev server only|
|**`pnpm --filter storefront dev`**|Run Next.js storefront dev server only|
|**`pnpm --filter backend add`**<br>**`@medusajs/medusa`**|Add package to backend only|
|**`pnpm --filter storefront add axios`**|Add package to storefront only|
|**`pnpm -r build`**|Build all workspaces — used in CI/CD pipeline|



Confidential  |  For Developer UsePage 

**Kenyan Ecommerce Platform** |  Project Specification v1.0 

## **1.3 Infrastructure Tasks** 

- Install pnpm globally: npm install -g pnpm 

- Initialise Git repo with a root package.json (name: ke-ecommerce, private: true) 

- Create pnpm-workspace.yaml at root declaring backend and storefront 

- Scaffold Medusa.js v2 backend: pnpm dlx create-medusa-app@latest backend 

- Scaffold Next.js 15 storefront: pnpm dlx create-next-app@latest storefront 

- Add TailwindCSS and Shadcn/ui to storefront 

- Configure .env files — create .env.example templates for each workspace 

- Set up Docker Compose at root for local PostgreSQL + Redis (avoids local installs) 

- Configure GitHub Actions CI — pnpm install, lint, type-check, test on every PR 

- Deploy staging environment: Railway (backend + DB) + Vercel (storefront) 

- Configure Cloudflare for DNS, SSL, and reverse proxying 

Confidential  |  For Developer UsePage 

**Kenyan Ecommerce Platform** |  Project Specification v1.0 

## **Phase 2 — Core Commerce Modules** 

## **Goal** 

Configure all built-in Medusa modules that form the commerce backbone. These are mostly configuration and extension, not custom code. 

## **2.1 Product Module** 

- Products with title, description, handle (slug), status (draft/published) 

- Product variants — size, colour, material with independent SKUs and pricing 

- Product categories and tags for storefront filtering 

- Product images — upload to Cloudflare R2, served via CDN 

- Product metadata — custom fields for client-specific attributes 

- Inventory tracking per variant per location 

## **2.2 Order Module** 

- Order lifecycle: pending → confirmed → processing → shipped → delivered → closed 

- Returns and refund workflows 

- Order notes and internal admin comments 

- Order cancellation with inventory re-stocking 

- Fulfilment tracking — manual entry or courier API webhook 

## **2.3 Customer Module** 

- Customer registration and login (email + password) 

- Address book — save multiple shipping addresses 

- Order history accessible from customer account 

- Customer groups for B2B pricing tiers (optional per client) 

## **2.4 Cart Module** 

- Persistent cart — survives page refresh and browser close 

- Guest checkout supported (no account required) 

- Cart-level discount codes and automatic promotions 

- Real-time shipping cost calculation at cart level 

- Tax calculation — VAT 16% (Kenya standard rate) 

Confidential  |  For Developer UsePage 

**Kenyan Ecommerce Platform** |  Project Specification v1.0 

## **2.5 Pricing Module** 

- Default price list in KES (Kenyan Shilling) 

- Customer-group-specific pricing for wholesale/B2B clients 

- Sale prices with start/end dates 

- Currency support: KES primary, USD optional for international 

## **2.6 Shipping Module** 

- Flat-rate shipping options configurable per client 

- Weight-based rate calculation 

- Free shipping threshold rule (e.g. free above KES 5,000) 

- Manual courier option — client enters tracking number after dispatch 

- Optional: Sendy or Fargo API integration for automated booking 

## **2.7 Promotions & Discounts** 

- Percentage and fixed-amount discount codes 

- Buy X Get Y promotions 

- Cart-level and product-level conditions 

- Usage limits per code and per customer 

Confidential  |  For Developer UsePage 

**Kenyan Ecommerce Platform** |  Project Specification v1.0 

## **Phase 3 — Storefront (Next.js 15)** 

## **Goal** 

Build the customer-facing storefront with Next.js 15 App Router. Focus on performance (Core Web Vitals), SEO, and a clean UX that a client can customise easily. 

## **3.1 Pages to Build** 

|**Page**|**Key Features**|
|---|---|
|**`Homepage /`**|Hero, featured products, categories, promotions banner|
|**`Category /c/[slug]`**|Product grid, filters (price, size, colour), pagination|
|**`Product /p/[handle]`**|Gallery, variant picker, add to cart, related products|
|**`Cart /cart`**|Line items, quantity edit, discount code, order summary|
|**`Checkout /checkout`**|Address, shipping method, payment selection, order review|
|**`Order Confirmation`**|Order number, summary, estimated delivery, continue shopping|
|**`Account /account`**|Dashboard, order history, address book, profile settings|
|**`Login / Register`**|Email+password auth, optional guest checkout flow|
|**`Search /search`**|MeiliSearch-powered instant results with filters|
|**`Static Pages`**|About, Contact, Returns Policy, Terms & Conditions|



## **3.2 Storefront Technical Requirements** 

- Static generation (SSG) for product and category pages — served from CDN edge 

- Incremental Static Regeneration (ISR) — revalidate pages on product updates 

- Server Components for data-fetching pages, Client Components for cart/checkout 

- next-seo — meta tags, Open Graph, structured data (JSON-LD) for all pages 

- Mobile-first responsive design — optimised for low-end Android devices common in Kenya 

- Optimised image delivery via next/image + Cloudflare R2 

Confidential  |  For Developer UsePage 

**Kenyan Ecommerce Platform** |  Project Specification v1.0 

## **Phase 4 — Admin, Analytics & Notifications** 

## **Goal** 

Give the client a simple interface to manage their store day-to-day and visibility into sales performance — without needing a developer. 

## **4.1 Medusa Admin Dashboard** 

Medusa v2 ships with a built-in admin UI. Configure and extend it for the client: 

- Products — add, edit, archive, manage variants and inventory 

- Orders — view, process, mark fulfilled, handle returns 

- Customers — view profiles, order history, add notes 

- Discounts — create and manage promotion codes 

- Shipping — configure rates and zones 

- Settings — store info, currencies, tax rates, staff accounts 

## **4.2 Analytics — PostHog (Storefront Behaviour)** 

- Pageview and session tracking on the storefront 

- Add-to-cart events, checkout funnel tracking 

- Product click-through and conversion rates 

- Geographic breakdown of visitors (useful for Kenya-specific insights) 

- Self-hosted option available to keep all data in-region 

## **4.3 Analytics — Metabase (Business Dashboard)** 

- Connect directly to PostgreSQL database 

- Pre-built dashboards: daily revenue, top products, order volume 

- Customer acquisition and retention metrics 

- Inventory low-stock alerts via scheduled queries 

- Exportable reports (CSV/PDF) for client presentations 

## **4.4 Notifications** 

- Resend — transactional emails: order confirmation, shipping update, password reset 

- Africa's Talking — SMS order confirmations and delivery updates (Kenya-native) 

- All notification templates customisable per client brand 

Confidential  |  For Developer UsePage 

**Kenyan Ecommerce Platform** |  Project Specification v1.0 

- Notification logs stored in DB for support/audit purposes 

Confidential  |  For Developer UsePage 

**Kenyan Ecommerce Platform** |  Project Specification v1.0 

## **Phase 5 — Search, Media & Performance** 

## **Goal** 

Ensure the storefront is fast, discoverable, and handles media efficiently. Kenyan users are often on mobile with variable connectivity. 

## **5.1 Search — MeiliSearch** 

- Self-hosted MeiliSearch instance (can run on Railway) 

- Medusa plugin syncs products to MeiliSearch index automatically 

- Instant search with typo tolerance — appears as user types 

- Searchable fields: product name, description, tags, category 

- Filterable: price range, category, availability 

- Highlighted search results with matched terms 

## **5.2 Media — Cloudflare R2** 

- Product images uploaded via Medusa Admin → stored in R2 

- Served via Cloudflare CDN — fast globally, zero egress fees 

- Image transformation via Cloudflare Images (resize, webp conversion) 

- Max upload size: 10MB per image, enforced server-side 

- Automatic alt-text field prompt in admin for SEO 

## **5.3 Performance Targets** 

|**Metric**|**Target**|**Tooling**|
|---|---|---|
|**Largest Contentful Paint (LCP)**|**< 2.5s**|Vercel Analytics|
|**First Input Delay (FID)**|**< 100ms**|PostHog / Lighthouse|
|**Cumulative Layout Shift (CLS)**|**< 0.1**|Lighthouse CI|
|**Page size (product page)**|**< 200KB JS**|Webpack Bundle Analyzer|
|**API response time (p95)**|**< 300ms**|Railway Metrics|
|**Uptime SLA**|**99.9%**|Better Uptime /<br>UptimeRobot|



Confidential  |  For Developer UsePage 

**Kenyan Ecommerce Platform** |  Project Specification v1.0 

## **Phase 6 — Payment Modules (M-Pesa + Paystack)** 

## **Why Last?** 

Payments are built last because they depend on a fully working order lifecycle. Testing payment flows requires a complete storefront, cart, and checkout — all of which must be stable before wiring up payment providers. 

## **6.1 M-Pesa — Custom Medusa Payment Provider** 

Built as a custom Medusa v2 payment module using the Safaricom Daraja API. 

## **STK Push Flow** 

- Customer selects M-Pesa at checkout and enters their phone number 

- Backend calls Daraja STK Push API — sends a payment prompt to customer's phone 

- Customer approves on their phone (enters M-Pesa PIN) 

- Safaricom sends a callback to our webhook endpoint with payment result 

- Backend confirms payment, updates order status to confirmed 

- Fallback: status polling endpoint for cases where callback is delayed 

## **M-Pesa Module Internals** 

- OAuth token management — auto-refresh Daraja access tokens 

- Idempotency — prevent duplicate STK Push requests for same order 

- Transaction code stored against order for reconciliation and receipts 

- Webhook signature validation — verify callbacks are from Safaricom 

- Sandbox environment for development and QA testing 

- Production switch via environment variable (no code changes needed) 

## **6.2 Paystack — Card & Additional Mobile Payments** 

Paystack handles Visa/Mastercard and supports M-Pesa via their mobile money layer. Uses the community Medusa-Paystack plugin as a base. 

- Redirect flow — customer sent to Paystack hosted page, returned after payment 

- Webhook handler — Paystack notifies backend on payment success/failure 

- Supported channels: card, mobile money, bank transfer 

- Test mode controlled via environment variable 

- Transaction reference stored against order for Paystack dashboard reconciliation 

Confidential  |  For Developer UsePage 

**Kenyan Ecommerce Platform** |  Project Specification v1.0 

## **6.3 Payment Testing Checklist** 

- M-Pesa STK Push — successful payment via Daraja sandbox 

- M-Pesa STK Push — customer cancels on phone (handles gracefully) 

- M-Pesa STK Push — callback timeout (polling fallback kicks in) 

- M-Pesa — duplicate request prevention (idempotency check) 

- Paystack — successful card payment 

- Paystack — failed card (insufficient funds) 

- Paystack — webhook replay attack (signature validation rejects it) 

- Full E2E: add to cart → checkout → M-Pesa → order confirmed → email sent 

Confidential  |  For Developer UsePage 

**Kenyan Ecommerce Platform** |  Project Specification v1.0 

## **7. Security Requirements** 

- All secrets in environment variables — never committed to Git 

- HTTPS enforced everywhere via Cloudflare SSL 

- Webhook endpoints validate signatures (Safaricom + Paystack) 

- Rate limiting on auth endpoints (login, register, password reset) 

- Input validation and sanitisation on all API endpoints 

- CORS configured to allow only the storefront domain 

- Admin panel behind separate subdomain with IP allowlist (optional) 

- Dependency audits in CI pipeline (pnpm audit) 

## **8. Client Handover Checklist** 

Before going live, ensure the following are complete: 

- Client has access to Medusa Admin with their own account 

- M-Pesa production credentials configured (Daraja live keys) 

- Paystack live keys configured and webhook URL registered 

- Custom domain pointed to Vercel and Railway 

- Email sender domain verified in Resend 

- Africa's Talking sender ID registered (can take 2–5 business days in Kenya) 

- Metabase dashboard shared with client login 

- Short screen recording walkthrough: add product, process order, view analytics 

- • README in /docs with credentials guide and common admin tasks 

## **9. Estimated Monthly Running Costs** 

|**Service**|**Est. Cost/Month**|**Notes**|
|---|---|---|
|Railway (backend + DB)|$20 – $35|Scales with traffic|
|Vercel (storefront)|Free – $20|Free tier covers most small<br>clients|
|Upstash Redis|Free – $10|Free tier generous for low traffic|
|Cloudflare R2|~$5|First 10GB free, $0.015/GB after|
|Resend (email)|Free – $20|3,000 emails/month free|
|Africa's Talking (SMS)|~$5 – $15|~KES 0.8 per SMS in Kenya|



Confidential  |  For Developer UsePage 

**Kenyan Ecommerce Platform** |  Project Specification v1.0 

|MeiliSearch (self-hosted)|$0|Runs on Railway, included<br>above|
|---|---|---|
|PostHog (analytics)|Free|1M events/month free (self-<br>hosted: $0)|
|**Total**|**$30 – $105/month**|Typical small-medium client|



## **Note on Payment Fees** 

M-Pesa charges are paid by the customer (standard Kenyan practice). Paystack charges 1.5% + KES 30 per transaction, capped at KES 2,000. These are not running costs for the client — they are deducted per transaction. 

_— End of Specification v1.0 —_ 

Next document: Phase 1 Module Build Guide 

Confidential  |  For Developer UsePage 

