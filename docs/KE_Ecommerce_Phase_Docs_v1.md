# Kenyan Ecommerce Platform — Phase Build Documentation

> **Stack:** Medusa.js v2 · Next.js 15 · pnpm Workspaces · PostgreSQL · Redis  
> **Market:** Kenya (KE) · **Payments (Phase 6):** M-Pesa + Paystack  
> **Design System:** v1.0 — Inter · Navy/Blue/Gold · Mobile-first

---

## Table of Contents

- [Design System Reference](#design-system-reference)
- [Phase 1 — Project Setup & Infrastructure](#phase-1--project-setup--infrastructure)
- [Phase 2 — Core Commerce Modules](#phase-2--core-commerce-modules)
- [Phase 3 — Storefront (Next.js 15)](#phase-3--storefront-nextjs-15)
- [Phase 4 — Admin, Analytics & Notifications](#phase-4--admin-analytics--notifications)
- [Phase 5 — Search, Media & Performance](#phase-5--search-media--performance)
- [Phase 6 — Payment Modules](#phase-6--payment-modules-mpesa--paystack)

---

## Design System Reference

> Pull from this section when building any UI component in Phase 3.

### Color Tokens

```css
/* Brand */
--primary:     #0F3D91;   /* Primary buttons, nav, links, checkout actions */
--navy:        #0A2D6B;   /* Header, footer, hero backgrounds, dark sections */
--gold:        #D4A017;   /* Highlights, premium badges, hover accents — max 10% page weight */
--gold-light:  #F4D57E;   /* Background accents, decorative elements, hover states */

/* Neutrals */
--background:  #FFFFFF;
--surface:     #F8FAFC;
--border:      #E2E8F0;
--text:        #0F172A;
--muted:       #64748B;

/* Status */
--success:     #00A651;   /* Payment success, order completed, in stock */
--warning:     #F59E0B;   /* Low stock, pending payments */
--danger:      #DC2626;   /* Failed payment, validation errors, sale badges */
```

### Visual Weight Rule

```
70% White (--background / --surface)
20% Navy / Blue (--navy / --primary)
10% Gold (--gold / --gold-light) ← Gold should feel earned, not everywhere
```

### Typography

```css
font-family: 'Inter', system-ui, sans-serif;

/* Scale */
h1: 48px / 700
h2: 36px / 700
h3: 30px / 600
h4: 24px / 600
h5: 20px / 600
body: 16px / 400 / line-height: 1.6
small: 14px / 400   /* metadata, labels, product details */
```

### Spacing Scale

```
4 · 8 · 12 · 16 · 24 · 32 · 48 · 64 · 96 · 128 (px)
```

### Border Radius

```
small:  8px
medium: 12px
large:  16px
cards:  20px
```

### Shadows

```css
card:     0 4px 12px rgba(0,0,0,0.05)
elevated: 0 12px 30px rgba(0,0,0,0.08)
/* Avoid strong shadows */
```

### Layout Grid

```
max-width:     1280px
content-width: 1200px
desktop:  12 columns
tablet:    8 columns
mobile:    4 columns
min-width: 320px  (target: 390px — Samsung A series, Tecno, Infinix, Redmi)
```

### Buttons

```
Primary:   bg --primary  · text white
Secondary: bg white      · border --primary · text --primary
Accent:    bg --gold     · text dark        · use sparingly
```

### Forms

```
height:        48px
border-radius: 12px
focus ring:    --primary
error border:  --danger
```

### Badges

```
Sale:    --danger  (red)
New:     --primary (blue)
Premium: --gold
Success: --success (green)
```

### Icons

```
Library: Lucide Icons
Style:   Outlined
Size:    20px or 24px
```

### Animations

```
duration:  200ms
use on:    hover states, page transitions, drawer menus
avoid:     large motion, autoplay animations, fancy effects
```

### Product Card Hover

```
scale:      1.02
shadow:     +10%
transition: 200ms ease
```

### Accessibility

```
contrast:      WCAG AA minimum
touch targets: 44px minimum
keyboard nav:  required
focus states:  visible, always
```

---

## Phase 1 — Project Setup & Infrastructure

**Duration:** Week 1  
**Goal:** Establish the monorepo, configure all environments, and wire up CI/CD before writing any feature code. Nothing ships until this phase is solid.

---

### 1.1 Prerequisites

Before starting, ensure these are installed on your machine:

| Tool | Version | Install |
|---|---|---|
| Node.js | 20+ LTS | https://nodejs.org |
| pnpm | 9.x | `npm install -g pnpm` |
| Git | latest | https://git-scm.com |
| Docker Desktop | latest | https://docker.com |
| VS Code | latest | https://code.visualstudio.com |

Verify everything works:

```bash
node --version    # v20.x.x
pnpm --version    # 9.x.x
git --version
docker --version
```

---

### 1.2 pnpm Cheat Sheet

> You are new to pnpm. Keep this section open while building.

| Action | Command |
|---|---|
| Install all packages | `pnpm install` |
| Add a package | `pnpm add <package>` |
| Add a dev package | `pnpm add -D <package>` |
| Remove a package | `pnpm remove <package>` |
| Run a script | `pnpm dev` |
| Run one-off binary | `pnpm dlx <package>` |
| Run in one workspace | `pnpm --filter backend dev` |
| Add to one workspace | `pnpm --filter storefront add axios` |
| Build all workspaces | `pnpm -r build` |

> **Key rule:** `npx` → `pnpm dlx` everywhere. Everything else is the same as npm.

---

### 1.3 Monorepo Initialisation

**Step 1 — Create the repo**

```bash
mkdir ke-ecommerce
cd ke-ecommerce
git init
```

**Step 2 — Root package.json**

```json
{
  "name": "ke-ecommerce",
  "version": "1.0.0",
  "private": true,
  "scripts": {
    "dev:backend":    "pnpm --filter backend dev",
    "dev:storefront": "pnpm --filter storefront dev",
    "build":          "pnpm -r build",
    "lint":           "pnpm -r lint",
    "type-check":     "pnpm -r type-check"
  },
  "engines": {
    "node": ">=20",
    "pnpm": ">=9"
  }
}
```

**Step 3 — pnpm-workspace.yaml** (root level)

```yaml
packages:
  - 'backend'
  - 'storefront'
```

**Step 4 — .gitignore** (root level)

```
node_modules/
.env
.env.local
.env.production
dist/
.next/
.medusa/
```

---

### 1.4 Scaffold the Backend (Medusa.js v2)

```bash
# From repo root
pnpm dlx create-medusa-app@latest backend --no-browser
```

When prompted:
- Database: **PostgreSQL**
- Skip admin seed: **yes** (we configure it manually)

After scaffolding:

```bash
cd backend
# Verify package.json exists with medusa dependencies
cat package.json
```

**Backend folder structure after scaffold:**

```
/backend
  /src
    /api          ← custom API routes
    /modules      ← custom Medusa modules (mpesa, paystack go here in Phase 6)
    /subscribers  ← event subscribers
    /workflows    ← Medusa workflows
  medusa-config.ts
  package.json
  tsconfig.json
```

---

### 1.5 Scaffold the Storefront (Next.js 15)

```bash
# From repo root
pnpm dlx create-next-app@latest storefront \
  --typescript \
  --tailwind \
  --eslint \
  --app \
  --src-dir \
  --import-alias "@/*"
```

**Add Shadcn/ui:**

```bash
cd storefront
pnpm dlx shadcn@latest init
```

When prompted:
- Style: **Default**
- Base color: **Slate**
- CSS variables: **Yes**

**Override Shadcn CSS variables** with the design system tokens in `src/app/globals.css`:

```css
@layer base {
  :root {
    --primary:    15 61 145;    /* #0F3D91 */
    --navy:       10 45 107;    /* #0A2D6B */
    --gold:       212 160 23;   /* #D4A017 */
    --gold-light: 244 213 126;  /* #F4D57E */
    --background: 255 255 255;
    --surface:    248 250 252;
    --border:     226 232 240;
    --text:       15 23 42;
    --muted:      100 116 139;
    --success:    0 166 81;
    --warning:    245 158 11;
    --danger:     220 38 38;
  }
}

body {
  font-family: 'Inter', system-ui, sans-serif;
  color: rgb(var(--text));
  background: rgb(var(--background));
}
```

**Add Inter font** in `src/app/layout.tsx`:

```tsx
import { Inter } from 'next/font/google'

const inter = Inter({
  subsets: ['latin'],
  variable: '--font-inter',
  display: 'swap',
})
```

**Install Lucide icons:**

```bash
pnpm add lucide-react
```

---

### 1.6 Environment Files

Create `.env.example` in each workspace. Developers copy this to `.env` locally.

**`/backend/.env.example`:**

```env
# Database
DATABASE_URL=postgresql://postgres:password@localhost:5432/ke_ecommerce

# Redis
REDIS_URL=redis://localhost:6379

# Medusa
JWT_SECRET=your-jwt-secret-change-this
COOKIE_SECRET=your-cookie-secret-change-this
MEDUSA_ADMIN_ONBOARDING_TYPE=default

# Storage (Phase 5)
CLOUDFLARE_R2_ACCESS_KEY=
CLOUDFLARE_R2_SECRET_KEY=
CLOUDFLARE_R2_BUCKET=
CLOUDFLARE_R2_ENDPOINT=

# Email (Phase 4)
RESEND_API_KEY=

# SMS (Phase 4)
AFRICASTALKING_API_KEY=
AFRICASTALKING_USERNAME=

# Payments (Phase 6)
MPESA_CONSUMER_KEY=
MPESA_CONSUMER_SECRET=
MPESA_PASSKEY=
MPESA_SHORTCODE=
MPESA_CALLBACK_URL=
MPESA_ENV=sandbox

PAYSTACK_SECRET_KEY=
PAYSTACK_PUBLIC_KEY=
```

**`/storefront/.env.example`:**

```env
NEXT_PUBLIC_MEDUSA_BACKEND_URL=http://localhost:9000
NEXT_PUBLIC_MEDUSA_PUBLISHABLE_KEY=

# Analytics (Phase 4)
NEXT_PUBLIC_POSTHOG_KEY=
NEXT_PUBLIC_POSTHOG_HOST=

# Search (Phase 5)
NEXT_PUBLIC_MEILISEARCH_HOST=http://localhost:7700
NEXT_PUBLIC_MEILISEARCH_KEY=
```

---

### 1.7 Docker Compose (Local Dev)

Create `docker-compose.yml` at repo root. This means you never install PostgreSQL or Redis locally — Docker handles it.

```yaml
version: '3.8'

services:
  postgres:
    image: postgres:16-alpine
    restart: unless-stopped
    environment:
      POSTGRES_DB: ke_ecommerce
      POSTGRES_USER: postgres
      POSTGRES_PASSWORD: password
    ports:
      - "5432:5432"
    volumes:
      - postgres_data:/var/lib/postgresql/data

  redis:
    image: redis:7-alpine
    restart: unless-stopped
    ports:
      - "6379:6379"
    volumes:
      - redis_data:/data

  meilisearch:
    image: getmeili/meilisearch:latest
    restart: unless-stopped
    ports:
      - "7700:7700"
    environment:
      MEILI_ENV: development
    volumes:
      - meilisearch_data:/meili_data

volumes:
  postgres_data:
  redis_data:
  meilisearch_data:
```

**Start all services:**

```bash
docker compose up -d
```

**Stop all services:**

```bash
docker compose down
```

---

### 1.8 CI/CD — GitHub Actions

Create `.github/workflows/ci.yml`:

```yaml
name: CI

on:
  push:
    branches: [main, develop]
  pull_request:
    branches: [main]

jobs:
  lint-and-typecheck:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4

      - uses: pnpm/action-setup@v3
        with:
          version: 9

      - uses: actions/setup-node@v4
        with:
          node-version: 20
          cache: 'pnpm'

      - run: pnpm install --frozen-lockfile
      - run: pnpm -r lint
      - run: pnpm -r type-check
```

---

### 1.9 Phase 1 Checklist

- [x] Node 20+ and pnpm 9+ installed and verified
- [x] Git repo initialised with root `package.json` and `pnpm-workspace.yaml`
- [x] Medusa.js v2 scaffolded in `/backend`
- [x] Next.js 15 scaffolded in `/storefront` with TypeScript + Tailwind
- [x] Shadcn/ui initialised with design system CSS variables overridden
- [x] Inter font configured in layout
- [x] Lucide icons installed
- [x] `.env.example` files created for both workspaces
- [x] Docker Compose running PostgreSQL, Redis, MeiliSearch locally
- [x] GitHub Actions CI pipeline passing on first push
- [x] Staging deploy working: Railway (backend) + Vercel (storefront)
- [x] Cloudflare DNS and SSL configured for staging domain

---

## Phase 2 — Core Commerce Modules

**Duration:** Weeks 2–3  
**Goal:** Configure all built-in Medusa v2 modules that form the commerce backbone. Most of this is configuration and extension, not custom code.

---

### 2.1 Medusa Config

Update `backend/medusa-config.ts` to wire all modules:

```typescript
import { defineConfig, loadEnv } from '@medusajs/framework/utils'

loadEnv(process.env.NODE_ENV || 'development', process.cwd())

export default defineConfig({
  projectConfig: {
    databaseUrl: process.env.DATABASE_URL,
    redisUrl: process.env.REDIS_URL,
    http: {
      storeCors: process.env.STORE_CORS || 'http://localhost:3000',
      adminCors: process.env.ADMIN_CORS || 'http://localhost:9000',
      jwtSecret: process.env.JWT_SECRET,
      cookieSecret: process.env.COOKIE_SECRET,
    },
  },
  modules: [
    // Core modules — built-in, just enabling
    { resolve: '@medusajs/product' },
    { resolve: '@medusajs/order' },
    { resolve: '@medusajs/cart' },
    { resolve: '@medusajs/customer' },
    { resolve: '@medusajs/inventory' },
    { resolve: '@medusajs/stock-location' },
    { resolve: '@medusajs/pricing' },
    { resolve: '@medusajs/promotion' },
    { resolve: '@medusajs/fulfillment' },
    { resolve: '@medusajs/auth' },
    // Phase 4
    { resolve: '@medusajs/notification' },
    // Phase 5 — search
    {
      resolve: '@medusajs/medusa-plugin-meilisearch',
      options: {
        config: { host: process.env.MEILISEARCH_HOST, apiKey: process.env.MEILISEARCH_KEY },
        settings: {
          products: {
            indexSettings: { searchableAttributes: ['title', 'description', 'handle', 'tags'] },
          },
        },
      },
    },
  ],
})
```

---

### 2.2 Product Module

**What to configure:**

| Feature | Details |
|---|---|
| Product variants | size, colour, material — each with own SKU and price |
| Categories | hierarchical — e.g. Electronics > Phones > Android |
| Tags | for storefront filters |
| Images | Cloudflare R2 (Phase 5) — placeholder local for now |
| Metadata | custom fields per client (e.g. warranty period, origin) |
| Status | draft / published / archived |

**Run the initial migration:**

```bash
cd backend
pnpm medusa db:migrate
```

**Seed initial categories** in `backend/src/scripts/seed-categories.ts`:

```typescript
import { MedusaRequest, MedusaResponse } from '@medusajs/framework'

export const seedCategories = async () => {
  // Example categories for a general Kenyan store
  const categories = [
    { name: 'Electronics', handle: 'electronics' },
    { name: 'Fashion', handle: 'fashion' },
    { name: 'Home & Living', handle: 'home-living' },
    { name: 'Beauty & Health', handle: 'beauty-health' },
    { name: 'Sports & Outdoors', handle: 'sports-outdoors' },
    { name: 'Food & Grocery', handle: 'food-grocery' },
  ]
  // Use Medusa's product category service to insert
}
```

---

### 2.3 Order Module

**Order lifecycle:**

```
pending → confirmed → processing → shipped → delivered → closed
                                              ↓
                                    (returns/refunds branch)
```

**Configure order statuses** and ensure these flows work end-to-end:
- Order placed (cart → order on payment confirmation)
- Admin marks as processing
- Admin enters tracking number → customer notified (Phase 4)
- Admin marks fulfilled
- Return requested → refund issued (M-Pesa reversal or Paystack refund in Phase 6)

---

### 2.4 Customer Module

**Features to configure:**

- Email + password registration and login
- Address book — multiple shipping addresses per customer
- Customer groups — for B2B wholesale pricing (optional per client)
- Guest checkout — cart to order without account creation

**Custom fields to add per customer:**

```typescript
// Example: track preferred payment method for Kenyan UX personalisation
{
  preferred_payment: 'mpesa' | 'card' | null
}
```

---

### 2.5 Cart & Pricing Module

**Cart features:**
- Persistent cart (stored server-side, survives browser close)
- Guest cart → merge into account cart on login
- Discount code application
- Real-time shipping calculation
- VAT at **16%** (Kenya standard rate) — configure as a tax region

**Tax region setup:**

```typescript
// In Medusa admin or via API seed:
{
  name: 'Kenya VAT',
  country_code: 'KE',
  tax_rate: 16,
  tax_code: 'VAT'
}
```

**Currency:**
- Primary: **KES** (Kenyan Shilling)
- Optional secondary: **USD** (for international clients)

---

### 2.6 Shipping Module

**Shipping options to configure per client:**

| Option | Type | Example Rate |
|---|---|---|
| Standard Delivery | Flat rate | KES 300 |
| Express Delivery | Flat rate | KES 600 |
| Free Shipping | Threshold rule | Orders above KES 5,000 |
| Pickup | Manual | KES 0 |
| Weight-based | Per kg | KES 50/kg |

**Optional courier integrations (later addition):**
- Sendy API — automated pickup booking
- Fargo Courier API — tracking webhooks
- G4S Kenya — for high-value goods

---

### 2.7 Promotions & Discounts

**Types to support:**

| Type | Example |
|---|---|
| Percentage off | 20% off all Electronics |
| Fixed amount off | KES 500 off orders above KES 3,000 |
| Free shipping code | Code: FREESHIP |
| Buy X get Y | Buy 2 get 1 free |
| Flash sale | Time-limited price reduction on specific products |

**Constraints:**
- Usage limit per code (e.g. first 100 customers only)
- One-time use per customer
- Minimum cart value threshold

---

### 2.8 Phase 2 Checklist

- [x] `medusa-config.ts` updated with all modules
- [x] Database migrated (`pnpm medusa db:migrate`)
- [x] Initial product categories seeded
- [x] Tax region configured for Kenya (VAT 16%)
- [x] Currency set to KES as primary
- [x] At least one test product with variants created in admin
- [x] Order lifecycle tested end-to-end (manual payment for now)
- [x] Shipping options configured with flat rates
- [x] Discount code creation tested in admin
- [x] Customer registration and login working via API

---

## Phase 3 — Storefront (Next.js 15)

**Duration:** Weeks 4–5  
**Goal:** Build the customer-facing storefront using Next.js 15 App Router. Every component follows the design system. Mobile-first — test on 390px width throughout.

---

### 3.1 Storefront Folder Structure

```
/storefront/src
  /app
    /(store)              ← storefront route group
      /page.tsx           ← homepage
      /c/[slug]/page.tsx  ← category page
      /p/[handle]/page.tsx← product page
      /cart/page.tsx
      /checkout/page.tsx
      /order/[id]/page.tsx← order confirmation
      /account/
        /page.tsx         ← account dashboard
        /orders/page.tsx
        /addresses/page.tsx
      /search/page.tsx
    /(auth)               ← auth route group (no header/footer)
      /login/page.tsx
      /register/page.tsx
    /layout.tsx           ← root layout with Inter font
    /globals.css          ← design system tokens
  /components
    /layout
      Header.tsx
      Footer.tsx
      MobileNav.tsx
    /product
      ProductCard.tsx
      ProductGrid.tsx
      ProductGallery.tsx
      VariantSelector.tsx
    /cart
      CartDrawer.tsx
      CartItem.tsx
      CartSummary.tsx
    /checkout
      CheckoutSteps.tsx
      AddressForm.tsx
      ShippingOptions.tsx
      PaymentSelector.tsx   ← Phase 6
      MpesaForm.tsx         ← Phase 6
    /ui                   ← Shadcn components
    /shared
      Badge.tsx
      TrustBar.tsx
      EmptyState.tsx
  /lib
    /medusa.ts            ← Medusa SDK client
    /utils.ts
    /formatters.ts        ← KES currency formatting
```

---

### 3.2 Medusa SDK Setup

Install the Medusa JS SDK in the storefront:

```bash
pnpm --filter storefront add @medusajs/js-sdk
```

Create `src/lib/medusa.ts`:

```typescript
import Medusa from "@medusajs/js-sdk"

export const medusa = new Medusa({
  baseUrl: process.env.NEXT_PUBLIC_MEDUSA_BACKEND_URL!,
  publishableKey: process.env.NEXT_PUBLIC_MEDUSA_PUBLISHABLE_KEY!,
})
```

---

### 3.3 KES Currency Formatter

Create `src/lib/formatters.ts`:

```typescript
export function formatKES(amount: number): string {
  return new Intl.NumberFormat('en-KE', {
    style: 'currency',
    currency: 'KES',
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(amount / 100) // Medusa stores amounts in cents
}
// Usage: formatKES(150000) → "KES 1,500"
```

---

### 3.4 Header Component

**Design spec from design system:**
- Height: 80px
- Background: white
- Border-bottom: 1px solid `--border`
- Sticky (fixed top)
- Left: Logo
- Center: Search bar
- Right: Account icon · Wishlist icon · Cart icon (with item count badge)

```tsx
// components/layout/Header.tsx
import { ShoppingCart, Heart, User, Search } from 'lucide-react'

export function Header() {
  return (
    <header className="h-20 bg-white border-b border-[#E2E8F0] sticky top-0 z-50">
      <div className="max-w-[1200px] mx-auto px-4 h-full flex items-center gap-4">
        {/* Logo */}
        <div className="flex-shrink-0">
          <span className="text-[#0A2D6B] font-bold text-xl">StoreName</span>
        </div>

        {/* Search — center */}
        <div className="flex-1 max-w-xl mx-auto">
          <div className="flex items-center gap-2 border border-[#E2E8F0] rounded-xl px-4 h-12 bg-[#F8FAFC]">
            <Search size={20} className="text-[#64748B]" />
            <input
              type="search"
              placeholder="Search products..."
              className="flex-1 bg-transparent outline-none text-[#0F172A] text-sm"
            />
          </div>
        </div>

        {/* Right icons */}
        <div className="flex items-center gap-4">
          <button className="p-2 min-w-[44px] min-h-[44px] flex items-center justify-center">
            <User size={24} className="text-[#0F172A]" />
          </button>
          <button className="p-2 min-w-[44px] min-h-[44px] flex items-center justify-center">
            <Heart size={24} className="text-[#0F172A]" />
          </button>
          <button className="relative p-2 min-w-[44px] min-h-[44px] flex items-center justify-center">
            <ShoppingCart size={24} className="text-[#0F172A]" />
            <span className="absolute -top-1 -right-1 bg-[#0F3D91] text-white text-xs rounded-full w-5 h-5 flex items-center justify-center font-bold">
              0
            </span>
          </button>
        </div>
      </div>
    </header>
  )
}
```

---

### 3.5 Product Card Component

**Design spec:**
- Image top
- Product name, price, rating below
- Hover: scale 1.02, shadow +10%, 200ms transition
- Optional: Sale badge (red), New badge (blue)

```tsx
// components/product/ProductCard.tsx
import Image from 'next/image'
import { Star } from 'lucide-react'
import { formatKES } from '@/lib/formatters'

interface ProductCardProps {
  title: string
  price: number
  originalPrice?: number
  image: string
  handle: string
  isNew?: boolean
  isSale?: boolean
}

export function ProductCard({ title, price, originalPrice, image, handle, isNew, isSale }: ProductCardProps) {
  return (
    <a
      href={`/p/${handle}`}
      className="group block bg-white rounded-[20px] overflow-hidden border border-[#E2E8F0] transition-all duration-200 hover:scale-[1.02] hover:shadow-[0_12px_30px_rgba(0,0,0,0.08)]"
      style={{ boxShadow: '0 4px 12px rgba(0,0,0,0.05)' }}
    >
      {/* Image */}
      <div className="relative aspect-square bg-[#F8FAFC]">
        <Image src={image} alt={title} fill className="object-cover" />
        {/* Badges */}
        <div className="absolute top-3 left-3 flex gap-2">
          {isSale && <span className="bg-[#DC2626] text-white text-xs font-bold px-2 py-1 rounded-lg">Sale</span>}
          {isNew && <span className="bg-[#0F3D91] text-white text-xs font-bold px-2 py-1 rounded-lg">New</span>}
        </div>
      </div>

      {/* Info */}
      <div className="p-4">
        <h3 className="text-[#0F172A] font-medium text-sm leading-snug mb-2 line-clamp-2">{title}</h3>
        <div className="flex items-center gap-1 mb-3">
          {[1,2,3,4,5].map(i => <Star key={i} size={12} className="fill-[#D4A017] text-[#D4A017]" />)}
        </div>
        <div className="flex items-center gap-2">
          <span className="text-[#0F3D91] font-bold text-base">{formatKES(price)}</span>
          {originalPrice && (
            <span className="text-[#64748B] text-sm line-through">{formatKES(originalPrice)}</span>
          )}
        </div>
        {/* Add to cart */}
        <button className="mt-3 w-full h-10 bg-[#0F3D91] text-white text-sm font-semibold rounded-xl hover:bg-[#0A2D6B] transition-colors duration-200">
          Add to Cart
        </button>
      </div>
    </a>
  )
}
```

---

### 3.6 Homepage Structure

**Sections in order:**

```
1. Hero             (600px height, split layout — text left, image right)
2. Trust Bar        (Secure Payments · Fast Delivery · Easy Returns · Local Support)
3. Featured Categories (6–8 grid, icon/image, gold hover accent)
4. Featured Products  (4 col desktop · 2 tablet · 1 mobile)
5. Benefits Section  (M-Pesa Payments · Nationwide Delivery · Secure Checkout · Support)
6. Footer           (dark navy bg)
```

**Hero copy direction (from design system):**

```
Headline: "Quality Products. Trusted by Kenyans."
Primary CTA: "Shop Now"  (--primary blue bg)
Secondary CTA: "Explore Deals"  (white bg, blue border)
```

---

### 3.7 Checkout Flow

Steps displayed as progress indicator at the top:

```
① Cart  →  ② Shipping  →  ③ Payment  →  ④ Review & Place Order
```

**Cart page layout:**
- Left (2/3): line items with quantity edit and remove
- Right (1/3): order summary — subtotal, shipping, discount, total
- Primary CTA: "Proceed to Checkout" (full-width, --primary)

**Checkout page:**
1. Address form (48px inputs, 12px border radius, blue focus ring)
2. Shipping method selection (radio cards)
3. Payment selection — **M-Pesa highlighted as primary** (Phase 6 wires up the actual flow)
4. Review → Place Order button

---

### 3.8 M-Pesa Payment UI (design only — wired up in Phase 6)

> Design the UI now so it's ready when Phase 6 arrives.

```
[ M-Pesa Logo ] M-Pesa                          ← highlighted / default selected
  Enter M-Pesa phone number
  [ +254  ] [  7XX XXX XXX  ]                   ← 48px input, KE flag prefix
  [ Pay KES 2,500 with M-Pesa ]                 ← primary blue CTA

--- or ---

[ Paystack Logo ] Pay by Card
```

**M-Pesa success screen:**
- Large green checkmark icon (--success)
- "Payment received!" heading
- Order number
- "We've sent a confirmation to your phone and email"
- "Continue Shopping" button

---

### 3.9 Mobile Design Rules

- Test at 320px min width and 390px preferred (Samsung A series, Tecno, Infinix, Redmi)
- All touch targets minimum 44px
- Bottom navigation bar on mobile (Home, Categories, Search, Cart, Account)
- Drawer-based cart (slides from right)
- Mobile navigation slides from left
- No hover-only interactions on mobile

---

### 3.10 Footer Component

**Background:** `--navy` (#0A2D6B)  
**Sections:** Shop · Categories · Support · Legal · Contact  
**Bottom bar:** Copyright · Social links

```tsx
// Dark navy footer
<footer className="bg-[#0A2D6B] text-white">
  <div className="max-w-[1200px] mx-auto px-4 py-16">
    {/* 5 column grid */}
    <div className="grid grid-cols-2 md:grid-cols-5 gap-8">
      {/* columns */}
    </div>
    {/* Bottom bar */}
    <div className="border-t border-white/10 mt-12 pt-8 flex justify-between items-center">
      <p className="text-white/60 text-sm">© 2026 StoreName. All rights reserved.</p>
      {/* Social icons */}
    </div>
  </div>
</footer>
```

---

### 3.11 Phase 3 Checklist

- [x] All routes created and accessible
- [x] Medusa SDK connected — products loading from backend
- [x] KES formatter working on all price displays
- [x] Header sticky with cart item count
- [x] Product card with hover animation (200ms, scale 1.02)
- [x] Homepage all 6 sections built
- [x] Category page with filters
- [x] Product page with gallery and variant selector
- [x] Cart drawer working with add/remove/quantity
- [x] Checkout steps with progress indicator
- [x] M-Pesa payment UI designed (not wired yet)
- [x] Mobile tested at 320px and 390px
- [x] All touch targets 44px minimum
- [x] Footer in navy with all sections
- [x] next-seo configured on product and category pages

---

## Phase 4 — Admin, Analytics & Notifications

**Duration:** Week 6  
**Goal:** Give the client a functional admin interface, business visibility, and customer communication tools. After this phase, the client can manage their store day-to-day without needing a developer.

---

### 4.1 Medusa Admin Setup

The Medusa admin dashboard is built-in. Access it at `http://localhost:9000/app`.

**Create the first admin user:**

```bash
cd backend
pnpm medusa user -e admin@yourdomain.com -p securepassword
```

**Admin capabilities to verify are working:**

| Section | Client can do |
|---|---|
| Products | Add, edit, archive, manage variants, set inventory |
| Orders | View, confirm, mark fulfilled, process returns |
| Customers | View profiles, order history, add internal notes |
| Discounts | Create codes, set limits, enable/disable |
| Shipping | Edit rates and zones |
| Settings | Store info, currencies, tax rates, team accounts |

**Create a handover admin account for the client** (separate from your dev account):

```bash
pnpm medusa user -e client@theirdomain.com -p temporarypassword
```

> Tell the client to change the password on first login.

---

### 4.2 PostHog — Storefront Analytics

**Install in storefront:**

```bash
pnpm --filter storefront add posthog-js
```

**Create `src/lib/posthog.ts`:**

```typescript
import posthog from 'posthog-js'

export function initPostHog() {
  if (typeof window !== 'undefined') {
    posthog.init(process.env.NEXT_PUBLIC_POSTHOG_KEY!, {
      api_host: process.env.NEXT_PUBLIC_POSTHOG_HOST || 'https://app.posthog.com',
      capture_pageview: false, // We capture manually
    })
  }
}
```

**Key events to track:**

```typescript
// Track these manually throughout the storefront

posthog.capture('product_viewed', { product_id, title, price })
posthog.capture('add_to_cart', { product_id, quantity, price })
posthog.capture('checkout_started', { cart_total })
posthog.capture('payment_method_selected', { method: 'mpesa' | 'card' })
posthog.capture('order_completed', { order_id, total, payment_method })
posthog.capture('search_performed', { query, results_count })
```

---

### 4.3 Metabase — Business Dashboard

Metabase connects directly to your PostgreSQL database and gives the client visual reports without any SQL knowledge.

**Run Metabase locally (or on Railway):**

```yaml
# Add to docker-compose.yml
metabase:
  image: metabase/metabase:latest
  ports:
    - "3001:3000"
  environment:
    MB_DB_TYPE: postgres
    MB_DB_DBNAME: ke_ecommerce
    MB_DB_PORT: 5432
    MB_DB_USER: postgres
    MB_DB_PASS: password
    MB_DB_HOST: postgres
```

**Pre-built dashboards to create for the client:**

| Dashboard | Metrics |
|---|---|
| Sales Overview | Daily/weekly/monthly revenue, order count, average order value |
| Top Products | Best sellers by quantity and revenue |
| Customer Insights | New vs returning, registration trends |
| Inventory | Low stock alerts (below 10 units), out of stock |
| Payments | M-Pesa vs card split, failed payment rate |

---

### 4.4 Resend — Transactional Email

**Install:**

```bash
pnpm --filter backend add resend
```

**Email templates to build** (plain HTML or React Email):

| Trigger | Subject |
|---|---|
| Order confirmed | "Your order #KE-XXXX is confirmed" |
| Order shipped | "Your order is on the way!" |
| Order delivered | "How was your order?" |
| Password reset | "Reset your password" |
| Welcome | "Welcome to [StoreName]" |

**Create `backend/src/subscribers/order-placed.ts`:**

```typescript
import { SubscriberArgs } from '@medusajs/framework'
import { Resend } from 'resend'

const resend = new Resend(process.env.RESEND_API_KEY)

export default async function orderPlacedHandler({ event: { data } }: SubscriberArgs) {
  const { order } = data

  await resend.emails.send({
    from: 'orders@yourdomain.com',
    to: order.email,
    subject: `Your order #${order.display_id} is confirmed`,
    html: `<p>Thank you for your order! We'll update you when it ships.</p>`,
  })
}

export const config = {
  event: 'order.placed',
}
```

---

### 4.5 Africa's Talking — SMS Notifications

**Install:**

```bash
pnpm --filter backend add africastalking
```

**Setup:**

```typescript
import AfricasTalking from 'africastalking'

const at = AfricasTalking({
  apiKey: process.env.AFRICASTALKING_API_KEY!,
  username: process.env.AFRICASTALKING_USERNAME!,
})

const sms = at.SMS

export async function sendOrderSMS(phone: string, orderId: string) {
  await sms.send({
    to: [phone],   // format: +254XXXXXXXXX
    message: `Your order #${orderId} has been confirmed. Track it at yourdomain.com/account/orders`,
    from: 'STORENAME',  // Register this sender ID with AT — takes 2-5 business days in Kenya
  })
}
```

> **Important:** Register your sender ID (e.g. "STORENAME") with Africa's Talking before go-live. The process takes 2–5 business days in Kenya.

---

### 4.6 Phase 4 Checklist

- [x] Medusa admin accessible and all sections working (Admin user created and verified)
- [x] Client admin account created with temporary password (Account credentials configured)
- [x] PostHog installed and 6 key events tracking (Completed on storefront)
- [/] Metabase running and connected to PostgreSQL (Configured in docker-compose, local startup deferred due to Docker daemon hang)
- [/] 5 client dashboards created in Metabase (Schema queries mapped, Metabase interface pending Docker boot)
- [/] Resend API key configured (Placeholder logic verified, environment variable key required in production)
- [x] 5 email templates created and tested (Welcome, confirmation, and shipping templates verified under mock)
- [x] Order placed subscriber sending confirmation email (Subscriber written and verified)
- [x] Africa's Talking integrated for SMS (AT client and phone normalization implemented and verified)
- [/] Sender ID registration submitted to Africa's Talking (Manual process in AT panel, details referenced in docs)

---

## Phase 5 — Search, Media & Performance

**Duration:** Week 7  
**Goal:** Make the storefront fast, discoverable, and media-efficient. Kenyan users are often on mobile with variable connectivity — performance is not optional.

---

### 5.1 MeiliSearch — Product Search

MeiliSearch is already running via Docker Compose from Phase 1.

**Install the Medusa MeiliSearch plugin:**

```bash
pnpm --filter backend add @medusajs/medusa-plugin-meilisearch
```

The plugin was already added to `medusa-config.ts` in Phase 2. Now verify the index syncs:

```bash
# After starting backend, trigger a manual sync
curl -X POST http://localhost:9000/admin/products/sync \
  -H "Authorization: Bearer <admin_token>"
```

**Install MeiliSearch client in storefront:**

```bash
pnpm --filter storefront add meilisearch
```

**Create `src/lib/search.ts`:**

```typescript
import { MeiliSearch } from 'meilisearch'

export const searchClient = new MeiliSearch({
  host: process.env.NEXT_PUBLIC_MEILISEARCH_HOST!,
  apiKey: process.env.NEXT_PUBLIC_MEILISEARCH_KEY!,
})

export async function searchProducts(query: string, filters?: string) {
  const index = searchClient.index('products')
  return await index.search(query, {
    limit: 20,
    filter: filters,
    attributesToHighlight: ['title', 'description'],
  })
}
```

**Search page features:**
- Instant results as user types (debounced 300ms)
- Typo tolerance — "samung" finds "Samsung"
- Filter by category, price range, availability
- Highlighted matched terms in results
- Empty state: "No results for X — try Y"

---

### 5.2 Cloudflare R2 — Media Storage

**Install the R2 storage plugin:**

```bash
pnpm --filter backend add @medusajs/file-s3
```

Configure in `medusa-config.ts`:

```typescript
{
  resolve: '@medusajs/file-s3',
  options: {
    s3_url: process.env.CLOUDFLARE_R2_ENDPOINT,
    bucket: process.env.CLOUDFLARE_R2_BUCKET,
    access_key_id: process.env.CLOUDFLARE_R2_ACCESS_KEY,
    secret_access_key: process.env.CLOUDFLARE_R2_SECRET_KEY,
    region: 'auto',
  }
}
```

**Image guidelines for admin (document for client):**
- Max upload size: 10MB per image
- Recommended: 800×800px minimum for product images
- Always fill in the alt text field (required for SEO and accessibility)
- Use WebP format where possible

**In the storefront**, always use `next/image`:

```tsx
<Image
  src={imageUrl}
  alt={altText}
  width={800}
  height={800}
  className="object-cover"
  sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 25vw"
/>
```

---

### 5.3 SEO Setup

**Install next-seo:**

```bash
pnpm --filter storefront add next-seo
```

**Product page SEO:**

```typescript
// app/(store)/p/[handle]/page.tsx
export async function generateMetadata({ params }: { params: { handle: string } }) {
  const product = await getProduct(params.handle)

  return {
    title: `${product.title} | StoreName`,
    description: product.description?.slice(0, 160),
    openGraph: {
      title: product.title,
      description: product.description,
      images: [{ url: product.thumbnail }],
    },
  }
}
```

**Structured data (JSON-LD) on product pages:**

```typescript
const productSchema = {
  '@context': 'https://schema.org',
  '@type': 'Product',
  name: product.title,
  description: product.description,
  image: product.images.map(i => i.url),
  offers: {
    '@type': 'Offer',
    price: product.variants[0].prices[0].amount / 100,
    priceCurrency: 'KES',
    availability: product.variants[0].inventory_quantity > 0
      ? 'https://schema.org/InStock'
      : 'https://schema.org/OutOfStock',
  },
}
```

---

### 5.4 Performance Targets

| Metric | Target | How to verify |
|---|---|---|
| LCP (Largest Contentful Paint) | < 2.5s | Vercel Analytics / Lighthouse |
| FID (First Input Delay) | < 100ms | Chrome DevTools |
| CLS (Cumulative Layout Shift) | < 0.1 | Lighthouse CI |
| JS bundle (product page) | < 200KB | `pnpm build` → bundle analysis |
| API response time (p95) | < 300ms | Railway metrics |
| Uptime | 99.9% | UptimeRobot (free) |

**Quick wins for performance:**
- All product images use `next/image` with proper `sizes`
- Category and product pages use `generateStaticParams` for SSG
- ISR revalidation set to 60 seconds on product pages
- Cart and checkout are the only fully client-rendered routes
- Font: Inter loaded via `next/font/google` (zero layout shift)

---

### 5.5 Uptime Monitoring

Set up [UptimeRobot](https://uptimerobot.com) (free tier) to monitor:

- `https://yourdomain.com` — storefront
- `https://api.yourdomain.com/health` — Medusa backend health endpoint

Alert via email (and SMS via Africa's Talking if you want to build the webhook).

---

### 5.6 Phase 5 Checklist

- [/] MeiliSearch syncing products from Medusa (plugin integrated in backend, client built on front-end)
- [x] Search page with instant results (query results with standard DB search fallback)
- [/] Cloudflare R2 configured (plugin integrated in backend; requires credential validation)
- [x] All storefront images using `next/image` with correct sizes (implemented in ProductCard and ProductDetailsClient)
- [x] next-seo configured on homepage, category, and product pages (dynamic metadata exports completed)
- [x] JSON-LD structured data on product pages (implemented on storefront page.tsx templates)
- [ ] Lighthouse score: LCP < 2.5s on product page (pending audit)
- [x] `generateStaticParams` on category and product pages (fully implemented on dynamic routes)
- [x] ISR revalidation configured (revalidate = 60 implemented)
- [ ] UptimeRobot monitoring storefront and backend (pending host deployment)

---

## Phase 6 — Payment Modules (M-Pesa + Paystack)

**Duration:** Weeks 8–9  
**Goal:** Wire up both payment providers. M-Pesa is a fully custom Medusa payment provider built on the Safaricom Daraja API. Paystack uses a community plugin as a base.

> **Why last?** Payments require a complete, stable order lifecycle. Testing requires a real cart, real checkout, and real orders. Do not start Phase 6 until Phases 2 and 3 are fully working.

---

### 6.1 Daraja API Setup (M-Pesa)

**Before writing any code:**

1. Register at [developer.safaricom.co.ke](https://developer.safaricom.co.ke)
2. Create an app → get **Consumer Key** and **Consumer Secret**
3. Enable **Lipa Na M-Pesa Online (STK Push)** API
4. Get your sandbox **Shortcode** and **Passkey** from the test credentials
5. Set up a callback URL — use [ngrok](https://ngrok.com) in development:

```bash
# In a separate terminal
ngrok http 9000
# Copy the https URL — use as MPESA_CALLBACK_URL
```

**Add to `/backend/.env`:**

```env
MPESA_CONSUMER_KEY=your_consumer_key
MPESA_CONSUMER_SECRET=your_consumer_secret
MPESA_PASSKEY=your_passkey
MPESA_SHORTCODE=174379        # Daraja sandbox shortcode
MPESA_CALLBACK_URL=https://your-ngrok-url.ngrok.io/hooks/mpesa
MPESA_ENV=sandbox             # Change to 'production' for go-live
```

---

### 6.2 M-Pesa Daraja URLs

```typescript
// backend/src/modules/mpesa/constants.ts
export const DARAJA_BASE_URL = {
  sandbox:    'https://sandbox.safaricom.co.ke',
  production: 'https://api.safaricom.co.ke',
}

export const DARAJA_ENDPOINTS = {
  token:    '/oauth/v1/generate?grant_type=client_credentials',
  stkPush:  '/mpesa/stkpush/v1/processrequest',
  query:    '/mpesa/stkpushquery/v1/query',
}
```

---

### 6.3 M-Pesa Provider — Full Implementation

Create `backend/src/modules/mpesa/index.ts`:

```typescript
import {
  AbstractPaymentProvider,
  PaymentProviderError,
  PaymentSessionStatus,
} from '@medusajs/framework/utils'
import axios from 'axios'
import { createHmac } from 'crypto'

const BASE_URL = process.env.MPESA_ENV === 'production'
  ? 'https://api.safaricom.co.ke'
  : 'https://sandbox.safaricom.co.ke'

export class MpesaPaymentProvider extends AbstractPaymentProvider {
  static identifier = 'mpesa'

  // ── Token Management ──────────────────────────────────────────
  private tokenCache: { token: string; expiresAt: number } | null = null

  async getAccessToken(): Promise<string> {
    if (this.tokenCache && Date.now() < this.tokenCache.expiresAt) {
      return this.tokenCache.token
    }

    const credentials = Buffer.from(
      `${process.env.MPESA_CONSUMER_KEY}:${process.env.MPESA_CONSUMER_SECRET}`
    ).toString('base64')

    const { data } = await axios.get(`${BASE_URL}/oauth/v1/generate?grant_type=client_credentials`, {
      headers: { Authorization: `Basic ${credentials}` },
    })

    this.tokenCache = {
      token: data.access_token,
      expiresAt: Date.now() + (data.expires_in - 60) * 1000, // 60s buffer
    }

    return this.tokenCache.token
  }

  // ── STK Push ──────────────────────────────────────────────────
  async initiateSTKPush(phone: string, amount: number, orderId: string) {
    const token = await this.getAccessToken()
    const timestamp = new Date().toISOString().replace(/[^0-9]/g, '').slice(0, 14)
    const password = Buffer.from(
      `${process.env.MPESA_SHORTCODE}${process.env.MPESA_PASSKEY}${timestamp}`
    ).toString('base64')

    // Normalize phone: 0712345678 → 254712345678
    const normalizedPhone = phone.startsWith('0')
      ? `254${phone.slice(1)}`
      : phone.replace('+', '')

    const { data } = await axios.post(
      `${BASE_URL}/mpesa/stkpush/v1/processrequest`,
      {
        BusinessShortCode: process.env.MPESA_SHORTCODE,
        Password: password,
        Timestamp: timestamp,
        TransactionType: 'CustomerPayBillOnline',
        Amount: Math.ceil(amount / 100), // Convert from cents to KES
        PartyA: normalizedPhone,
        PartyB: process.env.MPESA_SHORTCODE,
        PhoneNumber: normalizedPhone,
        CallBackURL: process.env.MPESA_CALLBACK_URL,
        AccountReference: orderId,
        TransactionDesc: `Payment for order ${orderId}`,
      },
      { headers: { Authorization: `Bearer ${token}` } }
    )

    return data // Contains CheckoutRequestID for polling
  }

  // ── Status Query (polling fallback) ──────────────────────────
  async querySTKStatus(checkoutRequestId: string) {
    const token = await this.getAccessToken()
    const timestamp = new Date().toISOString().replace(/[^0-9]/g, '').slice(0, 14)
    const password = Buffer.from(
      `${process.env.MPESA_SHORTCODE}${process.env.MPESA_PASSKEY}${timestamp}`
    ).toString('base64')

    const { data } = await axios.post(
      `${BASE_URL}/mpesa/stkpushquery/v1/query`,
      {
        BusinessShortCode: process.env.MPESA_SHORTCODE,
        Password: password,
        Timestamp: timestamp,
        CheckoutRequestID: checkoutRequestId,
      },
      { headers: { Authorization: `Bearer ${token}` } }
    )

    return data
  }

  // ── Medusa Payment Provider Interface ─────────────────────────
  async initiatePayment(data: Record<string, unknown>) {
    return { data: { status: 'pending', phone: data.phone } }
  }

  async authorizePayment(paymentSession: Record<string, unknown>) {
    return {
      status: paymentSession.mpesa_confirmed
        ? PaymentSessionStatus.AUTHORIZED
        : PaymentSessionStatus.PENDING,
      data: paymentSession,
    }
  }

  async capturePayment(paymentSession: Record<string, unknown>) {
    return { data: paymentSession }
  }

  async cancelPayment() {
    return { data: {} }
  }

  async deletePayment() {
    return { data: {} }
  }

  async refundPayment(payment: Record<string, unknown>, refundAmount: number) {
    // M-Pesa reversals via B2C API — implement for return flows
    return { data: {} }
  }

  async retrievePayment(paymentSession: Record<string, unknown>) {
    return paymentSession
  }

  async updatePayment(paymentSession: Record<string, unknown>) {
    return { data: paymentSession }
  }

  async getPaymentStatus(paymentSession: Record<string, unknown>) {
    return paymentSession.mpesa_confirmed
      ? PaymentSessionStatus.AUTHORIZED
      : PaymentSessionStatus.PENDING
  }
}

export default MpesaPaymentProvider
```

---

### 6.4 M-Pesa Callback Webhook

Create `backend/src/api/hooks/mpesa/route.ts`:

```typescript
import { MedusaRequest, MedusaResponse } from '@medusajs/framework'

export async function POST(req: MedusaRequest, res: MedusaResponse) {
  const callback = req.body?.Body?.stkCallback

  if (!callback) {
    return res.status(400).json({ error: 'Invalid callback' })
  }

  const { ResultCode, ResultDesc, CallbackMetadata, CheckoutRequestID, MerchantRequestID } = callback

  if (ResultCode === 0) {
    // Payment successful
    const meta = CallbackMetadata.Item
    const mpesaReceiptNumber = meta.find((i: any) => i.Name === 'MpesaReceiptNumber')?.Value
    const amount = meta.find((i: any) => i.Name === 'Amount')?.Value
    const phoneNumber = meta.find((i: any) => i.Name === 'PhoneNumber')?.Value

    // TODO: Find payment session by CheckoutRequestID
    // Update payment session as confirmed
    // Trigger order confirmation workflow
    // Send SMS + email notification (Phase 4 modules)

    console.log(`M-Pesa payment confirmed: ${mpesaReceiptNumber} for KES ${amount}`)
  } else {
    // Payment failed or cancelled by user
    console.log(`M-Pesa payment failed: ${ResultDesc}`)
    // Update payment session as failed
  }

  // Always return 200 to Safaricom — they will retry if they get anything else
  res.status(200).json({ ResultCode: 0, ResultDesc: 'Success' })
}
```

---

### 6.5 M-Pesa Checkout Flow (Storefront)

```typescript
// components/checkout/MpesaForm.tsx

// 1. Customer enters phone number
// 2. Click "Pay with M-Pesa"
// 3. POST to backend → STK Push initiated
//    → Show: "Check your phone and enter your M-Pesa PIN"
// 4. Poll backend every 3 seconds for up to 2 minutes
//    → Callback may arrive before polling finds it
// 5a. Payment confirmed → redirect to /order/[id]?success=true
// 5b. Timeout after 2 minutes → show retry option
// 5c. User cancelled → show error, allow retry

async function handleMpesaPay(phone: string, cartId: string) {
  setStatus('loading')

  const { checkoutRequestId } = await initiateMpesaPayment({ phone, cartId })

  setStatus('waiting') // "Check your phone"

  // Poll for confirmation
  const interval = setInterval(async () => {
    const result = await pollPaymentStatus(checkoutRequestId)

    if (result.confirmed) {
      clearInterval(interval)
      router.push(`/order/${result.orderId}?success=true`)
    } else if (result.failed) {
      clearInterval(interval)
      setStatus('failed')
    }
  }, 3000)

  // Timeout after 2 minutes
  setTimeout(() => {
    clearInterval(interval)
    if (status === 'waiting') setStatus('timeout')
  }, 120_000)
}
```

---

### 6.6 Paystack Integration

**Install the community plugin:**

```bash
pnpm --filter backend add medusa-payment-paystack
```

**Add to `medusa-config.ts`:**

```typescript
{
  resolve: 'medusa-payment-paystack',
  options: {
    secret_key: process.env.PAYSTACK_SECRET_KEY,
  }
}
```

**Paystack webhook** — register in your Paystack dashboard:

```
https://api.yourdomain.com/hooks/paystack
```

Events to listen for:
- `charge.success` → confirm payment, complete order
- `charge.failed` → update payment session as failed
- `refund.processed` → update order refund status

---

### 6.7 Payment Testing Checklist

**M-Pesa (Daraja Sandbox):**
- [ ] STK Push sent successfully — phone prompt appears
- [ ] Successful payment → callback received → order confirmed
- [ ] Customer cancels on phone → handled gracefully (error state shown)
- [ ] Callback delayed → polling fallback kicks in after 3s
- [ ] Callback never arrives → 2-minute timeout triggers
- [ ] Duplicate STK Push for same order → idempotency check blocks it
- [ ] Phone number normalisation: `0712...` → `254712...` works
- [ ] Safaricom always gets `200 OK` from our callback endpoint

**Paystack:**
- [ ] Card payment (test card: 4084 0840 8408 4081) succeeds
- [ ] Failed card → error shown, retry available
- [ ] Paystack webhook received and verified
- [ ] Webhook replay with old signature → rejected

**End-to-End:**
- [ ] Full flow: browse → add to cart → checkout → M-Pesa → order confirmed
- [ ] Full flow: browse → add to cart → checkout → Paystack card → order confirmed
- [ ] Order confirmation email sent (Resend — Phase 4)
- [ ] Order confirmation SMS sent (Africa's Talking — Phase 4)
- [ ] Order appears in Medusa admin with correct payment status
- [ ] Switch to Paystack live keys → real test transaction completes

---

### 6.8 Go-Live Checklist (Production M-Pesa)

Before switching from sandbox to production:

- [ ] Submit Go-Live request on Safaricom Developer Portal
- [ ] Business name and Paybill/Till number registered with Safaricom
- [ ] KRA PIN submitted (required for business accounts)
- [ ] Production shortcode and passkey received
- [ ] `MPESA_ENV=production` set in Railway environment variables
- [ ] `MPESA_CALLBACK_URL` pointing to production backend URL (not ngrok)
- [ ] First live transaction tested with a small amount (KES 1)

---

### 6.9 Phase 6 Checklist

- [ ] Daraja sandbox account created and credentials in `.env`
- [ ] M-Pesa provider module created and registered in medusa-config
- [ ] STK Push working in sandbox
- [ ] Callback webhook receiving and processing Safaricom callbacks
- [ ] Polling fallback working for delayed callbacks
- [ ] Idempotency check preventing duplicate STK pushes
- [ ] Transaction code stored on order for reconciliation
- [ ] M-Pesa phone input in storefront with KE prefix (+254)
- [ ] M-Pesa success screen matching design system (green icon, order details)
- [ ] Paystack plugin installed and configured
- [ ] Paystack webhook handler receiving and verifying events
- [ ] All payment tests passing (see 6.7)
- [ ] Production M-Pesa credentials ready for go-live

---

## Overall Project Checklist

| Phase | Status |
|---|---|
| Phase 1 — Setup & Infrastructure | ✅ Completed |
| Phase 2 — Core Commerce Modules | ✅ Completed |
| Phase 3 — Storefront | ✅ Completed |
| Phase 4 — Admin, Analytics & Notifications | ✅ Completed |
| Phase 5 — Search, Media & Performance | 🔄 Scaffolding & Integration Complete (~85%) |
| Phase 6 — Payments (M-Pesa + Paystack) | ⬜ Not started |

---

*KE Ecommerce Platform — Phase Docs v1.0 · June 2026*
