import { MedusaRequest, MedusaResponse } from '@medusajs/framework'

export async function GET(req: MedusaRequest, res: MedusaResponse) {
  const { checkoutRequestId } = req.params
  // Optional cartId narrows the lookup to a single payment collection
  // avoiding a full-table scan over all M-Pesa sessions.
  const cartId = req.query?.cartId as string | undefined

  if (!checkoutRequestId) {
    return res.status(400).json({ error: 'Missing checkoutRequestId parameter.' })
  }

  const query = req.scope.resolve('query')

  try {
    let matchingSession: any = null

    // ── Fast path: cartId is known → fetch exactly one payment collection ──
    // Avoids scanning the entire payment_session table on every poll tick.
    if (cartId) {
      const { data: carts } = await query.graph({
        entity: 'cart',
        fields: [
          'id',
          'payment_collection.id',
          'payment_collection.payment_sessions.id',
          'payment_collection.payment_sessions.data',
          'payment_collection.payment_sessions.provider_id',
        ],
        filters: { id: cartId },
      })

      const cart = carts?.[0]
      const sessions = cart?.payment_collection?.payment_sessions || []
      matchingSession = sessions.find(
        (s: any) =>
          (s.provider_id === 'pp_mpesa_mpesa' || s.provider_id === 'mpesa') &&
          s.data?.checkout_request_id === checkoutRequestId
      )
    }

    // ── Slow fallback: cartId unknown (legacy callers) ────────────────────
    // NOTE: This performs a full table scan and will degrade under load.
    // All new callers should pass ?cartId=<cart_id> in the query string.
    if (!matchingSession) {
      console.warn(
        `[MPesa Status] No cartId provided for checkoutRequestId=${checkoutRequestId}. ` +
        'Falling back to full table scan — update the storefront to pass ?cartId= to this endpoint.'
      )
      const { data: paymentSessions } = await query.graph({
        entity: 'payment_session',
        fields: ['id', 'data', 'provider_id', 'payment_collection.id', 'payment_collection.cart.id'],
        filters: {
          provider_id: ['pp_mpesa_mpesa', 'mpesa'],
        },
      })

      matchingSession = paymentSessions.find(
        (s: any) => s.data?.checkout_request_id === checkoutRequestId
      )
    }

    if (!matchingSession) {
      return res.status(404).json({
        error: `Payment session with checkoutRequestId ${checkoutRequestId} not found.`,
      })
    }

    return await processSession(matchingSession)

    async function processSession(session: any) {
      const sessionData = session.data || {}
      const status = sessionData.status || 'pending'
      const mpesaConfirmed = !!sessionData.mpesa_confirmed

      let orderId: string | null = null
      // Resolve cartId from either the fast-path (already known) or the session payload
      const resolvedCartId = cartId ?? session.payment_collection?.cart?.id

      // If payment is confirmed, check whether an order already exists for this cart
      if ((mpesaConfirmed || status === 'authorized') && resolvedCartId) {
        const { data: orders } = await query.graph({
          entity: 'order',
          fields: ['id'],
          filters: { cart_id: resolvedCartId } as any,
        })
        if (orders && orders.length > 0) {
          orderId = orders[0].id
        }
      }

      return res.status(200).json({
        status,
        confirmed: mpesaConfirmed,
        order_id: orderId,
        mpesa_receipt_number: sessionData.mpesa_receipt_number || null,
      })
    }
  } catch (error: any) {
    console.error('Error fetching M-Pesa status:', error)
    return res.status(500).json({ error: error.message || 'Failed to retrieve M-Pesa payment status.' })
  }
}
