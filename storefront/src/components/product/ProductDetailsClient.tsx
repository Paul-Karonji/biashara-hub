"use client"

/* eslint-disable @typescript-eslint/no-explicit-any */

import React, { useState, useEffect } from "react"
import Image from "next/image"
import { useRouter } from "next/navigation"
import { Star, ShieldCheck, Truck, RotateCcw, Headphones, Plus, Minus, ShoppingCart, Heart } from "lucide-react"
import { useCart } from "@/context/CartContext"
import { formatKES } from "@/lib/formatters"
import { trackProductView, trackAddToCart } from "@/lib/analytics"
import { useWishlist, type WishlistItem } from "@/hooks/useWishlist"

interface ProductDetailsClientProps {
  product: any
}

export function ProductDetailsClient({ product }: ProductDetailsClientProps) {
  const { addToCart, isLoading, setIsCartDrawerOpen } = useCart()
  const router = useRouter()
  const { isWishlisted, toggleWishlist } = useWishlist(product.id)

  const wishlistItem: WishlistItem = {
    id: product.id,
    title: product.title,
    handle: product.handle ?? null,
    thumbnail: product.thumbnail ?? null,
  }

  const variants = product.variants || []

  const [selectedVariant, setSelectedVariant] = useState<any>(variants[0] || null)
  const [quantity, setQuantity] = useState(1)
  const [activeImage, setActiveImage] = useState<string>(
    product.thumbnail || (product.images?.[0]?.url) || ""
  )

  // Track product view on mount
  useEffect(() => {
    if (product) {
      const price = selectedVariant
        ? selectedVariant.prices?.find((p: any) => p.currency_code.toLowerCase() === "kes")?.amount || selectedVariant.prices?.[0]?.amount || 0
        : product.variants?.[0]?.prices?.find((p: any) => p.currency_code.toLowerCase() === "kes")?.amount || product.variants?.[0]?.prices?.[0]?.amount || 0
      trackProductView(product.id, product.title, price)
    }
  }, [product.id, product.title])

  const handleVariantSelect = (variantId: string) => {
    const variant = variants.find((v: any) => v.id === variantId)
    if (variant) {
      setSelectedVariant(variant)
      if (variant.thumbnail) {
        setActiveImage(variant.thumbnail)
      }
    }
  }

  // Get price for the selected variant
  const getSelectedPrice = () => {
    if (!selectedVariant) return 0
    const prices = selectedVariant.prices || []
    const kesPrice = prices.find((p: any) => p.currency_code.toLowerCase() === "kes")
    return kesPrice ? kesPrice.amount : prices[0]?.amount || 0
  }

  const price = getSelectedPrice()

  const handleAddToCart = async () => {
    if (selectedVariant) {
      const price = selectedVariant.prices?.find((p: any) => p.currency_code.toLowerCase() === "kes")?.amount || selectedVariant.prices?.[0]?.amount || 0
      trackAddToCart(product.id, quantity, price)
      await addToCart(selectedVariant.id, quantity)
    }
  }

  const handleBuyNow = async () => {
    if (selectedVariant) {
      const price = selectedVariant.prices?.find((p: any) => p.currency_code.toLowerCase() === "kes")?.amount || selectedVariant.prices?.[0]?.amount || 0
      trackAddToCart(product.id, quantity, price)
      await addToCart(selectedVariant.id, quantity)
      setIsCartDrawerOpen(false) // Close drawer if it opened automatically
      router.push("/checkout")
    }
  }

  const allImages = product.images || []
  const hasMultipleImages = allImages.length > 1 || (product.thumbnail && allImages.length > 0)

  return (
    <div className="max-w-[1200px] mx-auto px-4 py-8 md:py-16">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-8 md:gap-16">
        
        {/* Left Column: Image Gallery */}
        <div className="space-y-4">
          <div className="relative aspect-square w-full bg-surface rounded-2xl overflow-hidden border border-border">
            {activeImage ? (
              <Image
                src={activeImage}
                alt={product.title}
                fill
                priority
                sizes="(max-width: 768px) 100vw, 50vw"
                className="object-cover transition-all duration-300"
              />
            ) : (
              <div className="w-full h-full flex items-center justify-center text-muted">
                No image available
              </div>
            )}
          </div>

          {/* Thumbnails */}
          {hasMultipleImages && (
            <div className="flex gap-3 overflow-x-auto pb-2 scrollbar-thin">
              {product.thumbnail && (
                <button
                  onClick={() => setActiveImage(product.thumbnail)}
                  className={`relative w-20 h-20 bg-surface rounded-xl overflow-hidden border flex-shrink-0 cursor-pointer ${
                    activeImage === product.thumbnail ? "border-primary ring-2 ring-primary/20" : "border-border hover:border-muted"
                  }`}
                >
                  <Image
                    src={product.thumbnail}
                    alt="Thumbnail"
                    fill
                    className="object-cover"
                  />
                </button>
              )}
              {allImages.map((img: any, idx: number) => {
                if (img.url === product.thumbnail) return null // avoid duplicates
                return (
                  <button
                    key={img.id || idx}
                    onClick={() => setActiveImage(img.url)}
                    className={`relative w-20 h-20 bg-surface rounded-xl overflow-hidden border flex-shrink-0 cursor-pointer ${
                      activeImage === img.url ? "border-primary ring-2 ring-primary/20" : "border-border hover:border-muted"
                    }`}
                  >
                    <Image
                      src={img.url}
                      alt={`Thumbnail ${idx + 1}`}
                      fill
                      className="object-cover"
                    />
                  </button>
                )
              })}
            </div>
          )}
        </div>

        {/* Right Column: Product Info & Actions */}
        <div className="flex flex-col justify-between">
          <div className="space-y-6">
            {/* Title & Metadata */}
            <div>
              <span className="text-xs font-semibold text-gold tracking-wider uppercase">
                {product.categories?.[0]?.name || "Catalog"}
              </span>
              <h1 className="text-2xl md:text-4xl font-bold tracking-tight text-text mt-1">
                {product.title}
              </h1>
              {/* Rating stars — only shown when the product has real rating metadata */}
              {(product.metadata?.rating_average || product.metadata?.review_count) && (
                <div className="flex items-center gap-2 mt-3">
                  <div className="flex items-center gap-0.5">
                    {[1, 2, 3, 4, 5].map((star) => (
                      <Star
                        key={star}
                        size={16}
                        className={
                          star <= Math.round(Number(product.metadata?.rating_average ?? 0))
                            ? "fill-gold text-gold"
                            : "fill-muted/30 text-muted/30"
                        }
                      />
                    ))}
                  </div>
                  {product.metadata?.review_count && (
                    <span className="text-xs text-muted font-medium">
                      ({product.metadata.review_count} reviews)
                    </span>
                  )}
                </div>
              )}
            </div>

            {/* Price + Inventory-aware stock badge */}
            <div className="border-y border-border py-4 flex items-baseline gap-3">
              <span className="text-2xl md:text-3xl font-extrabold text-primary">
                {formatKES(price)}
              </span>
              {(() => {
                const firstVariant = variants[0]
                if (!firstVariant) return null
                const manages = firstVariant.manage_inventory
                const qty = firstVariant.inventory_quantity ?? null
                if (!manages) {
                  // Inventory not tracked — show neutral badge
                  return (
                    <span className="text-xs text-muted bg-surface border border-border px-2 py-1 rounded-md font-semibold">
                      Check Availability
                    </span>
                  )
                }
                if (qty === null || qty === undefined) return null
                if (qty <= 0) {
                  return (
                    <span className="text-xs text-red-600 bg-red-50 border border-red-200 px-2 py-1 rounded-md font-semibold">
                      Out of Stock
                    </span>
                  )
                }
                if (qty <= 5) {
                  return (
                    <span className="text-xs text-amber-600 bg-amber-50 border border-amber-200 px-2 py-1 rounded-md font-semibold">
                      Low Stock — {qty} left
                    </span>
                  )
                }
                return (
                  <span className="text-xs text-green-700 bg-green-50 border border-green-200 px-2 py-1 rounded-md font-semibold">
                    In Stock &amp; Ready to Ship
                  </span>
                )
              })()}
            </div>

            {/* Variants selection */}
            {variants.length > 1 && (
              <div className="space-y-3">
                <h3 className="text-xs font-bold text-text uppercase tracking-wider">
                  Select Options
                </h3>
                <div className="flex flex-wrap gap-3">
                  {variants.map((v: any) => (
                    <button
                      key={v.id}
                      onClick={() => handleVariantSelect(v.id)}
                      className={`h-11 px-4 text-xs font-semibold rounded-xl border flex items-center justify-center transition-all cursor-pointer ${
                        selectedVariant?.id === v.id
                          ? "border-primary bg-primary/5 text-primary ring-2 ring-primary/10"
                          : "border-border bg-white text-text hover:border-muted"
                      }`}
                    >
                      {v.title}
                    </button>
                  ))}
                </div>
              </div>
            )}

            {/* Quantity Selector & Action buttons */}
            <div className="space-y-4 pt-2">
              <h3 className="text-xs font-bold text-text uppercase tracking-wider">
                Quantity
              </h3>
              <div className="flex flex-wrap items-center gap-4">
                <div className="flex items-center border border-border bg-surface rounded-xl h-12">
                  <button
                    onClick={() => setQuantity(Math.max(1, quantity - 1))}
                    disabled={isLoading}
                    className="w-12 h-full flex items-center justify-center text-text hover:text-primary disabled:opacity-50 cursor-pointer"
                  >
                    <Minus size={14} />
                  </button>
                  <span className="w-12 text-center text-sm font-semibold text-text">
                    {quantity}
                  </span>
                  <button
                    onClick={() => setQuantity(quantity + 1)}
                    disabled={isLoading}
                    className="w-12 h-full flex items-center justify-center text-text hover:text-primary disabled:opacity-50 cursor-pointer"
                  >
                    <Plus size={14} />
                  </button>
                </div>

                <button
                  onClick={handleAddToCart}
                  disabled={isLoading || !selectedVariant}
                  className="flex-1 min-w-[200px] h-12 bg-primary hover:bg-[#0b3175] text-white text-sm font-semibold rounded-xl flex items-center justify-center gap-2 shadow-lg transition-colors cursor-pointer disabled:opacity-50"
                >
                  <ShoppingCart size={18} />
                  Add to Cart
                </button>

                <button
                  type="button"
                  onClick={() => toggleWishlist(wishlistItem)}
                  className="h-12 w-12 border border-border bg-white hover:border-muted text-text rounded-xl flex items-center justify-center cursor-pointer transition-all shadow-sm flex-shrink-0"
                  title={isWishlisted ? "Remove from Wishlist" : "Add to Wishlist"}
                >
                  <Heart size={20} className={isWishlisted ? "fill-danger text-danger" : "text-text"} />
                </button>
              </div>

              <button
                onClick={handleBuyNow}
                disabled={isLoading || !selectedVariant}
                className="w-full h-12 bg-white hover:bg-surface text-primary border border-primary text-sm font-semibold rounded-xl flex items-center justify-center transition-all shadow-sm cursor-pointer disabled:opacity-50 mt-2"
              >
                Buy It Now
              </button>
            </div>
            
            {/* Description */}
            {product.description && (
              <div className="pt-6 border-t border-border space-y-2">
                <h3 className="text-xs font-bold text-text uppercase tracking-wider">
                  Product Description
                </h3>
                <p className="text-muted text-sm leading-relaxed whitespace-pre-wrap">
                  {product.description}
                </p>
              </div>
            )}
          </div>

          {/* Trust Indicators */}
          <div className="mt-8 grid grid-cols-2 gap-4 border-t border-border pt-6">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-full bg-gold-light/20 flex items-center justify-center text-gold flex-shrink-0">
                <ShieldCheck size={18} />
              </div>
              <div>
                <h4 className="text-text font-bold text-xs">M-Pesa STK Push</h4>
                <p className="text-[10px] text-muted">Secure local payment</p>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-full bg-gold-light/20 flex items-center justify-center text-gold flex-shrink-0">
                <Truck size={18} />
              </div>
              <div>
                <h4 className="text-text font-bold text-xs">Nationwide Delivery</h4>
                <p className="text-[10px] text-muted">Doorstep courier delivery</p>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-full bg-gold-light/20 flex items-center justify-center text-gold flex-shrink-0">
                <RotateCcw size={18} />
              </div>
              <div>
                <h4 className="text-text font-bold text-xs">Easy Returns</h4>
                <p className="text-[10px] text-muted">Hassle-free policy</p>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-full bg-gold-light/20 flex items-center justify-center text-gold flex-shrink-0">
                <Headphones size={18} />
              </div>
              <div>
                <h4 className="text-text font-bold text-xs">Local Customer Support</h4>
                <p className="text-[10px] text-muted">Nairobi-based team</p>
              </div>
            </div>
          </div>

        </div>

      </div>
    </div>
  )
}
