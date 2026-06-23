"use client"

/* eslint-disable @typescript-eslint/no-explicit-any */

import React, { useState } from "react"
import Link from "next/link"
import Image from "next/image"
import { Trash2, Plus, Minus, ArrowRight, ShoppingBag, Tag } from "lucide-react"
import { useCart } from "@/context/CartContext"
import { formatKES } from "@/lib/formatters"
import { medusa } from "@/lib/medusa"

export default function CartPage() {
  const {
    cart,
    updateLineItem,
    removeLineItem,
    isLoading,
    refreshCart,
  } = useCart()

  const items = cart?.items || []
  const subtotal = cart?.subtotal || 0

  // Discount code state
  const [discountCode, setDiscountCode] = useState("")
  const [discountError, setDiscountError] = useState("")
  const [discountApplied, setDiscountApplied] = useState(false)
  const [isApplyingDiscount, setIsApplyingDiscount] = useState(false)

  const applyDiscount = async () => {
    if (!discountCode.trim() || !cart) return
    setIsApplyingDiscount(true)
    setDiscountError("")
    setDiscountApplied(false)
    try {
      await medusa.store.cart.update(cart.id, {
        promo_codes: [discountCode.trim().toUpperCase()],
      })
      await refreshCart()
      setDiscountApplied(true)
    } catch {
      setDiscountError("Invalid discount code. Please check and try again.")
    } finally {
      setIsApplyingDiscount(false)
    }
  }

  return (
    <div className="flex-1 bg-background py-12 md:py-20">
      <div className="max-w-[1200px] mx-auto px-4">
        
        <h1 className="text-2xl md:text-3xl font-bold tracking-tight text-text mb-8">
          Shopping Cart
        </h1>

        {items.length === 0 ? (
          <div className="bg-white rounded-2xl p-12 md:p-20 border border-border text-center flex flex-col items-center justify-center">
            <div className="w-16 h-16 rounded-full bg-surface border border-border flex items-center justify-center text-muted mb-4">
              <ShoppingBag size={28} />
            </div>
            <h2 className="text-text font-bold text-lg">Your cart is empty</h2>
            <p className="text-muted text-sm mt-1 max-w-xs">
              Looks like you haven&apos;t added any items to your cart yet. Browse our collections to find what you need.
            </p>
            <Link
              href="/shop"
              className="mt-8 h-12 px-6 bg-primary hover:bg-[#0b3175] text-white text-xs font-semibold rounded-xl flex items-center justify-center transition-colors shadow-lg cursor-pointer"
            >
              Start Shopping
            </Link>
          </div>
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 items-start">
            
            {/* Left Column: Line Items */}
            <div className="lg:col-span-2 space-y-4">
              <div className="bg-white rounded-2xl border border-border divide-y divide-border">
                {items.map((item: any) => {
                  const displayPrice = item.unit_price * item.quantity
                  return (
                    <div 
                      key={item.id}
                      className="p-6 flex flex-col sm:flex-row gap-6 items-start sm:items-center justify-between"
                    >
                      <div className="flex gap-4 items-center">
                        {/* Thumbnail */}
                        <div className="relative w-20 h-20 bg-surface rounded-xl overflow-hidden flex-shrink-0 border border-border">
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

                        {/* Details */}
                        <div>
                          <h3 className="text-text font-semibold text-sm leading-snug line-clamp-2">
                            {item.title}
                          </h3>
                          {item.variant && (
                            <span className="text-xs text-muted font-medium mt-1 block">
                              Variant: {item.variant.title}
                            </span>
                          )}
                          <span className="text-primary font-bold text-xs mt-2 block sm:hidden">
                            {formatKES(item.unit_price)}
                          </span>
                        </div>
                      </div>

                      {/* Quantity & Actions */}
                      <div className="flex items-center gap-6 w-full sm:w-auto justify-between sm:justify-end">
                        <div className="flex items-center border border-border bg-surface rounded-xl h-10">
                          <button
                            onClick={() => updateLineItem(item.id, item.quantity - 1)}
                            disabled={isLoading}
                            className="w-10 h-full flex items-center justify-center text-text hover:text-primary disabled:opacity-50 cursor-pointer"
                          >
                            <Minus size={12} />
                          </button>
                          <span className="w-10 text-center text-xs font-semibold text-text">
                            {item.quantity}
                          </span>
                          <button
                            onClick={() => updateLineItem(item.id, item.quantity + 1)}
                            disabled={isLoading}
                            className="w-10 h-full flex items-center justify-center text-text hover:text-primary disabled:opacity-50 cursor-pointer"
                          >
                            <Plus size={12} />
                          </button>
                        </div>

                        <div className="flex items-center gap-4">
                          <span className="text-primary font-bold text-sm hidden sm:block">
                            {formatKES(displayPrice)}
                          </span>
                          <button
                            onClick={() => removeLineItem(item.id)}
                            disabled={isLoading}
                            className="p-2 text-muted hover:text-danger hover:bg-danger/10 rounded-xl transition-all cursor-pointer"
                            title="Remove item"
                          >
                            <Trash2 size={18} />
                          </button>
                        </div>
                      </div>
                    </div>
                  )
                })}
              </div>
            </div>

            {/* Right Column: Order Summary */}
            <div className="bg-white rounded-2xl border border-border p-6 space-y-6">
              <h2 className="text-text font-bold text-base">Order Summary</h2>

              <div className="space-y-4 divide-y divide-border">
                <div className="flex justify-between items-center text-sm">
                  <span className="text-muted font-medium">Subtotal</span>
                  <span className="text-text font-bold">
                    {formatKES(subtotal)}
                  </span>
                </div>

                <div className="pt-4 flex justify-between items-center text-sm">
                  <span className="text-muted font-medium">Shipping</span>
                  <span className="text-xs text-muted">Calculated at checkout</span>
                </div>

                <div className="pt-4 flex justify-between items-center text-sm">
                  <span className="text-muted font-medium">VAT (16%)</span>
                  <span className="text-xs text-muted">Included in prices</span>
                </div>

                <div className="pt-4 flex justify-between items-center">
                  <span className="text-text font-bold text-sm">Total</span>
                  <span className="text-primary font-extrabold text-lg">
                    {formatKES(subtotal)}
                  </span>
                </div>
              </div>

              {/* Discount Code */}
              <div className="space-y-2 pt-2">
                <label className="text-xs font-semibold text-text flex items-center gap-1.5">
                  <Tag size={13} className="text-gold" />
                  Discount Code
                </label>
                <div className="flex gap-2">
                  <input
                    type="text"
                    placeholder="Enter code"
                    value={discountCode}
                    onChange={(e) => setDiscountCode(e.target.value.toUpperCase())}
                    onKeyDown={(e) => e.key === "Enter" && applyDiscount()}
                    className="flex-1 h-10 px-3 bg-surface border border-border rounded-xl text-xs outline-none focus:border-primary focus:ring-1 focus:ring-primary transition-all font-mono tracking-wider"
                  />
                  <button
                    onClick={applyDiscount}
                    disabled={isApplyingDiscount || !discountCode.trim()}
                    className="h-10 px-4 bg-primary hover:bg-navy text-white text-xs font-semibold rounded-xl transition-colors cursor-pointer disabled:opacity-50"
                  >
                    {isApplyingDiscount ? "..." : "Apply"}
                  </button>
                </div>
                {discountError && (
                  <p className="text-danger text-[10px] font-medium">{discountError}</p>
                )}
                {discountApplied && (
                  <p className="text-success text-[10px] font-medium">✓ Discount applied successfully!</p>
                )}
              </div>

              <p className="text-[10px] text-muted leading-relaxed">
                Enjoy hassle-free payment processing using M-Pesa STK Push. By proceeding, you agree to our Terms and Conditions.
              </p>

              <Link
                href="/checkout"
                className="h-12 w-full bg-primary hover:bg-[#0b3175] text-white text-xs font-semibold rounded-xl flex items-center justify-center gap-2 shadow-lg transition-colors cursor-pointer"
              >
                Proceed to Checkout
                <ArrowRight size={14} />
              </Link>

              <Link
                href="/shop"
                className="h-12 w-full bg-white hover:bg-surface text-muted border border-border text-xs font-semibold rounded-xl flex items-center justify-center transition-colors cursor-pointer"
              >
                Continue Shopping
              </Link>
            </div>

          </div>
        )}

      </div>
    </div>
  )
}
