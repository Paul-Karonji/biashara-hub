import {
  AbstractPaymentProvider,
  PaymentSessionStatus,
  ModuleProvider,
  Modules,
} from '@medusajs/framework/utils'
import axios from 'axios'
import { DARAJA_BASE_URL, DARAJA_ENDPOINTS } from './constants'
import { getAccessToken } from './token'

// In-memory idempotency check for STK pushes: map cartId -> { checkoutRequestId, timestamp }
const stkPushMap = new Map<string, { checkoutRequestId: string; timestamp: number }>()

export class MpesaPaymentProvider extends AbstractPaymentProvider {
  static identifier = 'mpesa'
  protected configuration: any

  constructor(cradle: any, options: any) {
    // Call base constructor which is protected, but exposing public signature for ModuleProvider
    super(cradle, options)
    this.configuration = options
  }

  // Normalize phone number: strip non-digits (except leading +), prepend 254 if starts with 0 or 7/1 (9 digits)
  private normalizePhone(phone: string): string {
    const cleaned = phone.replace(/[^\d+]/g, '')
    if (cleaned.startsWith('+')) {
      return cleaned.replace('+', '')
    }
    if (cleaned.startsWith('0')) {
      return `254${cleaned.slice(1)}`
    }
    if ((cleaned.startsWith('7') || cleaned.startsWith('1')) && cleaned.length === 9) {
      return `254${cleaned}`
    }
    return cleaned
  }

  // Generate Daraja STK Push password and timestamp
  private getPasswordAndTimestamp() {
    const timestamp = new Date()
      .toISOString()
      .replace(/[^0-9]/g, '')
      .slice(0, 14) // YYYYMMDDHHmmss

    const shortcode = process.env.MPESA_SHORTCODE
    const passkey = process.env.MPESA_PASSKEY

    if (!shortcode || !passkey) {
      throw new Error('M-Pesa environment variables (MPESA_SHORTCODE, MPESA_PASSKEY) are not set.')
    }

    const password = Buffer.from(`${shortcode}${passkey}${timestamp}`).toString('base64')
    return { password, timestamp }
  }

  // ── STK Push ──────────────────────────────────────────────────
  async initiateSTKPush(phone: string, amount: number, cartId: string) {
    const normalizedPhone = this.normalizePhone(phone)
    
    // 1. Idempotency Check (Check if there is a pending request in the last 5 minutes)
    const existingRequest = stkPushMap.get(cartId)
    if (existingRequest && Date.now() - existingRequest.timestamp < 5 * 60 * 1000) {
      console.log(`STK Push already initiated for cart ${cartId} in the last 5 minutes. Returning cached checkoutRequestId: ${existingRequest.checkoutRequestId}`)
      return {
        CheckoutRequestID: existingRequest.checkoutRequestId,
        isDuplicate: true,
      }
    }

    const token = await getAccessToken()
    const { password, timestamp } = this.getPasswordAndTimestamp()
    const env = process.env.MPESA_ENV === 'production' ? 'production' : 'sandbox'
    const baseUrl = DARAJA_BASE_URL[env]
    const transactionType = process.env.MPESA_TRANSACTION_TYPE || 'CustomerPayBillOnline'
    const shortcode = process.env.MPESA_SHORTCODE

    // Amount in cents is converted to KES
    const KESAmount = Math.ceil(amount)

    const payload = {
      BusinessShortCode: shortcode,
      Password: password,
      Timestamp: timestamp,
      TransactionType: transactionType,
      Amount: KESAmount,
      PartyA: normalizedPhone,
      PartyB: shortcode, // For Till transactions in sandbox, PartyB is also the Shortcode
      PhoneNumber: normalizedPhone,
      CallBackURL: process.env.MPESA_CALLBACK_URL,
      AccountReference: cartId.slice(-12).toUpperCase(), // Safaricom limit: 12 chars for AccountReference
      TransactionDesc: `Biashara Hub order ${cartId.slice(-8)}`,
    }

    console.log('Sending STK Push request to Safaricom:', { ...payload, Password: '[REDACTED]' })

    try {
      const { data } = await axios.post(`${baseUrl}${DARAJA_ENDPOINTS.stkPush}`, payload, {
        headers: { Authorization: `Bearer ${token}` },
      })

      if (data.ResponseCode === '0') {
        // Cache request in idempotency map
        stkPushMap.set(cartId, {
          checkoutRequestId: data.CheckoutRequestID,
          timestamp: Date.now(),
        })
      }

      return data
    } catch (error: any) {
      const errorMsg = error.response?.data || error.message
      console.error('Failed to initiate STK Push:', errorMsg)
      throw new Error(`M-Pesa STK Push Error: ${JSON.stringify(errorMsg)}`)
    }
  }

