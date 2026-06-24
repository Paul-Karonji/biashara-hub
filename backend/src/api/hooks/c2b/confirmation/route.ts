import { MedusaRequest, MedusaResponse } from '@medusajs/framework'
import { matchC2BPayment, C2BConfirmationPayload } from '../../../../modules/mpesa/c2b'

export async function POST(req: MedusaRequest, res: MedusaResponse) {
  console.log('Received M-Pesa C2B Confirmation payload:', JSON.stringify(req.body))

  const payload = req.body as C2BConfirmationPayload
  if (!payload.TransID) {
    return res.status(200).json({ ResultCode: 1, ResultDesc: 'Missing TransID' })
  }

  const query = req.scope.resolve('query')
  const mpesaModuleService = req.scope.resolve('mpesa') as any
  const paymentModuleService = req.scope.resolve('payment')

  try {
    // 1. Log payment confirmation details to DB
    const paymentRecord = await mpesaModuleService.createMpesaC2bPayments({
      transaction_type: payload.TransactionType,
      trans_id: payload.TransID,
      trans_time: payload.TransTime,
      trans_amount: parseFloat(payload.TransAmount),
      business_short_code: payload.BusinessShortCode,
      bill_ref_number: payload.BillRefNumber || null,
      invoice_number: payload.InvoiceNumber || null,
      org_account_balance: payload.OrgAccountBalance || null,
      third_party_trans_id: payload.ThirdPartyTransID || null,
      msisdn: payload.MSISDN,
      first_name: payload.FirstName || null,
      middle_name: payload.MiddleName || null,
      last_name: payload.LastName || null,
      status: 'unmatched',
      order_id: null,
    })

    // 2. Attempt to match with an order using BillRefNumber (PayBill flow)
    const matchResult = await matchC2BPayment(payload, query)

    if (matchResult.matched && matchResult.orderId) {
      console.log(`C2B Confirmation matched with Order ID: ${matchResult.orderId}`)

      // Update payment record status
      await mpesaModuleService.updateMpesaC2bPayments({
        id: paymentRecord.id,
        status: 'matched',
        order_id: matchResult.orderId,
      })

      // Capture the payment linked to the order
      const { data: payments } = await query.graph({
        entity: 'payment',
        fields: ['id', 'amount', 'order_id'],
        filters: { order_id: matchResult.orderId } as any,
      })

      if (payments && payments.length > 0) {
        const payment = payments[0]
        console.log(`Capturing payment ${payment.id} for order ${matchResult.orderId}`)
        await paymentModuleService.capturePayment({
          payment_id: payment.id,
          amount: payment.amount,
        })
      } else {
        console.warn(`No payment records found directly for order ${matchResult.orderId}`)
      }
    } else {
      console.log(`C2B Confirmation for transaction ${payload.TransID} could not be matched automatically.`)
    }
  } catch (error: any) {
    console.error('Error processing C2B Confirmation:', error)
  }

  // Safaricom requires a success response
  return res.status(200).json({ ResultCode: 0, ResultDesc: 'Success' })
}
