import { model } from '@medusajs/framework/utils'

const MpesaC2bPayment = model.define('mpesa_c2b_payment', {
  id: model.id().primaryKey(),
  transaction_type: model.text(),
  trans_id: model.text().unique(),    // Safaricom TransID (M-Pesa Receipt Number)
  trans_time: model.text(),
  trans_amount: model.number(),
  business_short_code: model.text(),
  bill_ref_number: model.text().nullable(), // For PayBill account reference matching
  invoice_number: model.text().nullable(),
  org_account_balance: model.text().nullable(),
  third_party_trans_id: model.text().nullable(),
  msisdn: model.text(),               // Customer phone number
  first_name: model.text().nullable(),
  middle_name: model.text().nullable(),
  last_name: model.text().nullable(),
  status: model.text(),               // 'matched' | 'unmatched' | 'flagged'
  order_id: model.text().nullable(),  // Linked Medusa Order ID once reconciled
})

export default MpesaC2bPayment
