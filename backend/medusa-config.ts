import { defineConfig, loadEnv } from '@medusajs/framework/utils'
import type { ModuleConfig } from '@medusajs/framework/types'

loadEnv(process.env.NODE_ENV || 'development', process.cwd())

// ── Core Medusa modules ─────────────────────────────────────────────────────
const modules: any = [

  { resolve: '@medusajs/product' },
  { resolve: '@medusajs/order' },
  { resolve: '@medusajs/cart' },
  { resolve: '@medusajs/customer' },
  { resolve: '@medusajs/inventory' },
  { resolve: '@medusajs/stock-location' },
  { resolve: '@medusajs/pricing' },
  { resolve: '@medusajs/promotion' },
  {
    resolve: '@medusajs/fulfillment',
    options: {
      providers: [
        {
          resolve: '@medusajs/fulfillment-manual',
          id: 'manual',
          options: {},
        },
      ],
    },
  },
  {
    resolve: '@medusajs/auth',
    options: {
      providers: [
        {
          resolve: '@medusajs/medusa/auth-emailpass',
          id: 'emailpass',
          options: {},
        },
      ],
    },
  },
  {
    resolve: '@medusajs/medusa/payment',
    options: {
      providers: [
        {
          resolve: './src/modules/mpesa/provider',
          id: 'mpesa',
          options: {},
        },
        {
          resolve: 'medusa-payment-paystack',
          id: 'paystack',
          options: {
            secret_key: process.env.PAYSTACK_SECRET_KEY,
          },
        },
      ],
    },
  },
  {
    resolve: './src/modules/mpesa',
  },
]

// ── MeiliSearch — only loaded when MEILISEARCH_HOST is explicitly set ────────
// Previously this was unconditionally pushed with a localhost fallback, meaning
// a missing MeiliSearch container would silently fail during startup or indexing.
// Now it only activates when the host env var is present.
if (process.env.MEILISEARCH_HOST) {
  modules.push({
    resolve: '@rokmohar/medusa-plugin-meilisearch',
    options: {
      config: {
        host: process.env.MEILISEARCH_HOST,
        apiKey: process.env.MEILISEARCH_KEY,
      },
      settings: {
        products: {
          indexSettings: {
            searchableAttributes: ['title', 'description', 'handle', 'tags'],
            filterableAttributes: ['categories', 'tags'],
          },
        },
      },
    },
  } as unknown as ModuleConfig)
} else if (process.env.NODE_ENV !== 'test') {
  console.info(
    '[Biashara Hub] MeiliSearch is disabled (MEILISEARCH_HOST not set). ' +
    'Product search will fall back to Medusa\'s default search.'
  )
}

// ── Cloudflare R2 S3 storage — only loaded when bucket details are provided ─
if (process.env.CLOUDFLARE_R2_BUCKET) {
  modules.push({
    resolve: '@medusajs/file',
    options: {
      providers: [
        {
          resolve: '@medusajs/file-s3',
          id: 's3',
          options: {
            file_url: process.env.CLOUDFLARE_R2_PUBLIC_URL || process.env.CLOUDFLARE_R2_ENDPOINT,
            bucket: process.env.CLOUDFLARE_R2_BUCKET,
            access_key_id: process.env.CLOUDFLARE_R2_ACCESS_KEY,
            secret_access_key: process.env.CLOUDFLARE_R2_SECRET_KEY,
            region: 'auto',
            endpoint: process.env.CLOUDFLARE_R2_ENDPOINT,
          },
        },
      ],
    },
  } as unknown as ModuleConfig)
}

export default defineConfig({
  projectConfig: {
    databaseUrl: process.env.DATABASE_URL,
    redisUrl: process.env.REDIS_URL,
    http: {
      storeCors: process.env.STORE_CORS || 'http://localhost:3000,http://127.0.0.1:3000',
      adminCors: process.env.ADMIN_CORS || 'http://localhost:9000,http://127.0.0.1:9000',
      authCors: process.env.AUTH_CORS || 'http://localhost:9000,http://localhost:3000,http://127.0.0.1:9000,http://127.0.0.1:3000',
      jwtSecret: process.env.JWT_SECRET!,
      cookieSecret: process.env.COOKIE_SECRET!,
    },
  },
  admin: {
    // Output to a plain (non-hidden) folder so it survives Render's upload step.
    // The folder is committed to git and served at runtime without a Vite re-build.
    outDir: './admin-build',
    disable: process.env.DISABLE_MEDUSA_ADMIN === 'true',
  },
  modules: modules as any,
})

