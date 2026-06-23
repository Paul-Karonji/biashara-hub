import posthog from "posthog-js"

/**
 * Tracks product view events in PostHog
 */
export function trackProductView(id: string, title: string, price: number) {
  if (typeof window !== "undefined") {
    const properties = { product_id: id, title, price: price / 100 }
    if (process.env.NEXT_PUBLIC_POSTHOG_KEY) {
      posthog.capture("product_viewed", properties)
    } else {
      console.log("[Analytics: MOCK] product_viewed:", properties)
    }
  }
}

/**
 * Tracks addition of item to shopping cart
 */
export function trackAddToCart(id: string, qty: number, price: number) {
  if (typeof window !== "undefined") {
    const properties = { product_id: id, quantity: qty, price: price / 100 }
    if (process.env.NEXT_PUBLIC_POSTHOG_KEY) {
      posthog.capture("add_to_cart", properties)
    } else {
      console.log("[Analytics: MOCK] add_to_cart:", properties)
    }
  }
}

/**
 * Tracks entry into checkout flow
 */
export function trackCheckoutStart(total: number) {
  if (typeof window !== "undefined") {
    const properties = { cart_total: total / 100 }
    if (process.env.NEXT_PUBLIC_POSTHOG_KEY) {
      posthog.capture("checkout_started", properties)
    } else {
      console.log("[Analytics: MOCK] checkout_started:", properties)
    }
  }
}

/**
 * Tracks selection of a payment method
 */
export function trackPaymentSelected(method: string) {
  if (typeof window !== "undefined") {
    const properties = { method }
    if (process.env.NEXT_PUBLIC_POSTHOG_KEY) {
      posthog.capture("payment_method_selected", properties)
    } else {
      console.log("[Analytics: MOCK] payment_method_selected:", properties)
    }
  }
}

/**
 * Tracks successful order completion
 */
export function trackOrderComplete(id: string, total: number, method: string) {
  if (typeof window !== "undefined") {
    const properties = { order_id: id, total: total / 100, payment_method: method }
    if (process.env.NEXT_PUBLIC_POSTHOG_KEY) {
      posthog.capture("order_completed", properties)
    } else {
      console.log("[Analytics: MOCK] order_completed:", properties)
    }
  }
}

/**
 * Tracks search query execution
 */
export function trackSearch(query: string, resultsCount: number) {
  if (typeof window !== "undefined") {
    const properties = { query, results_count: resultsCount }
    if (process.env.NEXT_PUBLIC_POSTHOG_KEY) {
      posthog.capture("search_performed", properties)
    } else {
      console.log("[Analytics: MOCK] search_performed:", properties)
    }
  }
}
