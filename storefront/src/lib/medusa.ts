import Medusa from "@medusajs/js-sdk"

// ── Critical: validate that the publishable key is set at module load time ──
// Without this key every store API call will fail, including on the server.
// Fail loudly at startup rather than silently failing at request time.
if (!process.env.NEXT_PUBLIC_MEDUSA_PUBLISHABLE_KEY) {
  // In the browser we warn (cannot throw without breaking the page).
  // On the server (SSR / RSC) we throw so CI/CD catches it before deployment.
  if (typeof window === "undefined") {
    throw new Error(
      "[Biashara Hub] NEXT_PUBLIC_MEDUSA_PUBLISHABLE_KEY is not set. " +
      "All Medusa store API calls will fail. " +
      "Set this variable in your storefront .env file before building or starting the server."
    )
  } else {
    console.error(
      "[Biashara Hub] NEXT_PUBLIC_MEDUSA_PUBLISHABLE_KEY is not set. " +
      "Store API calls will fail. Set this in your storefront .env file."
    )
  }
}

export const medusa = new Medusa({
  baseUrl: process.env.NEXT_PUBLIC_MEDUSA_BACKEND_URL || "http://localhost:9000",
  // The key check above ensures this is a real string on the server.
  // The client-side warning above handles browser contexts gracefully.
  publishableKey: process.env.NEXT_PUBLIC_MEDUSA_PUBLISHABLE_KEY ?? "",
})
