import Medusa from "@medusajs/js-sdk"

if (!process.env.NEXT_PUBLIC_MEDUSA_PUBLISHABLE_KEY && typeof window !== "undefined") {
  console.warn(
    "[Biashara Hub] NEXT_PUBLIC_MEDUSA_PUBLISHABLE_KEY is not set. " +
    "Store API calls will fail. Set this in your storefront .env file."
  )
}

export const medusa = new Medusa({
  baseUrl: process.env.NEXT_PUBLIC_MEDUSA_BACKEND_URL || "http://localhost:9000",
  publishableKey: process.env.NEXT_PUBLIC_MEDUSA_PUBLISHABLE_KEY!,
})
