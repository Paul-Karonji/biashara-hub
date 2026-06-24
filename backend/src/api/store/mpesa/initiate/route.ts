import { MedusaRequest, MedusaResponse } from '@medusajs/framework'
import { MpesaPaymentProvider } from '../../../../modules/mpesa/provider'

// ── In-process rate limiter ───────────────────────────────────────────────────
// Limits: max 3 STK pushes per phone per 5-min window, 1 per cart per 30 s.
// NOTE: This is per-process. In a multi-worker cluster add a Redis-backed limiter
// (e.g. rate-limiter-flexible) or an nginx `limit_req_zone` in front of this route.

const PHONE_WINDOW_MS = 5 * 60 * 1000 // 5 minutes
const PHONE_MAX_HITS = 3
const CART_COOLDOWN_MS = 30 * 1000 // 30 seconds

// phone -> sorted list of timestamps within the window
const phoneHits = new Map<string, number[]>()
// cart_id -> last request timestamp
const cartLastHit = new Map<string, number>()

/** Prune stale entries older than the window to prevent unbounded memory growth. */
function prunePhoneHits() {
  const cutoff = Date.now() - PHONE_WINDOW_MS
  for (const [phone, hits] of phoneHits) {
    const fresh = hits.filter((t) => t > cutoff)
    if (fresh.length === 0) phoneHits.delete(phone)
    else phoneHits.set(phone, fresh)
  }
}

