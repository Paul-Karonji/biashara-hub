import { MedusaRequest, MedusaResponse } from '@medusajs/framework'

export async function GET(req: MedusaRequest, res: MedusaResponse) {
  const { checkoutRequestId } = req.params

  if (!checkoutRequestId) {
    return res.status(400).json({ error: 'Missing checkoutRequestId parameter.' })
  }

  const query = req.scope.resolve('query')

  try {
    // 1. Find the payment session matching the checkout request ID
    const { data: paymentSessions } = await query.graph({
      entity: 'payment_session',
      fields: [
        'id',
        'data',
        'provider_id',
        'payment_collection.id',
        'payment_collection.cart.id',
      ],
      filters: {
        provider_id: ['pp_mpesa_mpesa', 'mpesa'],
      },
    })

    const session = paymentSessions.find(
      (s: any) => s.data?.checkout_request_id === checkoutRequestId
    )

    if (!session) {
      const mpesaSessions = paymentSessions.filter((s: any) => s.provider_id === 'mpesa')
      const fallbackSession = mpesaSessions.find((s: any) => s.data?.checkout_request_id === checkoutRequestId)
      if (!fallbackSession) {
        return res.status(404).json({ error: `Payment session with checkoutRequestId ${checkoutRequestId} not found.` })
      }
      return processSession(fallbackSession)
    }

    return await processSession(session)

    async function processSession(matchingSession: any) {
      const sessionData = matchingSession.data || {}
      const status = sessionData.status || 'pending'
      const mpesaConfirmed = !!sessionData.mpesa_confirmed

      let orderId: string | null = null
      const cartId = matchingSession.payment_collection?.cart?.id

      // 2. If payment is confirmed, check if an order has already been created for this cart
      if ((mpesaConfirmed || status === 'authorized') && cartId) {
        const { data: orders } = await query.graph({
          entity: 'order',
          fields: ['id'],
          filters: { cart_id: cartId } as any,
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
