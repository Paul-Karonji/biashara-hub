# Biashara Hub — Headless Kenyan Ecommerce Platform Monorepo

Biashara Hub is a production-grade, open-source headless ecommerce template customized specifically for the Kenyan market. It combines the headless commerce power of **Medusa.js v2** with a high-performance **Next.js 16 (App Router)** storefront in a **pnpm monorepo** architecture.

The platform is designed to eliminate high vendor platform fees and vendor lock-in, placing full ownership of transactional data, customer profiles, and source code in the hands of the business.

---

## 🚀 Key Features Implemented

*   **Native Kenyan Localisation:** Default currency set to **KES** (with USD fallback), standard tax regions configured to automatically apply **16% VAT**, and seeded regional category maps.
*   **Kenyan Payment Channels:** Native **Lipa Na M-Pesa STK Push** payment flow designed directly into the checkout screens (with Safaricom webhook integration ready).
*   **Transactional Notifications:** 
    *   **SMS (Africa's Talking):** Automatic order validation alerts and shipping updates with phone normalization logic (e.g. `07...` or `01...` to international `+254...`).
    *   **Email (Resend):** Fully styled HTML templates for user welcome notifications, order invoices, and shipping tracking receipts.
*   **Integrated Business Analytics:** 
    *   **Storefront Event Tracking:** PostHog captures customer conversion funnels (`product_viewed`, `add_to_cart`, `checkout_started`, `payment_method_selected`, `order_completed`, `search_performed`).
    *   **Metabase Dashboards:** Direct business intelligence database dashboards configured for inventory tracking, low stock alerts, revenue audits, and customer registrations.
*   **Search & Media Engine:** MeiliSearch typo-tolerant search queries and Cloudflare R2 egress-free media storage configurations pre-scaffolded.

---

## 📁 Repository Structure

```
/biashara-hub
├── package.json                 # Monorepo scripts & package workspaces definitions
├── pnpm-workspace.yaml          # pnpm package workspace bindings
├── docker-compose.yml           # Runs local Postgres, Redis, MeiliSearch, and Metabase
│
├── /backend                     # Medusa.js v2 Commerce Engine
│   ├── medusa-config.ts         # Medusa server module registrations & CORS setup
│   ├── /src
│   │   ├── /subscribers         # Event subscribers (customer-created, order-placed, order-shipped)
│   │   ├── /lib/sms.ts          # Africa's Talking API & phone number normalizer
│   │   └── /migration-scripts   # Kenyan store database seeding scripts
│   └── .env.example             # Template for payment keys, databases, & storage tokens
│
├── /storefront                  # Next.js 16 App Router customer-facing website
│   ├── /src/app                 # App routes (Shop, Cart, Checkout, Account)
│   ├── /src/components          # Styled Vanilla CSS design system components
│   └── /src/context             # React Context APIs (Cart state persistence)
│
└── /docs                        # Detailed specifications, guides, and checklists
    ├── design.md                # Inter Typography, Navy/Gold color weight guidelines
    ├── KE_Ecommerce_Spec_v1.md  # Architectural specification by build phase
    └── KE_Ecommerce_Phase_Docs_v1.md # Technical reference manual & checklist
```

---

## 🛠️ Local Development Setup

### 1. Prerequisites
Ensure you have the following installed on your machine:
*   **Node.js** v20.x or later (LTS recommended)
*   **pnpm** v9.x or later (`npm install -g pnpm`)
*   **Docker Desktop** (for PostgreSQL, Redis, and MeiliSearch containers)

### 2. Services Initialization
Clone the repository, install all dependencies, and spin up backing services inside local containers:
```bash
# Install workspace dependencies
pnpm install

# Start PostgreSQL, Redis, MeiliSearch, and Metabase containers
docker compose up -d
```

### 3. Environment Variables
1.  Navigate to `/backend`, copy `.env.example` to `.env`, and populate local configuration keys:
    ```bash
    cd backend
    cp .env.example .env
    ```
2.  Navigate to `/storefront`, copy `.env.example` to `.env`, and map local API hosts:
    ```bash
    cd ../storefront
    cp .env.example .env
    ```

### 4. Database Seeding & User Setup
Run Medusa migrations and execute the custom Kenyan seed script to populate default categories, product listings, shipping values, and VAT parameters:
```bash
cd ../backend

# Run migrations
pnpm medusa db:migrate

# Seed initial store data (KES currencies, Nairobi warehouse, 16% VAT, products)
pnpm medusa exec src/migration-scripts/initial-data-seed.ts

# Create your first Admin account for the dashboard
pnpm medusa user -e admin@biasharahub.co.ke -p yourSecurePassword
```

### 5. Running the Monorepo
Return to the root folder and boot up the API backend and storefront applications concurrently:
```bash
# From the root directory
pnpm dev:backend
pnpm dev:storefront
```
*   **Next.js Storefront:** [http://localhost:3000](http://localhost:3000)
*   **Medusa Engine Core:** [http://localhost:9000](http://localhost:9000)
*   **Medusa Admin Dashboard:** [http://localhost:9000/app](http://localhost:9000/app) *(Login using the admin credentials created in Step 4)*
*   **Metabase Dashboard Panel:** [http://localhost:3001](http://localhost:3001)

---

## 🩺 System Verification Checks
Before deploying code changes, run these checks to ensure codebase stability:
*   **Run Linter:** `pnpm run lint` *(Checks for code style anomalies)*
*   **Type Checker:** `pnpm run type-check` *(Validates TypeScript files compiles cleanly)*

---

## 🎨 Visual Identity & Spacing Rules
*   **Palette weights:** **70%** White background surfaces (`#FFFFFF` / `#F8FAFC`), **20%** Navy/Primary blue values (`#0A2D6B` / `#0F3D91`), and **10%** Accent Gold highlights (`#D4A017` / `#F4D57E`).
*   **Typographical rules:** Utilizes **Inter** font with a maximum content container layout width of `1200px` (tested down to `320px` responsive breakpoints).
*   **Micro-animations:** All button hover scales and drawer sliders use a standard **200ms ease** transition delay.

---

## 📊 Metabase Dashboard SQL Reference

Metabase runs on port `3001` and connects directly to the local PostgreSQL database. Use these pre-built SQL queries to populate the five default panels inside the Metabase dashboard interface:

<details>
<summary><b>Click to expand SQL queries</b></summary>

### 1. Sales Overview

#### Daily Revenue (Last 30 Days)
```sql
SELECT 
  DATE(created_at) AS order_date, 
  SUM(total) / 100.0 AS revenue_kes,
  COUNT(id) AS order_count
FROM "order"
WHERE created_at >= NOW() - INTERVAL '30 days'
  AND status != 'canceled'
GROUP BY DATE(created_at)
ORDER BY order_date DESC;
```

#### Order Status Breakdown
```sql
SELECT 
  status, 
  COUNT(id) AS order_count
FROM "order"
GROUP BY status;
```

#### Average Order Value (AOV)
```sql
SELECT 
  AVG(total) / 100.0 AS average_order_value_kes
FROM "order"
WHERE status != 'canceled';
```

---

### 2. Top Products

#### Best Sellers by Quantity
```sql
SELECT 
  title,
  SUM(quantity) AS total_quantity,
  SUM(unit_price * quantity) / 100.0 AS total_revenue_kes
FROM order_line_item
GROUP BY title
ORDER BY total_quantity DESC
LIMIT 10;
```

#### Best Sellers by Revenue
```sql
SELECT 
  title,
  SUM(quantity) AS total_quantity,
  SUM(unit_price * quantity) / 100.0 AS total_revenue_kes
FROM order_line_item
GROUP BY title
ORDER BY total_revenue_kes DESC
LIMIT 10;
```

---

### 3. Customer Insights

#### New vs Returning Customers
```sql
WITH customer_orders AS (
  SELECT 
    customer_id,
    COUNT(id) AS order_count
  FROM "order"
  WHERE customer_id IS NOT NULL
  GROUP BY customer_id
)
SELECT 
  CASE WHEN order_count > 1 THEN 'Returning' ELSE 'One-time' END AS customer_type,
  COUNT(customer_id) AS customer_count
FROM customer_orders
GROUP BY 1;
```

#### Customer Registrations Trend
```sql
SELECT 
  DATE(created_at) AS registration_date, 
  COUNT(id) AS registered_count
FROM customer
GROUP BY DATE(created_at)
ORDER BY registration_date DESC;
```

---

### 4. Inventory Alerts

#### Low Stock Items (Under 10 Units)
```sql
SELECT 
  ii.sku,
  pv.title AS variant_title,
  (il.stocked_quantity - il.reserved_quantity) AS available_quantity
FROM inventory_item ii
JOIN inventory_level il ON ii.id = il.inventory_item_id
LEFT JOIN product_variant_inventory_item pvii ON ii.id = pvii.inventory_item_id
LEFT JOIN product_variant pv ON pvii.variant_id = pv.id
WHERE (il.stocked_quantity - il.reserved_quantity) < 10
ORDER BY available_quantity ASC;
```

#### Out of Stock Count
```sql
SELECT 
  COUNT(*) AS out_of_stock_items
FROM inventory_item ii
JOIN inventory_level il ON ii.id = il.inventory_item_id
WHERE (il.stocked_quantity - il.reserved_quantity) <= 0;
```

---

### 5. Payments Split

#### M-Pesa vs Card Split (Lipa Na M-Pesa vs Paystack)
```sql
SELECT 
  CASE 
    WHEN provider_id LIKE '%mpesa%' THEN 'M-Pesa (STK Push)'
    WHEN provider_id LIKE '%paystack%' THEN 'Paystack (Card/Alternative)'
    ELSE 'Other / Default'
  END AS payment_method,
  COUNT(*) AS transaction_count,
  SUM(amount) / 100.0 AS total_amount_kes
FROM payment
GROUP BY 1;
```
</details>
