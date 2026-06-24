"use client"

/* eslint-disable @typescript-eslint/no-explicit-any */

import React, { useEffect, useRef } from "react"
import { X, Trash2, Plus, Minus, ShoppingBag } from "lucide-react"
import Image from "next/image"
import Link from "next/link"
import { useCart } from "@/context/CartContext"
import { formatKES } from "@/lib/formatters"

export function CartDrawer() {
  const {
    cart,
    isCartDrawerOpen,
    setIsCartDrawerOpen,
    updateLineItem,
    removeLineItem,
    isLoading,
  } = useCart()

  const drawerRef = useRef<HTMLDivElement>(null)

  // Close drawer on escape key press
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        setIsCartDrawerOpen(false)
      }
    }
    if (isCartDrawerOpen) {
      document.addEventListener("keydown", handleKeyDown)
      document.body.style.overflow = "hidden" // Prevent body scroll
    }
    return () => {
      document.removeEventListener("keydown", handleKeyDown)
      document.body.style.overflow = ""
    }
  }, [isCartDrawerOpen, setIsCartDrawerOpen])

  // Close drawer if clicking outside the panel
  const handleBackdropClick = (e: React.MouseEvent) => {
    if (drawerRef.current && !drawerRef.current.contains(e.target as Node)) {
      setIsCartDrawerOpen(false)
    }
  }

  if (!isCartDrawerOpen) return null

  const items = cart?.items || []
  const subtotal = cart?.subtotal || 0

  return (
    <div 
      className="fixed inset-0 z-50 flex justify-end bg-black/50 backdrop-blur-sm transition-opacity duration-300"
      onClick={handleBackdropClick}
    >
      <div 
        ref={drawerRef}
        className="w-full max-w-md bg-white h-full flex flex-col shadow-elevated animate-slide-in-right relative"
      >
        {/* Header */}
        <div className="h-20 border-b border-border px-6 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <ShoppingBag size={20} className="text-primary" />
            <h2 className="text-text font-bold text-lg">Your Cart</h2>
            <span className="text-xs bg-surface text-muted border border-border px-2 py-0.5 rounded-full font-semibold">
              {items.length} {items.length === 1 ? "item" : "items"}
            </span>
          </div>
          <button 
            onClick={() => setIsCartDrawerOpen(false)}
            className="p-2 -mr-2 min-w-[44px] min-h-[44px] flex items-center justify-center text-text hover:text-primary transition-colors cursor-pointer"
          >
            <X size={20} />
          </button>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto p-6 space-y-6">
          {items.length === 0 ? (
            <div className="h-full flex flex-col items-center justify-center text-center p-6">
              <div className="w-16 h-16 rounded-full bg-surface border border-border flex items-center justify-center text-muted mb-4">
                <ShoppingBag size={28} />
              </div>
              <h3 className="text-text font-bold text-base">Your cart is empty</h3>
              <p className="text-muted text-xs mt-1 max-w-xs">
                Looks like you haven&apos;t added anything to your cart yet. Explore our categories to find awesome products!
              </p>
              <button
                onClick={() => setIsCartDrawerOpen(false)}
                className="mt-6 h-11 px-6 bg-primary hover:bg-navy text-white text-xs font-semibold rounded-sm transition-colors duration-200 cursor-pointer"
              >
                Start Shopping
              </button>
            </div>
          ) : (
            <div className="space-y-4">
              {items.map((item: any) => {
                const displayPrice = item.unit_price * item.quantity
                return (
                  <div 
                    key={item.id}
                    className="flex gap-4 p-4 border border-border rounded-md hover:border-primary/30 transition-all duration-200"
                  >
                    {/* Item Thumbnail */}
                    <div className="relative w-20 h-20 bg-surface rounded-md overflow-hidden flex-shrink-0">
                      {item.thumbnail ? (
                        <Image 
                          src={item.thumbnail}
                          alt={item.title}
                          fill
                          className="object-cover"
                        />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center text-muted text-[10px]">
                          No image
                        </div>
                      )}
                    </div>

                    {/* Item details */}
                    <div className="flex-1 flex flex-col justify-between min-w-0">
                      <div>
                        <h4 className="text-text font-semibold text-xs leading-snug line-clamp-2">
                          {item.title}
                        </h4>
                        {item.variant && (
                          <span className="text-[10px] text-muted font-medium mt-0.5 block truncate">
                            Variant: {item.variant.title}
                          </span>
                        )}
                      </div>

                      {/* Quantity selector & Delete */}
                      <div className="flex items-center justify-between mt-2">
                        <div className="flex items-center border border-border bg-surface rounded-sm h-8">
                          <button
                            onClick={() => updateLineItem(item.id, item.quantity - 1)}
                            disabled={isLoading}
                            className="w-8 h-full flex items-center justify-center text-text hover:text-primary disabled:opacity-50 cursor-pointer"
                          >
                            <Minus size={12} />
                          </button>
                          <span className="w-8 text-center text-xs font-semibold text-text">
                            {item.quantity}
                          </span>
                          <button
                            onClick={() => updateLineItem(item.id, item.quantity + 1)}
                            disabled={isLoading}
                            className="w-8 h-full flex items-center justify-center text-text hover:text-primary disabled:opacity-50 cursor-pointer"
                          >
                            <Plus size={12} />
                          </button>
                        </div>

                        <button
                          onClick={() => removeLineItem(item.id)}
                          disabled={isLoading}
                          className="p-1 text-muted hover:text-danger hover:bg-danger/10 rounded-md transition-all cursor-pointer"
                          title="Remove item"
                        >
                          <Trash2 size={16} />
                        </button>
                      </div>
                    </div>

                    {/* Item Price */}
                    <div className="flex flex-col items-end justify-between">
                      <span className="text-primary font-bold text-xs">
                        {formatKES(displayPrice)}
                      </span>
                    </div>
                  </div>
                )
              })}
            </div>
          )}
        </div>

        {/* Footer */}
        {items.length > 0 && (
          <div className="border-t border-border p-6 space-y-4 bg-surface rounded-b-none">
            <div className="flex justify-between items-center text-sm">
              <span className="text-muted font-medium">Subtotal</span>
              <span className="text-primary font-bold text-base">
                {formatKES(subtotal)}
              </span>
            </div>
            <p className="text-[10px] text-muted leading-relaxed">
              Shipping fees and taxes are calculated at checkout.
            </p>
            <div className="grid grid-cols-2 gap-3 mt-4">
              <Link
                href="/cart"
                onClick={() => setIsCartDrawerOpen(false)}
                className="h-12 border border-border hover:bg-white text-text hover:text-primary text-xs font-semibold rounded-sm flex items-center justify-center transition-colors cursor-pointer"
              >
                View Full Cart
              </Link>
              <Link
                href="/checkout"
                onClick={() => setIsCartDrawerOpen(false)}
                className="h-12 bg-primary hover:bg-[#0b3175] text-white text-xs font-semibold rounded-sm flex items-center justify-center transition-colors cursor-pointer"
              >
                Checkout Now
              </Link>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
