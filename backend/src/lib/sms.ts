// Type-checked via src/types/africastalking.d.ts — no @ts-ignore needed
import AfricasTalking from 'africastalking'

/**
 * Normalizes a Kenyan phone number into E.164 format (+254...)
 * E.g., 0712345678 -> +254712345678
 *       0112345678 -> +254112345678
 *       254712345678 -> +254712345678
 */
export function normalizePhoneNumber(phone: string): string {
  // Remove whitespace and standard symbols
  let sanitized = phone.replace(/[\s\-\(\)\+]/g, "")

  // If starts with 254..., prepend +
  if (sanitized.startsWith("254") && sanitized.length === 12) {
    return "+" + sanitized
  }

  // If starts with 07... or 01... and has 10 digits
  if ((sanitized.startsWith("07") || sanitized.startsWith("01")) && sanitized.length === 10) {
    return "+254" + sanitized.substring(1)
  }

  // If starts with 7... or 1... and has 9 digits
  if ((sanitized.startsWith("7") || sanitized.startsWith("1")) && sanitized.length === 9) {
    return "+254" + sanitized
  }

  // Fallback to original
  return phone.startsWith("+") ? phone : "+" + phone
}

/**
 * Dispatches an SMS via Africa's Talking API
 */
export async function sendSMS(to: string, message: string): Promise<{ success: boolean; data?: any; error?: any }> {
  const apiKey = process.env.AFRICASTALKING_API_KEY
  const username = process.env.AFRICASTALKING_USERNAME
  const senderId = process.env.AFRICASTALKING_SENDER_ID || undefined

  if (!apiKey || !username) {
    console.warn("[SMS] Africa's Talking credentials not configured. Logging message to console:")
    console.warn(`[SMS to ${normalizePhoneNumber(to)}]: ${message}`)
    return { success: false, error: "Credentials missing" }
  }

  try {
    const at = AfricasTalking({
      apiKey,
      username,
    })

    const normalizedPhone = normalizePhoneNumber(to)
    const sms = at.SMS

    const options: any = {
      to: [normalizedPhone],
      message,
    }

    if (senderId) {
      options.from = senderId
    }

    console.log(`[SMS] Initiating SMS delivery to ${normalizedPhone}...`)
    const response = await sms.send(options)
    console.log(`[SMS] Africa's Talking response:`, JSON.stringify(response))
    return { success: true, data: response }
  } catch (error) {
    console.error(`[SMS] Error delivering SMS to ${to}:`, error)
    return { success: false, error }
  }
}
