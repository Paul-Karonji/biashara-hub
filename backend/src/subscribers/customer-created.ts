import { SubscriberArgs } from "@medusajs/framework"
import { Resend } from "resend"

export default async function customerCreatedHandler({
  event: { data },
  container,
}: SubscriberArgs<{ id: string }>) {
  const customerId = data.id
  const query = container.resolve("query")

  console.log(`[Subscriber] Handling customer.created for customer: ${customerId}`)

  try {
    // Query customer details using Medusa v2 query helper
    const { data: [customer] } = await query.graph({
      entity: "customer",
      fields: ["id", "email", "first_name", "last_name"],
      filters: { id: customerId },
    })

    if (!customer) {
      console.error(`[Subscriber] Customer ${customerId} not found in database.`)
      return
    }

    if (!customer.email) {
      console.warn(`[Subscriber] Customer ${customerId} has no email address. Welcome email skipped.`)
      return
    }

    const resendApiKey = process.env.RESEND_API_KEY
    const senderEmail = process.env.SENDER_EMAIL || "orders@biasharahub.com"

    const customerName = `${customer.first_name || ""} ${customer.last_name || ""}`.trim() || "there"

    // ── Dispatch Welcome Email via Resend ─────────────────────────────
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
                  <p style="margin:0;color:#F4D57E;font-size:11px;font-weight:bold;letter-spacing:2px;text-transform:uppercase;">Welcome aboard</p>
                  <h1 style="margin:4px 0 0;color:#ffffff;font-size:20px;">Biashara Hub</h1>
                </td></tr>
                <!-- Body -->
                <tr><td style="padding:32px;">
                  <h2 style="color:#0A2D6B;margin:0 0 16px;">Welcome to Biashara Hub!</h2>
                  <p style="color:#64748B;margin:0 0 16px;">Hi ${customerName},</p>
                  <p style="color:#64748B;margin:0 0 16px;">We are thrilled to welcome you to Biashara Hub, your trusted online marketplace in Kenya.</p>
                  <p style="color:#64748B;margin:0 0 12px;font-weight:bold;">With your new account, you can:</p>
                  <ul style="color:#64748B;margin:0 0 24px;padding-left:20px;line-height:1.5;">
                    <li>Check out faster using M-Pesa STK Push.</li>
                    <li>Track your orders and nationwide delivery.</li>
                    <li>Save multiple delivery addresses for family and office.</li>
                  </ul>
                  <div style="margin:24px 0;text-align:center;">
                    <a href="${process.env.STORE_URL || "http://localhost:3000"}" style="background-color:#0F3D91;color:#ffffff;padding:12px 24px;text-decoration:none;font-weight:bold;border-radius:8px;display:inline-block;font-size:13px;">Start Shopping</a>
                  </div>
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

      console.log(`[Subscriber] Sending welcome email to ${customer.email}...`)
      await resend.emails.send({
        from: senderEmail,
        to: customer.email,
        subject: `Welcome to Biashara Hub!`,
        html: emailHtml,
      })
    } else {
      console.warn("[Subscriber] RESEND_API_KEY is not configured. Welcome email skipped.")
    }

  } catch (error) {
    console.error(`[Subscriber] Error processing customer.created for ${customerId}:`, error)
  }
}

export const config = {
  event: "customer.created",
}
