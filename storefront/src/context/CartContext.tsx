"use client"

/* eslint-disable @typescript-eslint/no-explicit-any */

import React, { createContext, useContext, useEffect, useState } from "react"
import { medusa } from "@/lib/medusa"

interface CartContextType {
  cart: any | null
  isCartDrawerOpen: boolean
  isLoading: boolean
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

  // Helper to retrieve the current active cart or create one
  const getOrCreateCart = async () => {
    setIsLoading(true)
    try {
      const storedCartId = typeof window !== "undefined" ? localStorage.getItem("cart_id") : null

      if (storedCartId) {
        try {
          const response = await medusa.store.cart.retrieve(storedCartId, {
            fields: "*items,*items.variant,*items.variant.product",
          })
          if (response.cart) {
            setCart(response.cart)
            setIsLoading(false)
            return response.cart
          }
        } catch (err) {
          console.warn("Stored cart invalid or expired, creating new cart.", err)
          localStorage.removeItem("cart_id")
        }
      }

      // If no valid stored cart, query regions and create cart
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
        setIsLoading(false)
        return createResponse.cart
      }
    } catch (error) {
      console.error("Error initializing cart:", error)
    }
    setIsLoading(false)
    return null
  }

  // Refresh cart state
  const refreshCart = async () => {
    const storedCartId = typeof window !== "undefined" ? localStorage.getItem("cart_id") : null
    if (!storedCartId) {
      await getOrCreateCart()
      return
    }

    setIsLoading(true)
    try {
      const response = await medusa.store.cart.retrieve(storedCartId, {
        fields: "*items,*items.variant,*items.variant.product",
      })
      if (response.cart) {
        setCart(response.cart)
      }
    } catch (error) {
      console.error("Error refreshing cart:", error)
    }
    setIsLoading(false)
  }

  // Add line item to cart
  const addToCart = async (variantId: string, quantity: number) => {
    setIsLoading(true)
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
          setIsCartDrawerOpen(true) // Open drawer on addition
        }
      }
    } catch (error) {
      console.error("Error adding to cart:", error)
    }
    setIsLoading(false)
  }

  // Update line item quantity
  const updateLineItem = async (lineItemId: string, quantity: number) => {
    if (quantity <= 0) {
      await removeLineItem(lineItemId)
      return
    }
    
    setIsLoading(true)
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
    } catch (error) {
      console.error("Error updating cart line item:", error)
    }
    setIsLoading(false)
  }

  // Remove line item from cart
  const removeLineItem = async (lineItemId: string) => {
    setIsLoading(true)
    try {
      const storedCartId = typeof window !== "undefined" ? localStorage.getItem("cart_id") : null
      if (storedCartId) {
        const response = await medusa.store.cart.deleteLineItem(storedCartId, lineItemId)
        if (response.parent) {
          setCart(response.parent)
        } else {
          // Fallback retrieve
          await refreshCart()
        }
      }
    } catch (error) {
      console.error("Error removing cart line item:", error)
    }
    setIsLoading(false)
  }

  // Clear cart (e.g. after checkout completion)
  const clearCart = () => {
    setCart(null)
    if (typeof window !== "undefined") {
      localStorage.removeItem("cart_id")
    }
  }

  // Initialize cart on mount
  useEffect(() => {
    let isMounted = true
    const init = () => {
      setTimeout(async () => {
        if (isMounted) {
          await getOrCreateCart()
        }
      }, 0)
    }
    init()
    return () => {
      isMounted = false
    }
  }, [])

  return (
    <CartContext.Provider
      value={{
        cart,
        isCartDrawerOpen,
        isLoading,
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
