# Biashara Hub — Onboarding & Reference Manual

Welcome to the **Biashara Hub** project, a production-ready, open-source ecommerce solution customized for the Kenyan market. Built on top of **Medusa.js v2** (commerce backend) and **Next.js 15** (storefront), this repository is structured as a unified monorepo.

---

## 1. Monorepo Structure

The workspace uses **pnpm workspaces** to manage packages efficiently.
* **`/backend`**: The headless commerce backend containing databases schema, workflows, custom payment/fulfillment modules, and admin dashboard logic.
* **`/storefront`**: Customer-facing Next.js website optimized for speed, responsive mobile display, and SEO.
* **`/docs`**: Project manuals, architecture documentation, and configurations guides.

---

## 2. Local Development Setup

### Prerequisites
Make sure you have the following installed on your machine:
* **Node.js**: `v20.x` or later (LTS recommended)
* **pnpm**: `v9.x` or later (`npm install -g pnpm`)
* **Docker Desktop**: For running local databases without manual installation.

### Setup Instructions

1. **Install workspace dependencies**:
   ```bash
   pnpm install
   ```

2. **Start backing services (PostgreSQL, Redis, MeiliSearch)**:
   ```bash
   docker compose up -d
   ```

3. **Configure Environment Variables**:
   - Copy `.env.example` in `/backend` to `.env`.
   - Copy `.env.example` in `/storefront` to `.env`.

4. **Initialize Database and Seed Data**:
   ```bash
   cd backend
   pnpm medusa db:migrate
   pnpm medusa exec src/migration-scripts/initial-data-seed.ts
   ```

5. **Start Development Servers**:
   - Run both backend and storefront:
     ```bash
     pnpm dev:backend
     pnpm dev:storefront
     ```
   - Storefront will run on `http://localhost:3000`.
   - Backend API will run on `http://localhost:9000`.
   - Medusa Admin Panel will run on `http://localhost:9000/app`.

---

## 3. Project Configuration Reference

### Port Allocations
* **Storefront Dev**: `3000`
* **Medusa Backend & Admin API**: `9000`
* **PostgreSQL Database**: `5432`
* **Redis Cache**: `6379`
* **MeiliSearch Service**: `7700`

### Primary Currency and Tax Structure
* **Base Currency**: KES (Kenyan Shilling)
* **Secondary Currency**: USD
* **Standard VAT Rate**: 16% (Applied through default Kenya tax regions).

---

## 4. Operational Credentials Reference Guide

When moving from local sandbox to live production environments, update the following key configurations in your host parameters (e.g. Railway or Vercel dashboard variables):

| Service | Target Variables | Notes |
|---|---|---|
| **M-Pesa Daraja API** | `MPESA_CONSUMER_KEY`, `MPESA_CONSUMER_SECRET`, `MPESA_SHORTCODE`, `MPESA_PASSKEY` | Lipa Na M-Pesa Online STK Push keys. |
| **Paystack API** | `PAYSTACK_SECRET_KEY`, `PAYSTACK_PUBLIC_KEY` | For processing Card and alternative Mobile Money. |
| **Africa's Talking** | `AFRICASTALKING_API_KEY`, `AFRICASTALKING_USERNAME` | For order confirmation SMS. (Requires sender ID approval). |
| **Resend** | `RESEND_API_KEY` | Transactional email sender configuration. |
| **Cloudflare R2** | `CLOUDFLARE_R2_ACCESS_KEY`, `CLOUDFLARE_R2_SECRET_KEY`, `CLOUDFLARE_R2_BUCKET` | Egress-free CDN media hosting. |

---

## 5. Third-Party Service Setup Guides

### 5.1 Resend Domain Setup (Transactional Emails)
To configure transactional emails with Resend for `biasharahub.co.ke`:
1. **Create a Resend Account:** Sign up at [resend.com](https://resend.com).
2. **Add Domain:** Go to the Resend Dashboard &rarr; **Domains** &rarr; **Add Domain**. Enter `biasharahub.co.ke` and select your region.
3. **Configure DNS Records:** Resend will provide DNS records (DKIM, SPF, and MX/TXT records). Add these records to your domain's DNS manager (e.g., Cloudflare, GoDaddy, Namecheap):
   * Add the `TXT` records for DKIM verification.
   * Add the `TXT` record for SPF verification.
4. **Verify Domain:** Click **Verify** in the Resend dashboard. Once verified (usually takes 5-10 minutes), the status will change to `Verified`.
5. **Generate API Key:** Go to API Keys &rarr; **Create API Key**. Give it a descriptive name (e.g., `Biashara Hub Backend`) and select the permissions.
6. **Update Environment Variables:** Set `RESEND_API_KEY` in `backend/.env` with your new API key, and `SENDER_EMAIL` to a verified address (e.g., `orders@biasharahub.co.ke`).

### 5.2 Africa's Talking Sender ID Setup (SMS Notifications)
To configure SMS notifications with a custom Sender ID (e.g., `BIASHARA`) for Africa's Talking in Kenya:
1. **Create an Africa's Talking Account:** Register at [africastalking.com](https://africastalking.com) and access the Sandbox or Production dashboard.
2. **Request Sender ID:**
   * Go to **SMS** &rarr; **Sender IDs** &rarr; **Request Sender ID**.
   * Enter the requested Sender ID (exactly as desired, e.g., `BIASHARA`). Note: Must be alphanumeric and maximum 11 characters.
   * Select the target country (**Kenya**).
   * Upload the required documentation (usually a business registration certificate and a signed authorization letter on company letterhead).
3. **Await Approval:** The approval process typically takes 2&ndash;5 business days as mobile network operators (Safaricom, Airtel, Telkom) must whitelist the Sender ID.
4. **Update Environment Variables:** Once approved, set `AFRICASTALKING_SENDER_ID=BIASHARA` in `backend/.env`. (If not set or before approval, messages will fallback to the default numeric shortcode).

