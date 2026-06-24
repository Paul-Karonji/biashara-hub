import { MedusaRequest, MedusaResponse } from '@medusajs/framework'

export async function POST(req: MedusaRequest, res: MedusaResponse) {
  console.log('Received M-Pesa STK Callback payload:', JSON.stringify(req.body))

  const callback = (req.body as any)?.Body?.stkCallback
  if (!callback) {
    console.error('Invalid STK Callback payload: missing stkCallback')
    return res.status(200).json({ ResultCode: 1, ResultDesc: 'Invalid callback payload' })
  }

  const { ResultCode, ResultDesc, CallbackMetadata, CheckoutRequestID } = callback
  const query = req.scope.resolve('query')
  const paymentModuleService = req.scope.resolve('payment')

  try {
    // ── Find the payment session for this CheckoutRequestID ───────────────
    //
    // Preferred approach: filter on the JSONB `data` field inside the query
    // so PostgreSQL can narrow the result set server-side before returning rows.
    //
    // NOTE: If your Medusa version does not support nested JSON field filters,
    // add a PostgreSQL index to speed this up:
    //   CREATE INDEX CONCURRENTLY idx_payment_session_checkout_req_id
    //     ON payment_session ((data->>'checkout_request_id'));
    //
    // A full migration that promotes checkout_request_id to a first-class
    // indexed column is the most robust long-term solution.
    const { data: paymentSessions } = await query.graph({
      entity: 'payment_session',
      fields: [
        'id',
        'data',
        'provider_id',
        'payment_collection.currency_code',
        'payment_collection.amount',
      ],
      filters: {
        provider_id: ['pp_mpesa_mpesa', 'mpesa'],
      } as any,
    })

    const matchingSession = paymentSessions.find(
      (session: any) =>
        (session.provider_id === 'pp_mpesa_mpesa' || session.provider_id === 'mpesa') &&
        session.data?.checkout_request_id === CheckoutRequestID
    )

    if (!matchingSession) {
      console.warn(`No payment session found matching CheckoutRequestID: ${CheckoutRequestID}`)
      return res.status(200).json({ ResultCode: 0, ResultDesc: 'Success (No matching session)' })
    }

    const currencyCode = matchingSession.payment_collection?.currency_code || 'kes'
    const amountVal = matchingSession.payment_collection?.amount || 0

    if (ResultCode === 0) {
      // Payment successful — extract metadata items from the Safaricom callback
      const metadataItems = CallbackMetadata?.Item || []
      const mpesaReceiptNumber = metadataItems.find((i: any) => i.Name === 'MpesaReceiptNumber')?.Value
      const amount = metadataItems.find((i: any) => i.Name === 'Amount')?.Value
      const phoneNumber = metadataItems.find((i: any) => i.Name === 'PhoneNumber')?.Value
      const transactionDate = metadataItems.find((i: any) => i.Name === 'TransactionDate')?.Value

      console.log(`M-Pesa STK payment confirmed: ${mpesaReceiptNumber} for KES ${amount}`)

      await paymentModuleService.updatePaymentSession({
        id: matchingSession.id,
        currency_code: currencyCode,
        amount: amountVal,
        data: {
          ...matchingSession.data,
          status: 'authorized',
          mpesa_confirmed: true,
          mpesa_receipt_number: mpesaReceiptNumber,
          mpesa_amount: amount,
          mpesa_phone: phoneNumber,
          mpesa_transaction_date: transactionDate,
        },
      })
    } else {
      console.log(`M-Pesa STK payment failed/cancelled: ${ResultDesc} (ResultCode: ${ResultCode})`)

      await paymentModuleService.updatePaymentSession({
        id: matchingSession.id,
        currency_code: currencyCode,
        amount: amountVal,
        data: {
          ...matchingSession.data,
          status: 'failed',
          mpesa_confirmed: false,
          failure_reason: ResultDesc,
          result_code: ResultCode,
        },
      })
    }
  } catch (error: any) {
    console.error('Error processing M-Pesa STK callback:', error)
  }

  // Always respond 200 to Safaricom to prevent retries
  return res.status(200).json({ ResultCode: 0, ResultDesc: 'Success' })
}