export async function POST(req: MedusaRequest, res: MedusaResponse) {
  const { cart_id, phone } = req.body as { cart_id: string; phone: string }

  if (!cart_id || !phone) {
    return res.status(400).json({ error: 'Missing cart_id or phone number.' })
  }

  // ── Rate limiting ──────────────────────────────────────────────────────────
  const now = Date.now()

  // 1. Per-cart cooldown: prevent double-clicks and rapid re-submits
  const lastCart = cartLastHit.get(cart_id)
  if (lastCart && now - lastCart < CART_COOLDOWN_MS) {
    const retryAfterSec = Math.ceil((CART_COOLDOWN_MS - (now - lastCart)) / 1000)
    return res
      .status(429)
      .json({ error: `Please wait ${retryAfterSec}s before requesting another STK push for this order.` })
  }

  // 2. Per-phone window limit: prevent harassing arbitrary numbers with pushes
  prunePhoneHits()
  const normalizedPhone = phone.replace(/\s+/g, '')
  const hits = phoneHits.get(normalizedPhone) ?? []
  const recentHits = hits.filter((t) => t > now - PHONE_WINDOW_MS)
  if (recentHits.length >= PHONE_MAX_HITS) {
    console.warn(`[MPesa Rate Limit] Phone ${normalizedPhone} exceeded ${PHONE_MAX_HITS} STK pushes in 5 min.`)
    return res
      .status(429)
      .json({ error: 'Too many M-Pesa requests for this phone number. Please wait 5 minutes and try again.' })
  }

  // Record this request
  phoneHits.set(normalizedPhone, [...recentHits, now])
  cartLastHit.set(cart_id, now)

  const query = req.scope.resolve('query')
  const paymentModuleService = req.scope.resolve('payment')

  try {
    // 1. Fetch the cart and its payment sessions
    const { data: [cart] } = await query.graph({
      entity: 'cart',
      fields: [
        'id',
        'total',
        'currency_code',
        'payment_collection.id',
        'payment_collection.payment_sessions.id',
        'payment_collection.payment_sessions.provider_id',
        'payment_collection.payment_sessions.data',
      ],
      filters: { id: cart_id },
    })

    if (!cart) {
      return res.status(404).json({ error: `Cart with ID ${cart_id} not found.` })
    }

    let paymentSessions = (cart.payment_collection?.payment_sessions || []) as any[]
    
    let mpesaSession: any = paymentSessions.find(
      (session: any) => 
        session.provider_id === 'pp_mpesa_mpesa' || 
        session.provider_id === 'mpesa'
    )

    // Auto-create session if not yet present (handles race condition where
    // storefront calls /initiate before initiatePaymentSession has propagated)
    if (!mpesaSession) {
      console.log(`No M-Pesa session found for cart ${cart_id}. Auto-creating...`)
      try {
        const paymentCollection = cart.payment_collection
        if (!paymentCollection?.id) {
          return res.status(400).json({ error: 'No payment collection on cart. Please complete address and shipping first.' })
        }

        const newSession = await paymentModuleService.createPaymentSession(
          paymentCollection.id,
          { provider_id: 'pp_mpesa_mpesa', currency_code: cart.currency_code || 'kes', amount: cart.total || 0, data: {} }
        )
        mpesaSession = newSession
        console.log(`Auto-created M-Pesa session: ${newSession.id}`)
      } catch (sessionErr: any) {
        console.error('Failed to auto-create M-Pesa session:', sessionErr.message)
        return res.status(400).json({ error: 'Could not create M-Pesa payment session. Please go back to Payment step and re-select M-Pesa.' })
      }
    }

    // DB-backed idempotency: if this cart's session already has a recent STK attempt (within 5 min),
    // return the cached checkout_request_id without triggering a new push.
    // This is durable across server restarts unlike the in-memory stkPushMap in provider.ts.
    const lastAttemptAt = mpesaSession.data?.last_stk_attempt_at as number | undefined
    const cachedRequestId = mpesaSession.data?.checkout_request_id as string | undefined
    if (cachedRequestId && lastAttemptAt && Date.now() - lastAttemptAt < 5 * 60 * 1000) {
      console.log(`STK Push idempotency hit (DB) for cart ${cart_id}. Returning cached checkout_request_id.`)
      return res.status(200).json({
        checkout_request_id: cachedRequestId,
        merchant_request_id: (mpesaSession.data?.merchant_request_id as string | undefined) || null,
        is_duplicate: true,
      })
    }

    // 2. Resolve M-Pesa Provider (with constructor bypass for compilation)
    let mpesaProvider: any
    try {
      mpesaProvider = req.scope.resolve('pp_mpesa')
    } catch (e) {
      try {
        mpesaProvider = req.scope.resolve('pp_mpesa_mpesa')
      } catch (e2) {
        const ProviderClass = MpesaPaymentProvider as any
        mpesaProvider = new ProviderClass(req.scope, {})
      }
    }

    // 3. Initiate the STK Push
    //
    // UNIT CONVENTION:
    //   cart.total        → smallest currency unit (cents/subunits), e.g. 150000 = KES 1,500
    //   KESAmount         → whole Kenyan Shillings sent to Safaricom, e.g. 1500
    //   Safaricom returns → whole KES (e.g. 1500.00) in its callbacks
    //
    // The C2B matching code in c2b-verify/route.ts multiplies TransAmount * 100
    // to convert back to cents for comparison with order.total. Keep these consistent.
    const KESAmount = Math.ceil(cart.total / 100) // cents → whole KES
    const result = await mpesaProvider.initiateSTKPush(phone, KESAmount, cart.id)

    // 4. Update Medusa Payment Session with the CheckoutRequestID
    await paymentModuleService.updatePaymentSession({
      id: mpesaSession.id,
      currency_code: cart.currency_code || 'kes',
      amount: cart.total || 0,
      data: {
        ...mpesaSession.data,
        phone,
        checkout_request_id: result.CheckoutRequestID,
        merchant_request_id: result.MerchantRequestID,
        status: 'pending',
        last_stk_attempt_at: Date.now(), // persisted for DB-backed idempotency
      },
    })

    return res.status(200).json({
      checkout_request_id: result.CheckoutRequestID,
      merchant_request_id: result.MerchantRequestID,
      is_duplicate: !!result.isDuplicate,
    })
  } catch (error: any) {
    console.error('Error initiating M-Pesa payment session:', error)
    return res.status(500).json({ error: error.message || 'Failed to initiate M-Pesa payment session.' })
  }
}
