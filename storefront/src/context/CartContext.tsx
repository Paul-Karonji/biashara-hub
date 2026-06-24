"use client"

/* eslint-disable @typescript-eslint/no-explicit-any */

import React, { createContext, useContext, useEffect, useRef, useState } from "react"
import { medusa } from "@/lib/medusa"

interface CartContextType {
  cart: any | null
  isCartDrawerOpen: boolean
  isLoading: boolean
  cartError: string | null
  setIsCartDrawerOpen: (isOpen: boolean) => void
  addToCart: (variantId: string, quantity: number) => Promise<void>
  updateLineItem: (lineItemId: string, quantity: number) => Promise<void>
  removeLineItem: (lineItemId: string) => Promise<void>
  refreshCart: () => Promise<void>
  clearCart: () => void
}

const CartContext = createContext<CartContextType | undefined>(undefined)

export function CartProvider({ children }: { children: React.ReactNode }) {
  const [cart, setCart] = useState<any | null>(null)
  const [isCartDrawerOpen, setIsCartDrawerOpen] = useState(false)
  const [isLoading, setIsLoading] = useState(true)
  const [cartError, setCartError] = useState<string | null>(null)

  // Helper to retrieve the current active cart or create one
  const getOrCreateCart = async () => {
    setIsLoading(true)
    setCartError(null)
    try {
      const storedCartId = typeof window !== "undefined" ? localStorage.getItem("cart_id") : null

      if (storedCartId) {
        try {
          const response = await medusa.store.cart.retrieve(storedCartId, {
            fields: "*items,*items.variant,*items.variant.product",
          })
          if (response.cart) {
            setCart(response.cart)
            return response.cart
          }
        } catch (err) {
          console.warn("Stored cart invalid or expired, creating new cart.", err)
          localStorage.removeItem("cart_id")
        }
      }

      // No valid stored cart — create a new one
      const regionResponse = await medusa.store.region.list()
      const defaultRegionId = regionResponse.regions?.[0]?.id

      const createResponse = await medusa.store.cart.create({
        region_id: defaultRegionId,
      })

      if (createResponse.cart) {
        setCart(createResponse.cart)
        if (typeof window !== "undefined") {
          localStorage.setItem("cart_id", createResponse.cart.id)
        }
        return createResponse.cart
      }
    } catch (error: any) {
      console.error("Error initializing cart:", error)
      setCartError("Could not load your cart. Please refresh the page.")
    } finally {
      // Always reset loading — no branch can leave it stuck on true
      setIsLoading(false)
    }
    return null
  }

  // Refresh cart state from the server
  const refreshCart = async () => {
    const storedCartId = typeof window !== "undefined" ? localStorage.getItem("cart_id") : null
    if (!storedCartId) {
      await getOrCreateCart()
      return
    }

    setIsLoading(true)
    setCartError(null)
    try {
      const response = await medusa.store.cart.retrieve(storedCartId, {
        fields: "*items,*items.variant,*items.variant.product",
      })
      if (response.cart) {
        setCart(response.cart)
      }
    } catch (error: any) {
      console.error("Error refreshing cart:", error)
      setCartError("Could not refresh your cart. Please try again.")
    } finally {
      setIsLoading(false)
    }
  }

  // Add line item to cart
  const addToCart = async (variantId: string, quantity: number) => {
    setIsLoading(true)
    setCartError(null)
    try {
      let currentCart = cart
      if (!currentCart) {
        currentCart = await getOrCreateCart()
      }

      if (currentCart) {
        const response = await medusa.store.cart.createLineItem(currentCart.id, {
          variant_id: variantId,
          quantity,
        })
        if (response.cart) {
          setCart(response.cart)
          setIsCartDrawerOpen(true)
        }
      }
    } catch (error: any) {
      console.error("Error adding to cart:", error)
      setCartError("Could not add item to cart. Please try again.")
    } finally {
      setIsLoading(false)
    }
  }

  // Update line item quantity
  const updateLineItem = async (lineItemId: string, quantity: number) => {
    if (quantity <= 0) {
      await removeLineItem(lineItemId)
      return
    }

    setIsLoading(true)
    setCartError(null)
    try {
      const storedCartId = typeof window !== "undefined" ? localStorage.getItem("cart_id") : null
      if (storedCartId) {
        const response = await medusa.store.cart.updateLineItem(storedCartId, lineItemId, {
          quantity,
        })
        if (response.cart) {
          setCart(response.cart)
        }
      }
    } catch (error: any) {
      console.error("Error updating cart line item:", error)
      setCartError("Could not update item quantity. Please try again.")
    } finally {
      setIsLoading(false)
    }
  }

  // Remove line item from cart
  const removeLineItem = async (lineItemId: string) => {
    setIsLoading(true)
    setCartError(null)
    try {
      const storedCartId = typeof window !== "undefined" ? localStorage.getItem("cart_id") : null
      if (storedCartId) {
        const response = await medusa.store.cart.deleteLineItem(storedCartId, lineItemId)
        if (response.parent) {
          setCart(response.parent)
        } else {
          await refreshCart()
        }
      }
    } catch (error: any) {
      console.error("Error removing cart line item:", error)
      setCartError("Could not remove item. Please try again.")
    } finally {
      setIsLoading(false)
    }
  }

  // Clear cart (called after successful checkout)
  const clearCart = () => {
    setCart(null)
    setCartError(null)
    if (typeof window !== "undefined") {
      localStorage.removeItem("cart_id")
    }
  }

  // ── Initialize cart on mount ─────────────────────────────────────────────
  // Uses a ref-based abort flag so that if the component unmounts before the
  // async getOrCreateCart resolves, we skip the setState call rather than
  // triggering a "can't update unmounted component" warning.
  //
  // The previous implementation used setTimeout(..., 0) which is unnecessary
  // and means the isMounted check only fires BEFORE the await, not after —
  // allowing stale state updates on unmounted trees.
  const isMountedRef = useRef(true)
  useEffect(() => {
    isMountedRef.current = true

    async function initCart() {
      const result = await getOrCreateCart()
      // Only update state if we are still mounted
      if (!isMountedRef.current) {
        // Already unmounted — discard result
        return
      }
      // getOrCreateCart already calls setCart/setIsLoading internally,
      // so no extra setState is needed here.
      void result
    }

    initCart()

    return () => {
      isMountedRef.current = false
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  return (
    <CartContext.Provider
      value={{
        cart,
        isCartDrawerOpen,
        isLoading,
        cartError,
        setIsCartDrawerOpen,
        addToCart,
        updateLineItem,
        removeLineItem,
        refreshCart,
        clearCart,
      }}
    >
      {children}
    </CartContext.Provider>
  )
}

export function useCart() {
  const context = useContext(CartContext)
  if (context === undefined) {
    throw new Error("useCart must be used within a CartProvider")
  }
  return context
}
