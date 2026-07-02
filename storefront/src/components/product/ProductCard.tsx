"use client"

import React from "react"
import Image from "next/image"
import Link from "next/link"
import { Star, Heart } from "lucide-react"
import { formatKES } from "@/lib/formatters"
import { useCart } from "@/context/CartContext"
import { useWishlist, type WishlistItem } from "@/hooks/useWishlist"

interface ProductCardProps {
  product: {
    id: string
    title: string
    handle: string
    thumbnail?: string | null
    variants?: Array<{
      id: string
      prices?: Array<{
        amount: number
        currency_code: string
      }>
    }>
    metadata?: Record<string, any> | null
  }
  isNew?: boolean
  isSale?: boolean
}

export function ProductCard({ product, isNew, isSale }: ProductCardProps) {
  const { addToCart, isLoading } = useCart()
  const { isWishlisted, toggleWishlist } = useWishlist(product.id)
  const firstVariant = product.variants?.[0]
  const firstVariantId = firstVariant?.id

  const wishlistItem: WishlistItem = {
    id: product.id,
    title: product.title,
    handle: product.handle,
    thumbnail: product.thumbnail ?? null,
  }

  const handleToggleWishlist = (e: React.MouseEvent) => {
    e.preventDefault()
    e.stopPropagation()
    toggleWishlist(wishlistItem)
  }

  const getDisplayPrice = () => {
    if (!firstVariant) return 0
    const kesPrice = firstVariant.prices?.find((p) => p.currency_code.toLowerCase() === "kes")
    return kesPrice ? kesPrice.amount : firstVariant.prices?.[0]?.amount || 0
  }

  const price = getDisplayPrice()

  return (
    <Link
      href={`/p/${product.handle}`}
      className="group flex flex-col bg-white rounded-md overflow-hidden border border-border transition-all duration-200 hover:scale-[1.02] hover:shadow-ambient"
    >
      {/* Image container */}
      <div className="relative aspect-square w-full bg-surface overflow-hidden">
        {product.thumbnail ? (
          <Image
            src={product.thumbnail}
            alt={product.title}
            fill
            sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 25vw"
            className="object-cover transition-transform duration-300 group-hover:scale-105"
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center text-muted text-xs">
            No image
          </div>
        )}
        
        {/* Wishlist toggle button */}
        <button
          type="button"
          aria-label={isWishlisted ? "Remove from Wishlist" : "Add to Wishlist"}
          onClick={handleToggleWishlist}
          className="absolute top-3 right-3 z-10 w-8 h-8 rounded-full bg-white/80 hover:bg-white text-text border border-border flex items-center justify-center cursor-pointer transition-all hover:scale-105 hover:shadow-ambient"
        >
          <Heart size={14} className={isWishlisted ? "fill-danger text-danger" : "text-text"} />
        </button>
        
        {/* Badges */}
        <div className="absolute top-3 left-3 flex flex-col gap-1.5 z-10">
          {isSale && (
            <span className="bg-danger text-white text-[10px] font-bold tracking-wider uppercase px-2 py-0.5 rounded-md">
              Sale
            </span>
          )}
          {isNew && (
            <span className="bg-primary text-white text-[10px] font-bold tracking-wider uppercase px-2 py-0.5 rounded-md">
              New
            </span>
          )}
        </div>
      </div>

      {/* Info container */}
      <div className="p-4 flex flex-col flex-1">
        <h3 className="text-text font-medium text-sm leading-snug line-clamp-2 min-h-[40px] group-hover:text-primary transition-colors duration-200">
          {product.title}
        </h3>
        
        {/* Rating stars — only shown when the product has real rating metadata */}
        {(product.metadata?.rating_average || product.metadata?.review_count) && (
          <div className="flex items-center gap-1.5 mt-2 mb-3">
            {[1, 2, 3, 4, 5].map((star) => (
              <Star
                key={star}
                size={12}
                className={
                  star <= Math.round(Number(product.metadata?.rating_average ?? 0))
                    ? "fill-gold text-gold"
                    : "fill-muted/30 text-muted/30"
                }
              />
            ))}
            {product.metadata?.review_count && (
              <span className="text-[10px] text-muted font-medium">
                ({product.metadata.review_count})
              </span>
            )}
          </div>
        )}

        {/* Pricing & Add to Cart button */}
        <div className="mt-auto pt-2 flex flex-col gap-3">
          <div className="flex items-baseline gap-2">
            <span className="text-primary font-bold text-base">
              {formatKES(price)}
            </span>
          </div>
          
          <button 
            type="button"
            disabled={isLoading || !firstVariantId}
            className="w-full h-10 bg-primary hover:bg-navy text-white text-xs font-semibold rounded-sm transition-colors duration-200 cursor-pointer flex items-center justify-center disabled:opacity-50"
            onClick={(e) => {
              e.preventDefault()
              e.stopPropagation()
              if (firstVariantId) {
                addToCart(firstVariantId, 1)
              }
            }}
          >
            Add to Cart
          </button>
        </div>
      </div>
    </Link>
  )
}
