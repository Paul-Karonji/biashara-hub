import { SubscriberArgs } from "@medusajs/framework"
import { Resend } from "resend"
import { sendSMS } from "../lib/sms"

function formatKES(amount: number): string {
  return `KES ${new Intl.NumberFormat("en-KE").format(amount / 100)}`
}

export default async function orderPlacedHandler({
  event: { data },
  container,
}: SubscriberArgs<{ id: string }>) {
  const orderId = data.id
  const query = container.resolve("query")

  console.log(`[Subscriber] Handling order.placed for order: ${orderId}`)

  try {
    // Query order details using Medusa v2 query helper
    const { data: [order] } = await query.graph({
      entity: "order",
      fields: [
        "id",
        "display_id",
        "email",
        "total",
        "currency_code",
        "shipping_address.phone",
        "shipping_address.first_name",
        "shipping_address.last_name",
        "items.title",
        "items.quantity",
        "items.unit_price"
      ],
      filters: { id: orderId },
    })

    if (!order) {
      console.error(`[Subscriber] Order ${orderId} not found in database.`)
      return
    }

    if (!order.email) {
      console.warn(`[Subscriber] Order ${orderId} has no email address. Order confirmation email skipped.`)
      return
    }

    const resendApiKey = process.env.RESEND_API_KEY
    const senderEmail = process.env.SENDER_EMAIL || "orders@biasharahub.com"

    const customerName = `${order.shipping_address?.first_name || ""} ${order.shipping_address?.last_name || ""}`.trim() || "Customer"
    const orderDisplayId = order.display_id || order.id.slice(0, 8)
    const formattedTotal = formatKES(order.total)

    // ── Dispatch notifications concurrently ─────────────────────────────
    // Using Promise.allSettled so that an email failure does not prevent the
    // SMS from being sent and vice versa. Each result is logged individually.
    const notificationTasks: Promise<any>[] = []

    // ── 1. Email confirmation via Resend ─────────────────────────────────
    // Build the HTML email body before firing the concurrent tasks.
    const emailHtml = `
      <!DOCTYPE html>
      <html lang="en">
      <head><meta charset="UTF-8"><meta name="viewport" content="width=device-width"></head>
      <body style="margin:0;padding:0;background:#F8FAFC;font-family:Arial,sans-serif;">
        <table width="100%" cellpadding="0" cellspacing="0" border="0" style="background:#F8FAFC;padding:24px 0;">
          <tr><td align="center">
            <table width="600" cellpadding="0" cellspacing="0" border="0" style="background:#ffffff;border-radius:12px;border:1px solid #E2E8F0;overflow:hidden;">
              <tr><td style="background:#0A2D6B;padding:24px 32px;">
                <p style="margin:0;color:#F4D57E;font-size:11px;font-weight:bold;letter-spacing:2px;text-transform:uppercase;">Order Confirmed</p>
                <h1 style="margin:4px 0 0;color:#ffffff;font-size:20px;">Biashara Hub</h1>
              </td></tr>
              <tr><td style="padding:32px;">
                <h2 style="color:#0A2D6B;margin:0 0 16px;">Order Confirmed!</h2>
                <p style="color:#64748B;margin:0 0 8px;">Hi ${customerName},</p>
                <p style="color:#64748B;margin:0 0 24px;">Thank you for shopping at Biashara Hub. Your order <strong style="color:#0F172A;">#${orderDisplayId}</strong> has been successfully placed.</p>
                <table width="100%" cellpadding="8" cellspacing="0" border="0" style="border:1px solid #E2E8F0;border-radius:8px;margin-bottom:24px;">
                  <tr style="background:#F8FAFC;"><td style="font-size:11px;font-weight:bold;color:#64748B;text-transform:uppercase;letter-spacing:1px;">Item</td><td align="right" style="font-size:11px;font-weight:bold;color:#64748B;text-transform:uppercase;letter-spacing:1px;">Amount</td></tr>
                  ${order.items?.map((item: any) => `<tr><td style="font-size:13px;color:#0F172A;border-top:1px solid #E2E8F0;">${item.title} &times; ${item.quantity}</td><td align="right" style="font-size:13px;color:#0F3D91;font-weight:bold;border-top:1px solid #E2E8F0;">${formatKES(item.unit_price * item.quantity)}</td></tr>`).join('') || ''}
                  <tr style="background:#F8FAFC;"><td style="font-size:13px;font-weight:bold;color:#0F172A;border-top:2px solid #E2E8F0;">Total Paid</td><td align="right" style="font-size:15px;font-weight:bold;color:#0A2D6B;border-top:2px solid #E2E8F0;">${formattedTotal}</td></tr>
                </table>
                <p style="color:#64748B;font-size:12px;">We will send you tracking information as soon as your package is dispatched.</p>
              </td></tr>
              <tr><td style="background:#F8FAFC;padding:16px 32px;border-top:1px solid #E2E8F0;">
                <p style="margin:0;font-size:11px;color:#94A3B8;text-align:center;">Biashara Hub &mdash; Trusted by Kenyans &bull; M-Pesa Payments &bull; Nationwide Delivery</p>
              </td></tr>
            </table>
          </td></tr>
        </table>
      </body></html>
    `

    if (resendApiKey) {
      const resend = new Resend(resendApiKey)
      notificationTasks.push(
        resend.emails
          .send({
            from: senderEmail,
            to: order.email,
            subject: `Your order #${orderDisplayId} is confirmed - Biashara Hub`,
            html: emailHtml,
          })
          .then(() => console.log(`[Subscriber] Email sent for #${orderDisplayId} to ${order.email}.`))
          .catch((err: unknown) =>
            console.error(`[Subscriber] Email failed for #${orderDisplayId}:`, err)
          )
      )
    } else {
      console.warn('[Subscriber] RESEND_API_KEY is not configured. Email confirmation skipped.')
    }

    // ── 2. SMS confirmation via Africa's Talking ─────────────────────────
    const customerPhone = order.shipping_address?.phone
    if (customerPhone) {
      const smsMessage = `Thank you for your order #${orderDisplayId} at Biashara Hub! Amount: ${formattedTotal}. We are processing it and will notify you when shipped.`
      notificationTasks.push(
        sendSMS(customerPhone, smsMessage)
          .then(() => console.log(`[Subscriber] SMS sent for #${orderDisplayId} to ${customerPhone}.`))
          .catch((err: unknown) =>
            console.error(`[Subscriber] SMS failed for #${orderDisplayId}:`, err)
          )
      )
    } else {
      console.warn('[Subscriber] Customer has no phone number. SMS skipped.')
    }

    // Wait for all tasks; allSettled never rejects so errors are only logged above
    await Promise.allSettled(notificationTasks)

  } catch (error) {
    console.error(`[Subscriber] Error processing order.placed for ${orderId}:`, error)
  }
}

export const config = {
  event: "order.placed",
}
