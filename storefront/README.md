# Biashara Hub — Storefront

Next.js App Router storefront for the Biashara Hub e-commerce platform.

> **Part of the monorepo** — see the [root README](../README.md) for full setup, architecture, and environment variable documentation.

---

## Stack

- **Next.js 15** (App Router, Server Components, Turbopack dev)
- **TypeScript 5.6**
- **Vanilla CSS** design system with CSS custom properties
- **Medusa JS SDK** (`@medusajs/js-sdk`) for cart, products, and orders

---

## Local Development

```bash
# From the monorepo root (recommended — starts both backend and storefront)
pnpm dev:storefront

# Or from this directory
pnpm dev
```

Storefront runs on **[http://localhost:3000](http://localhost:3000)**

---

## Environment Variables

Copy `.env.example` to `.env.local` and fill in the values:

```bash
cp .env.example .env.local
```

| Variable | Description |
|----------|-------------|
| `NEXT_PUBLIC_MEDUSA_BACKEND_URL` | Medusa API URL (e.g. `http://localhost:9000`) |
| `NEXT_PUBLIC_MEDUSA_PUBLISHABLE_KEY` | Publishable API key from Medusa Admin |
| `NEXT_PUBLIC_MPESA_TILL_NUMBER` | Business till number shown to customers |
| `NEXT_PUBLIC_POSTHOG_KEY` | PostHog project key (optional) |
| `NEXT_PUBLIC_POSTHOG_HOST` | PostHog host (optional) |

---

## Key Directories

```
src/
├── app/
│   ├── checkout/
│   │   ├── page.tsx                    # Checkout orchestrator (4-step flow)
│   │   └── components/
│   │       ├── CheckoutStepIndicator   # Progress bar component
│   │       ├── CheckoutSummary         # Right-column mini-cart
│   │       └── MpesaOverlay            # STK Push + Paystack redirect overlays
│   ├── shop/                           # Product listing
│   ├── p/[handle]/                     # Product detail page
│   ├── cart/                           # Cart page
│   ├── order/[id]/                     # Order confirmation + M-Pesa C2B verify
│   ├── account/                        # Customer account
│   └── wishlist/                       # Saved items
│
├── components/
│   ├── layout/Header.tsx               # Sticky nav with cart drawer trigger
│   ├── product/ProductCard.tsx         # Grid card with wishlist toggle
│   └── product/ProductDetailsClient    # PDP client component
│
├── context/
│   └── CartContext.tsx                 # Server-synced cart state
│
├── hooks/
│   └── useWishlist.ts                  # Shared localStorage wishlist (cross-component sync)
│
└── lib/
    ├── medusa.ts                       # Medusa SDK client
    ├── formatters.ts                   # formatKES() and other utils
    ├── analytics.ts                    # PostHog event wrappers
    └── metadata.ts                     # buildMetadata() SEO helper
```

---

## Scripts

```bash
pnpm dev          # Start dev server (Turbopack)
pnpm build        # Production build
pnpm start        # Start production server
pnpm lint         # ESLint
pnpm type-check   # tsc --noEmit
```

---

## Notes

- All amounts are stored and returned by Medusa in **KES cents** (integer). `formatKES(amount)` divides by 100 and formats.
- The checkout M-Pesa STK flow polls `/store/mpesa/status/:id` every 3 s for up to 120 s before timing out.
- Wishlist state is stored in `localStorage` under the key `"wishlist"`. The `useWishlist` hook uses a module-level subscriber set so all components (ProductCard, ProductDetailsClient, wishlist page) stay in sync without a Context provider.
