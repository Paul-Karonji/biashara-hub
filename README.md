# Biashara Hub — Kenyan Ecommerce Platform Monorepo

Biashara Hub is a production-grade, open-source ecommerce platform tailored for the Kenyan market, featuring native M-Pesa payments, nationwide delivery options, automated SMS/email notifications, and MeiliSearch product indexing.

Built on **Medusa.js v2** (commerce backend) and **Next.js 15** (storefront) in a **pnpm monorepo**.

---

## Repository Structure

*   [`/backend`](file:///c:/Users/paul/Documents/Wik/biashara%20hub/backend): Headless commerce backend (Medusa v2), customized plugins, subscribers, and admin API.
*   [`/storefront`](file:///c:/Users/paul/Documents/Wik/biashara%20hub/storefront): Customer website (Next.js 15 App Router) styled with vanilla CSS.
*   [`/docs`](file:///c:/Users/paul/Documents/Wik/biashara%20hub/docs): Specifications, design guidelines, and phase build records.

---

## Getting Started

### Prerequisites
*   Node.js v20.x or later
*   pnpm v9.x or later (`npm install -g pnpm`)
*   Docker Desktop (for local PostgreSQL, Redis, and MeiliSearch)

### Installation & Run

1.  **Install Monorepo Dependencies**:
    ```bash
    pnpm install
    ```
2.  **Start Services via Docker**:
    ```bash
    docker compose up -d
    ```
3.  **Bootstrap Backend & Seed Data**:
    ```bash
    cd backend
    pnpm medusa db:migrate
    pnpm medusa exec src/migration-scripts/initial-data-seed.ts
    ```
4.  **Start Development Servers**:
    From the root directory:
    ```bash
    # Start backend (runs on http://localhost:9000 and admin on http://localhost:9000/app)
    pnpm --filter backend dev
    
    # Start storefront (runs on http://localhost:3000)
    pnpm --filter storefront dev
    ```

---

## Metabase Dashboards Reference

Metabase is configured in [`docker-compose.yml`](file:///c:/Users/paul/Documents/Wik/biashara%20hub/docker-compose.yml) to run on port `3001` and connect directly to the PostgreSQL database.

Below are the SQL queries to construct the 5 client dashboards when setting up Metabase dashboards at `http://localhost:3001`.

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
