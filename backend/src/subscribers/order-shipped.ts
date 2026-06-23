import { SubscriberArgs } from "@medusajs/framework"
import { Resend } from "resend"
import { sendSMS } from "../lib/sms"

export default async function orderShippedHandler({
  event: { data },
  container,
}: SubscriberArgs<{ id: string }>) {
  const orderId = data.id
  const query = container.resolve("query")

  console.log(`[Subscriber] Handling order.shipment_created for order: ${orderId}`)

  try {
    // Query order and fulfillment details using Medusa v2 query helper
    const { data: [order] } = await query.graph({
      entity: "order",
      fields: [
        "id",
        "display_id",
        "email",
        "shipping_address.phone",
        "shipping_address.first_name",
        "shipping_address.last_name",
        "fulfillments.tracking_links.tracking_number",
        "fulfillments.tracking_links.carrier_name"
      ],
      filters: { id: orderId },
    })

    if (!order) {
      console.error(`[Subscriber] Order ${orderId} not found in database.`)
      return
    }

    if (!order.email) {
      console.warn(`[Subscriber] Order ${orderId} has no email address. Shipping notification email skipped.`)
      return
    }

    const resendApiKey = process.env.RESEND_API_KEY
    const senderEmail = process.env.SENDER_EMAIL || "orders@biasharahub.com"

    const customerName = `${order.shipping_address?.first_name || ""} ${order.shipping_address?.last_name || ""}`.trim() || "Customer"
    const orderDisplayId = order.display_id || order.id.slice(0, 8)
    
    // Find the tracking link details
    const trackingLink = (order.fulfillments?.[0] as any)?.tracking_links?.[0]
    const trackingNumber = trackingLink?.tracking_number || "TBD"
    const carrierName = trackingLink?.carrier_name || "our local delivery courier"

    // ── 1. Dispatch Email via Resend ──────────────────────────────────
    if (resendApiKey) {
      const resend = new Resend(resendApiKey)
      
      const emailHtml = `
        <!DOCTYPE html>
        <html lang="en">
        <head><meta charset="UTF-8"><meta name="viewport" content="width=device-width"></head>
        <body style="margin:0;padding:0;background:#F8FAFC;font-family:Arial,sans-serif;">
          <table width="100%" cellpadding="0" cellspacing="0" border="0" style="background:#F8FAFC;padding:24px 0;">
            <tr><td align="center">
              <table width="600" cellpadding="0" cellspacing="0" border="0" style="background:#ffffff;border-radius:12px;border:1px solid #E2E8F0;overflow:hidden;">
                <!-- Header -->
                <tr><td style="background:#0A2D6B;padding:24px 32px;">
                  <p style="margin:0;color:#F4D57E;font-size:11px;font-weight:bold;letter-spacing:2px;text-transform:uppercase;">Shipment Update</p>
                  <h1 style="margin:4px 0 0;color:#ffffff;font-size:20px;">Biashara Hub</h1>
                </td></tr>
                <!-- Body -->
                <tr><td style="padding:32px;">
                  <h2 style="color:#0A2D6B;margin:0 0 16px;">Your Order is On the Way! 🚚</h2>
                  <p style="color:#64748B;margin:0 0 8px;">Hi ${customerName},</p>
                  <p style="color:#64748B;margin:0 0 24px;">Your order <strong style="color:#0F172A;">#${orderDisplayId}</strong> has been shipped via <strong style="color:#0F172A;">${carrierName}</strong>.</p>
                  <!-- Tracking -->
                  <table width="100%" cellpadding="12" cellspacing="0" border="0" style="background:#F8FAFC;border:1px solid #E2E8F0;border-radius:8px;margin-bottom:24px;">
                    <tr><td style="font-size:11px;font-weight:bold;color:#64748B;text-transform:uppercase;letter-spacing:1px;">Tracking Number</td></tr>
                    <tr><td style="font-size:18px;font-weight:bold;color:#0F3D91;letter-spacing:1px;">${trackingNumber}</td></tr>
                  </table>
                  <p style="color:#64748B;font-size:12px;">If you have any questions about your delivery, please contact our support team in Nairobi.</p>
                </td></tr>
                <!-- Footer -->
                <tr><td style="background:#F8FAFC;padding:16px 32px;border-top:1px solid #E2E8F0;">
                  <p style="margin:0;font-size:11px;color:#94A3B8;text-align:center;">Biashara Hub &mdash; Trusted by Kenyans &bull; M-Pesa Payments &bull; Nationwide Delivery</p>
                </td></tr>
              </table>
            </td></tr>
          </table>
        </body></html>
      `

      console.log(`[Subscriber] Sending order shipped email for #${orderDisplayId} to ${order.email}...`)
      await resend.emails.send({
        from: senderEmail,
        to: order.email,
        subject: `Your order #${orderDisplayId} has been shipped! - Biashara Hub`,
        html: emailHtml,
      })
    } else {
      console.warn("[Subscriber] RESEND_API_KEY is not configured. Email notification skipped.")
    }

    // ── 2. Dispatch SMS via Africa's Talking ──────────────────────────
    const customerPhone = order.shipping_address?.phone
    if (customerPhone) {
      const smsMessage = `Good news! Your Biashara Hub order #${orderDisplayId} has been shipped via ${carrierName}. Tracking number: ${trackingNumber}.`
      console.log(`[Subscriber] Dispatching SMS for #${orderDisplayId} to ${customerPhone}...`)
      await sendSMS(customerPhone, smsMessage)
    } else {
      console.warn("[Subscriber] Customer shipping address has no phone number. SMS skipped.")
    }

  } catch (error) {
    console.error(`[Subscriber] Error processing order.shipment_created for ${orderId}:`, error)
  }
}

export const config = {
  event: "order.shipment_created",
}
