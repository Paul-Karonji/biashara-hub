import axios from 'axios'
import { DARAJA_BASE_URL, DARAJA_ENDPOINTS } from './constants'

interface TokenCache {
  token: string
  expiresAt: number
}

// ── In-memory fallback (single-process / dev) ────────────────────────────────
let inMemoryCache: TokenCache | null = null

// ── Redis client (cross-process, survives restarts) ──────────────────────────
// ioredis ships as a transitive dependency of @medusajs/framework.
// We lazily create a shared client so each worker shares a single connection.
// `null` means "not yet tried"; `false` means "unavailable — use in-memory".
let redisClient: any = null


const REDIS_TOKEN_KEY = 'mpesa:daraja_access_token'

function getRedisClient(): any {
  // Already resolved (client or false)
  if (redisClient !== null) return redisClient

  const redisUrl = process.env.REDIS_URL
  if (!redisUrl) {
    console.warn('[MPesa Token] REDIS_URL not set — falling back to in-memory token cache (single-process only).')
    redisClient = false
    return false
  }

  try {
    // ioredis is a guaranteed transitive dep via @medusajs/framework
    // eslint-disable-next-line @typescript-eslint/no-require-imports
    const Redis = require('ioredis')
    const client = new Redis(redisUrl, {
      lazyConnect: false,
      maxRetriesPerRequest: 1,
      enableReadyCheck: false,
      connectTimeout: 3000,
    })

    client.on('error', (err: Error) => {
      // Log but do not crash — in-memory cache serves as fallback
      console.warn('[MPesa Token] Redis connection error:', err.message)
    })

    redisClient = client
    return client
  } catch (e: any) {
    console.warn('[MPesa Token] ioredis unavailable, using in-memory token cache:', e.message)
    redisClient = false
    return false
  }
}

export async function getAccessToken(): Promise<string> {
  const client = getRedisClient()

  // ── 1. Try Redis (cross-process, survives restarts) ─────────────────────
  if (client) {
    try {
      const cached = await client.get(REDIS_TOKEN_KEY)
      if (cached) {
        return cached as string
      }
    } catch {
      // Redis read failed — continue to in-memory / fresh fetch
    }
  }

  // ── 2. Try in-memory (single-process only) ───────────────────────────────
  if (inMemoryCache && Date.now() < inMemoryCache.expiresAt) {
    return inMemoryCache.token
  }

  // ── 3. Fetch a fresh token from Safaricom Daraja ─────────────────────────
  const consumerKey = process.env.MPESA_CONSUMER_KEY
  const consumerSecret = process.env.MPESA_CONSUMER_SECRET
  const env = process.env.MPESA_ENV === 'production' ? 'production' : 'sandbox'

  if (!consumerKey || !consumerSecret) {
    throw new Error(
      'M-Pesa credentials (MPESA_CONSUMER_KEY, MPESA_CONSUMER_SECRET) are not set in the environment variables.'
    )
  }

  const credentials = Buffer.from(`${consumerKey}:${consumerSecret}`).toString('base64')
  const baseUrl = DARAJA_BASE_URL[env]

  try {
    const response = await axios.get(`${baseUrl}${DARAJA_ENDPOINTS.token}`, {
      headers: { Authorization: `Basic ${credentials}` },
    })

    const { access_token, expires_in } = response.data
    // Deduct 60 s as a safety buffer before the token actually expires
    const ttlMs = (parseInt(expires_in, 10) - 60) * 1000
    const expiresAt = Date.now() + ttlMs
    const ttlSeconds = Math.floor(ttlMs / 1000)

    // Update in-memory cache (always)
    inMemoryCache = { token: access_token, expiresAt }

    // Persist to Redis with a matching TTL (cross-process)
    if (client) {
      try {
        await client.set(REDIS_TOKEN_KEY, access_token, 'EX', ttlSeconds)
      } catch {
        // Redis write failure is non-fatal; in-memory cache is already set
      }
    }

    return access_token
  } catch (error: any) {
    const errorMsg = error.response?.data || error.message
    console.error('Failed to retrieve M-Pesa access token:', errorMsg)
    throw new Error(`M-Pesa Auth Error: ${JSON.stringify(errorMsg)}`)
  }
}
