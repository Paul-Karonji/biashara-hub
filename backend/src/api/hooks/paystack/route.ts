import { MedusaRequest, MedusaResponse } from '@medusajs/framework'
import { createHmac } from 'crypto'

export async function POST(req: MedusaRequest, res: MedusaResponse) {
  const paystackSignature = req.headers['x-paystack-signature'] as string
  const secretKey = process.env.PAYSTACK_SECRET_KEY

  if (!secretKey) {
    console.error('PAYSTACK_SECRET_KEY is not configured.')
    return res.status(500).json({ error: 'Server configuration error' })
  }

  // 1. Verify Signature using rawBody buffer if available
  const rawBody = (req as any).rawBody
  const payload = rawBody 
    ? (Buffer.isBuffer(rawBody) ? rawBody : Buffer.from(rawBody)) 
    : JSON.stringify(req.body)

  const hash = createHmac('sha512', secretKey)
    .update(payload)
    .digest('hex')

  if (hash !== paystackSignature) {
    console.warn('Paystack signature verification failed.')
    return res.status(401).json({ error: 'Invalid signature' })
  }

  const { event, data } = req.body as any
  console.log(`Received Paystack webhook event: ${event}`)

  const query = req.scope.resolve('query')
  const paymentModuleService = req.scope.resolve('payment')

  try {
    if (event === 'charge.success') {
      const reference = data.reference
      const amount = data.amount // in kobo/cents

      console.log(`Paystack payment successful for reference ${reference}: ${amount}`)

      // A. Try to find an order with this cart ID or reference
      let orders: any[] = []
      
      const { data: ordersById } = await query.graph({
        entity: 'order',
        fields: ['id', 'total'],
        filters: { id: reference } as any
      })

      if (ordersById && ordersById.length > 0) {
        orders = ordersById
      } else {
        const { data: links } = await query.graph({
          entity: 'order_cart',
          fields: ['order_id', 'cart_id'],
          filters: { cart_id: reference } as any
        })

        if (links && links.length > 0) {
          const { data: ordersByCart } = await query.graph({
            entity: 'order',
            fields: ['id', 'total'],
            filters: { id: links[0].order_id } as any
          })
          if (ordersByCart && ordersByCart.length > 0) {
            orders = ordersByCart
          }
        }
      }

      if (orders && orders.length > 0) {
        const order = orders[0]
        console.log(`Found order ${order.id} for reference ${reference}. Capturing payment...`)

        const { data: payments } = await query.graph({
          entity: 'payment',
          fields: ['id', 'amount', 'order_id'],
          filters: { order_id: order.id } as any,
        })

        if (payments && payments.length > 0) {
          await paymentModuleService.capturePayment({
            payment_id: payments[0].id,
            amount: payments[0].amount,
          })
        }
      } else {
        // B. If order not created yet, find the payment session matching reference and mark it authorized
        const { data: paymentSessions } = await query.graph({
          entity: 'payment_session',
          fields: [
            'id',
            'data',
            'provider_id',
            'payment_collection.id',
            'payment_collection.currency_code',
            'payment_collection.amount',
            'payment_collection.cart.id',
          ],
        })

        const matchingSession = paymentSessions.find(
          (s: any) =>
            s.id === reference ||
            s.data?.paystack_ref === reference ||
            s.payment_collection?.cart?.id === reference
        )

        if (matchingSession) {
          console.log(`Found payment session ${matchingSession.id} for reference ${reference}. Marking as authorized.`)
          await paymentModuleService.updatePaymentSession({
            id: matchingSession.id,
            currency_code: matchingSession.payment_collection?.currency_code || 'kes',
            amount: matchingSession.payment_collection?.amount || 0,
            data: {
              ...matchingSession.data,
              status: 'authorized',
              paystack_confirmed: true,
              paystack_ref: reference,
            },
          })
        } else {
          console.warn(`Could not map Paystack reference ${reference} to any order or cart session.`)
        }
      }
    } else if (event === 'charge.failed') {
      const reference = data.reference
      console.warn(`Paystack charge failed for reference: ${reference}`)
    }
  } catch (err: any) {
    console.error('Error handling Paystack webhook event:', err)
  }

  // Always return 200 to Paystack to acknowledge receipt
  return res.status(200).json({ status: 'success' })
}
