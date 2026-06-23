"use client"

/* eslint-disable @typescript-eslint/no-explicit-any */

import React, { useState, useEffect } from "react"
import Link from "next/link"
import Image from "next/image"
import { Heart, ShoppingCart, Trash2, ArrowRight } from "lucide-react"
import { formatKES } from "@/lib/formatters"
import { useCart } from "@/context/CartContext"

export default function WishlistPage() {
  const [wishlist, setWishlist] = useState<any[]>([])
  const { addToCart, isLoading } = useCart()

  // Load wishlist from local storage on mount
  useEffect(() => {
    if (typeof window !== "undefined") {
      const stored = localStorage.getItem("wishlist")
      if (stored) {
        try {
          setWishlist(JSON.parse(stored))
        } catch (e) {
          console.error("Failed to parse wishlist:", e)
        }
      }
    }
  }, [])

  const removeFromWishlist = (productId: string) => {
    const updated = wishlist.filter((item) => item.id !== productId)
    setWishlist(updated)
    if (typeof window !== "undefined") {
      localStorage.setItem("wishlist", JSON.stringify(updated))
    }
  }

  const handleAddToCart = async (item: any) => {
    const variantId = item.variants?.[0]?.id
    if (variantId) {
      await addToCart(variantId, 1)
      // Optional: remove from wishlist upon adding to cart
      // removeFromWishlist(item.id);
    }
  }

  return (
    <div className="flex-1 bg-background py-12">
      <div className="max-w-[1200px] mx-auto px-4">
        
        {/* Header */}
        <div className="mb-10 text-center md:text-left">
          <span className="text-xs font-semibold text-gold tracking-wider uppercase">
            My Collection
          </span>
          <h1 className="text-3xl font-bold tracking-tight text-text mt-1">
            My Wishlist
          </h1>
          <p className="text-muted text-sm mt-1">
            Keep track of items you love and buy them anytime.
          </p>
        </div>

        {wishlist.length > 0 ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-6">
            {wishlist.map((item) => {
              const firstVariant = item.variants?.[0]
              const price = firstVariant?.prices?.find((p: any) => p.currency_code.toLowerCase() === "kes")?.amount 
                || firstVariant?.prices?.[0]?.amount 
                || 0

              return (
                <div
                  key={item.id}
                  className="group flex flex-col bg-white rounded-xl overflow-hidden border border-border transition-all duration-200 hover:scale-[1.02] hover:shadow-elevated relative"
                  style={{ boxShadow: "0 4px 12px rgba(0,0,0,0.05)" }}
                >
                  {/* Remove Button Overlay */}
                  <button
                    onClick={() => removeFromWishlist(item.id)}
                    className="absolute top-3 right-3 z-10 w-8 h-8 rounded-full bg-white/80 hover:bg-white text-danger border border-border flex items-center justify-center cursor-pointer shadow-sm transition-all hover:scale-105"
                    title="Remove from Wishlist"
                  >
                    <Trash2 size={14} />
                  </button>

                  {/* Thumbnail */}
                  <Link href={`/p/${item.handle}`} className="relative aspect-square w-full bg-surface overflow-hidden block">
                    {item.thumbnail ? (
                      <Image
                        src={item.thumbnail}
                        alt={item.title}
                        fill
                        sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 25vw"
                        className="object-cover transition-transform duration-300 group-hover:scale-105"
                      />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center text-muted text-xs">
                        No image
                      </div>
                    )}
                  </Link>

                  {/* Info */}
                  <div className="p-4 flex flex-col flex-1">
                    <Link href={`/p/${item.handle}`} className="block group-hover:text-primary transition-colors">
                      <h3 className="text-text font-medium text-sm leading-snug line-clamp-2 min-h-[40px]">
                        {item.title}
                      </h3>
                    </Link>

                    <div className="mt-auto pt-4 flex flex-col gap-3">
                      <div className="flex items-baseline">
                        <span className="text-primary font-bold text-base">
                          {formatKES(price)}
                        </span>
                      </div>

                      <button
                        type="button"
                        onClick={() => handleAddToCart(item)}
                        disabled={isLoading || !firstVariant?.id}
                        className="w-full h-10 bg-primary hover:bg-navy text-white text-xs font-semibold rounded-lg transition-colors duration-200 cursor-pointer flex items-center justify-center gap-1.5 disabled:opacity-50"
                      >
                        <ShoppingCart size={14} />
                        Add to Cart
                      </button>
                    </div>
                  </div>
                </div>
              )
            })}
          </div>
        ) : (
          <div className="bg-white rounded-2xl p-16 border border-border text-center flex flex-col items-center justify-center max-w-xl mx-auto">
            <div className="w-16 h-16 rounded-full bg-surface border border-border flex items-center justify-center text-muted mb-4">
              <Heart size={28} className="text-muted/60" />
            </div>
            <h3 className="text-text font-bold text-base">Your Wishlist is Empty</h3>
            <p className="text-muted text-xs mt-1 max-w-xs leading-relaxed">
              Explore the catalog and tap the heart icon on any product to save it here for later.
            </p>
            <Link
              href="/shop"
              className="mt-6 h-11 px-6 bg-primary hover:bg-navy text-white text-xs font-semibold rounded-xl flex items-center justify-center gap-2 shadow-md transition-colors"
            >
              Start Shopping
              <ArrowRight size={14} />
            </Link>
          </div>
        )}

      </div>
    </div>
  )
}
