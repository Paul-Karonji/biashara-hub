/**
 * Shared TypeScript interfaces for cart and commerce data.
 * Replaces `any` suppressions across cart-related components.
 */

export interface CartLineItem {
  id: string
  title: string
  quantity: number
  unit_price: number
  thumbnail?: string | null
  variant?: {
    id: string
    title: string
  }
}

export interface CartShippingAddress {
  first_name?: string
  last_name?: string
  address_1?: string
  city?: string
  phone?: string
  country_code?: string
}

export interface CartShippingMethod {
  id: string
  shipping_option_id: string
  name?: string
  amount?: number
}

export interface CartData {
  id: string
  items: CartLineItem[]
  subtotal: number
  total: number
  shipping_total: number
  email?: string
  shipping_address?: CartShippingAddress
  shipping_methods?: CartShippingMethod[]
  promo_codes?: string[]
  region_id?: string
}

export interface OrderItem {
  id: string
  title: string
  quantity: number
  unit_price: number
  thumbnail?: string | null
  variant?: {
    id: string
    title: string
  }
}

export interface OrderData {
  id: string
  display_id?: number
  email?: string
  status: string
  fulfillment_status?: string
  total: number
  subtotal?: number
  shipping_total?: number
  items?: OrderItem[]
  shipping_address?: CartShippingAddress
  shipping_methods?: CartShippingMethod[]
}
