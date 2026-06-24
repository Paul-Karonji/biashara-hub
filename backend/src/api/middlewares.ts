import { defineMiddlewares } from '@medusajs/framework/http'
import type { MedusaNextFunction, MedusaRequest, MedusaResponse } from '@medusajs/framework'

// ── Safaricom Daraja IP Allowlist ─────────────────────────────────────────────
// These are Safaricom's published production API gateway IPs.
// In sandbox / development mode (MPESA_ENV !== 'production') the check is
// skipped so local ngrok / test callbacks are not blocked.
const SAFARICOM_PRODUCTION_IPS = new Set([
  '196.201.214.200',
  '196.201.214.206',
  '196.201.213.114',
  '196.201.214.207',
  '196.201.214.208',
  '196.201.213.44',
  '196.201.212.127',
  '196.201.212.138',
  '196.201.212.129',
  '196.201.212.136',
  '196.201.212.74',
  '196.201.212.69',
])

/**
 * Express-compatible middleware that validates the calling IP against
 * Safaricom's published production gateway IP list.
 *
 * In non-production environments (MPESA_ENV !== 'production'), the check
 * is bypassed so sandbox / local test callbacks work normally.
 */
function safaricomIpAllowlist(
  req: MedusaRequest,
  res: MedusaResponse,
  next: MedusaNextFunction
) {
  // Allow all traffic in sandbox / development environments
  if (process.env.MPESA_ENV !== 'production') {
    return next()
  }

  // Respect reverse-proxy headers (nginx, Cloudflare, etc.)
  const forwardedFor = req.headers['x-forwarded-for']
  const clientIp =
    (typeof forwardedFor === 'string' ? forwardedFor.split(',')[0] : forwardedFor?.[0])
      ?.trim() ??
    (req.socket?.remoteAddress ?? '')

  if (!SAFARICOM_PRODUCTION_IPS.has(clientIp)) {
    console.warn(`[MPesa Security] Rejected STK callback from unauthorized IP: ${clientIp}`)
    return res
      .status(403)
      .json({ ResultCode: 1, ResultDesc: 'Forbidden: IP not in Safaricom allowlist' })
  }

  return next()
}

export default defineMiddlewares({
  routes: [
    // ── Preserve raw request body for all webhook routes ─────────────────
    // Required for HMAC signature verification (Paystack) and correct
    // body parsing of Safaricom callbacks.
    {
      matcher: '/hooks/*',
      bodyParser: {
        preserveRawBody: true,
      },
      middlewares: [],
    },

    // ── Safaricom IP allowlist for the STK push callback ─────────────────
    // Only Safaricom's published production IPs may POST to this endpoint.
    // Unauthenticated spoofed callbacks can otherwise authorize payment
    // sessions without real payments being made.
    {
      matcher: '/hooks/mpesa/stk',
      middlewares: [safaricomIpAllowlist],
    },
  ],
})
