import { MedusaRequest, MedusaResponse } from '@medusajs/framework'

export async function POST(req: MedusaRequest, res: MedusaResponse) {
  const { order_id, trans_id } = req.body as { order_id: string; trans_id: string }

  if (!order_id || !trans_id) {
    return res.status(400).json({ error: 'Missing order_id or trans_id parameter.' })
  }

  const query = req.scope.resolve('query')
  const mpesaModuleService = req.scope.resolve('mpesa') as any
  const paymentModuleService = req.scope.resolve('payment')

  const cleanTransId = trans_id.trim().toUpperCase()

  try {
    // 1. Retrieve the C2B payment record from the database by TransID
    const payments = await mpesaModuleService.listMpesaC2bPayments({ trans_id: cleanTransId })
    
    if (!payments || payments.length === 0) {
      return res.status(200).json({ 
        matched: false, 
        status: 'not_found',
        message: 'Transaction reference code not found yet. Please ensure you have made the payment and typed the code correctly.'
      })
    }

    const paymentRecord = payments[0]

    // 2. Check if the payment record is already matched
    if (paymentRecord.status === 'matched') {
      if (paymentRecord.order_id === order_id) {
        return res.status(200).json({ 
          matched: true, 
          status: 'confirmed', 
          order_id: paymentRecord.order_id 
        })
      } else {
        return res.status(200).json({ 
          matched: false, 
          status: 'flagged',
          message: 'This transaction code has already been claimed by another order. If you believe this is an error, please contact customer support.'
        })
      }
    }

    // 3. Try matching against an Order ID or Order display_id
    const amountCents = Math.round(paymentRecord.trans_amount * 100)

    // A. Check if order_id is a valid order ID or display_id
    let order: any = null
    const displayId = parseInt(order_id, 10)
    if (!isNaN(displayId)) {
      const { data: orders } = await query.graph({
        entity: 'order',
        fields: ['id', 'display_id', 'total'],
        filters: { display_id: displayId } as any, // Cast display_id to filter type bypass
      })
      if (orders && orders.length > 0) order = orders[0]
    }

    if (!order) {
      const { data: orders } = await query.graph({
        entity: 'order',
        fields: ['id', 'display_id', 'total'],
        filters: { id: order_id } as any,
      })
      if (orders && orders.length > 0) order = orders[0]
    }

    if (order) {
      if (Math.abs(order.total - amountCents) <= 100) {
        // Successful match with Order!
        await mpesaModuleService.updateMpesaC2bPayments({
          id: paymentRecord.id,
          status: 'matched',
          order_id: order.id,
        })

        // Capture payment
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

        return res.status(200).json({
          matched: true,
          status: 'confirmed',
          order_id: order.id,
        })
      } else {
        // Amount mismatch
        await mpesaModuleService.updateMpesaC2bPayments({
          id: paymentRecord.id,
          status: 'flagged',
        })
        return res.status(200).json({
          matched: false,
          status: 'pending_review',
          message: `The amount paid (KES ${paymentRecord.trans_amount}) does not match the order total. This has been flagged for manual review.`
        })
      }
    }

    // B. Check if order_id is a Cart ID (user has not completed checkout yet)
    const { data: carts } = await query.graph({
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
      filters: { id: order_id },
    })

    if (carts && carts.length > 0) {
      const cart = carts[0]
      if (Math.abs(cart.total - amountCents) <= 100) {
        // Reconcile and match C2B to this Cart ID!
        await mpesaModuleService.updateMpesaC2bPayments({
          id: paymentRecord.id,
          status: 'matched',
          order_id: cart.id,
        })

        // Update cart payment session to authorized
        const paymentSessions = cart.payment_collection?.payment_sessions || []
        const mpesaSession = paymentSessions.find(
          (s: any) => s.provider_id === 'pp_mpesa_mpesa' || s.provider_id === 'mpesa'
        )

        if (mpesaSession) {
          await paymentModuleService.updatePaymentSession({
            id: mpesaSession.id,
            currency_code: cart.currency_code || 'kes',
            amount: cart.total || 0,
            data: {
              ...mpesaSession.data,
              status: 'authorized',
              mpesa_confirmed: true,
              mpesa_receipt_number: cleanTransId,
              mpesa_amount: paymentRecord.trans_amount,
              mpesa_phone: paymentRecord.msisdn,
            }
          })
        }

        return res.status(200).json({
          matched: true,
          status: 'confirmed',
          cart_id: cart.id,
        })
      } else {
        await mpesaModuleService.updateMpesaC2bPayments({
          id: paymentRecord.id,
          status: 'flagged',
        })
        return res.status(200).json({
          matched: false,
          status: 'pending_review',
          message: `The amount paid (KES ${paymentRecord.trans_amount}) does not match the cart total. This has been flagged for manual review.`
        })
      }
    }

    return res.status(200).json({
      matched: false,
      status: 'not_found',
      message: 'Could not match this transaction with any active checkout session or order.'
    })
  } catch (error: any) {
    console.error('Error verifying manual payment code:', error)
    return res.status(500).json({ error: error.message || 'Failed to verify transaction code.' })
  }
}
