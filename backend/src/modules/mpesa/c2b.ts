import axios from 'axios'
import { DARAJA_BASE_URL, DARAJA_ENDPOINTS } from './constants'
import { getAccessToken } from './token'

export interface C2BConfirmationPayload {
  TransactionType: string
  TransID: string
  TransTime: string
  TransAmount: string
  BusinessShortCode: string
  BillRefNumber?: string
  InvoiceNumber?: string
  OrgAccountBalance?: string
  ThirdPartyTransID?: string
  MSISDN: string
  FirstName?: string
  MiddleName?: string
  LastName?: string
}

/**
 * Register C2B Validation and Confirmation URLs with Safaricom.
 * This is a one-time operation per shortcode.
 */
export async function registerC2BUrls(): Promise<any> {
  const token = await getAccessToken()
  const env = process.env.MPESA_ENV === 'production' ? 'production' : 'sandbox'
  const baseUrl = DARAJA_BASE_URL[env]
  const shortcode = process.env.MPESA_SHORTCODE

  const payload = {
    ShortCode: shortcode,
    ResponseType: 'Completed',
    ConfirmationURL: process.env.MPESA_C2B_CONFIRMATION_URL,
    ValidationURL: process.env.MPESA_C2B_VALIDATION_URL,
  }

  console.log('Registering C2B URLs with Safaricom:', payload)

  try {
    const { data } = await axios.post(`${baseUrl}${DARAJA_ENDPOINTS.c2bRegister}`, payload, {
      headers: { Authorization: `Bearer ${token}` },
    })
    return data
  } catch (error: any) {
    const errorMsg = error.response?.data || error.message
    console.error('Failed to register C2B URLs:', errorMsg)
    throw new Error(`C2B Register URL Error: ${JSON.stringify(errorMsg)}`)
  }
}

/**
 * Attempts to match an incoming C2B payment payload to an existing order.
 * - For PayBill: matches BillRefNumber to Order display_id or Cart ID.
 * - For Till: returns null (customer must claim the payment via receipt code).
 */
export async function matchC2BPayment(
  payload: C2BConfirmationPayload,
  queryService: any
): Promise<{ matched: boolean; orderId?: string; error?: string }> {
  const { BillRefNumber, TransAmount } = payload

  // If there is no BillRefNumber (or if it is empty/till format), it cannot be matched automatically
  if (!BillRefNumber || BillRefNumber.trim() === '' || BillRefNumber.toLowerCase() === 'n/a') {
    return { matched: false }
  }

  const cleanedRef = BillRefNumber.replace(/\s/g, '').toUpperCase()

  try {
    // 1. Try to match cleanedRef against Order display_id (e.g. order number 1002)
    // Extract numbers from the reference if it's alphanumeric
    const numericMatch = cleanedRef.match(/\d+/)
    if (numericMatch) {
      const displayId = parseInt(numericMatch[0], 10)
      
      const { data: orders } = await queryService.graph({
        entity: 'order',
        fields: ['id', 'display_id', 'total'],
        filters: { display_id: displayId },
      })

      if (orders && orders.length > 0) {
        const order = orders[0]
        // Verify amount matches (with minor tolerance or exact match)
        // Note: TransAmount is in KES, order.total is in cents
        const amountCents = Math.round(parseFloat(TransAmount) * 100)
        
        // Allow payment within a small tolerance if needed, or exact match
        if (Math.abs(order.total - amountCents) <= 100) { // within 1 KES
          return { matched: true, orderId: order.id }
        } else {
          console.warn(`Matched display_id ${displayId} but amount mismatched. Order: ${order.total} cents, Received: ${amountCents} cents.`)
        }
      }
    }

    // 2a. Try to match cleanedRef against Order ID directly
    const { data: ordersById } = await queryService.graph({
      entity: 'order',
      fields: ['id', 'total'],
      filters: { id: cleanedRef }
    })

    if (ordersById && ordersById.length > 0) {
      const order = ordersById[0]
      const amountCents = Math.round(parseFloat(TransAmount) * 100)
      if (Math.abs(order.total - amountCents) <= 100) {
        return { matched: true, orderId: order.id }
      }
    }

    // 2b. Try to match cleanedRef against Cart ID directly
    const { data: ordersByCart } = await queryService.graph({
      entity: 'order',
      fields: ['id', 'total'],
      filters: { cart_id: cleanedRef }
    })

    if (ordersByCart && ordersByCart.length > 0) {
      const order = ordersByCart[0]
      const amountCents = Math.round(parseFloat(TransAmount) * 100)
      if (Math.abs(order.total - amountCents) <= 100) {
        return { matched: true, orderId: order.id }
      }
    }

    return { matched: false }
  } catch (err: any) {
    console.error('Error during C2B order matching:', err)
    return { matched: false, error: err.message }
  }
}