  // ── Status Query ──────────────────────────────────────────────
  async querySTKStatus(checkoutRequestId: string) {
    const token = await getAccessToken()
    const { password, timestamp } = this.getPasswordAndTimestamp()
    const env = process.env.MPESA_ENV === 'production' ? 'production' : 'sandbox'
    const baseUrl = DARAJA_BASE_URL[env]
    const shortcode = process.env.MPESA_SHORTCODE

    const payload = {
      BusinessShortCode: shortcode,
      Password: password,
      Timestamp: timestamp,
      CheckoutRequestID: checkoutRequestId,
    }

    try {
      const { data } = await axios.post(`${baseUrl}${DARAJA_ENDPOINTS.stkQuery}`, payload, {
        headers: { Authorization: `Bearer ${token}` },
      })
      return data
    } catch (error: any) {
      const errorMsg = error.response?.data || error.message
      console.error('Failed to query STK Push status:', errorMsg)
      throw new Error(`M-Pesa STK Query Error: ${JSON.stringify(errorMsg)}`)
    }
  }

  // ── Medusa Payment Provider Interface ─────────────────────────
  async initiatePayment(input: any): Promise<any> {
    return {
      id: input.payment_session_id || 'mpesa_session',
      status: PaymentSessionStatus.PENDING,
      data: {
        status: 'pending',
        phone: input.phone || '',
        checkout_request_id: null,
      },
    }
  }

  async authorizePayment(paymentSession: any): Promise<any> {
    const mpesaConfirmed = paymentSession.data?.mpesa_confirmed || false
    return {
      status: mpesaConfirmed ? PaymentSessionStatus.AUTHORIZED : PaymentSessionStatus.PENDING,
      data: paymentSession.data || {},
    }
  }

  async capturePayment(paymentSession: any): Promise<any> {
    return { data: paymentSession.data || {} }
  }

  async cancelPayment(paymentSession: any): Promise<any> {
    return { data: paymentSession.data || {} }
  }

  async deletePayment(paymentSession: any): Promise<any> {
    return { data: paymentSession.data || {} }
  }

  async refundPayment(paymentSession: any, amount?: any): Promise<any> {
    return { data: paymentSession.data || {} }
  }

  async retrievePayment(paymentSession: any): Promise<any> {
    return { data: paymentSession.data || {} }
  }

  async updatePayment(input: any): Promise<any> {
    const session = await this.initiatePayment(input)
    return {
      data: session.data,
      status: session.status,
    }
  }

  async getPaymentStatus(paymentSession: any): Promise<any> {
    const mpesaConfirmed = paymentSession.data?.mpesa_confirmed || false
    return {
      status: mpesaConfirmed ? PaymentSessionStatus.AUTHORIZED : PaymentSessionStatus.PENDING
    }
  }

  async getWebhookActionAndData(payload: any): Promise<any> {
    return {
      action: 'not_supported',
    }
  }
}

export default ModuleProvider(Modules.PAYMENT, {
  services: [MpesaPaymentProvider],
})
